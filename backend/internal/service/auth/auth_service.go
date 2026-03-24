package service

import (
	"context"
	"errors"
	"strings"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

type service struct {
	repo domain.UserRepository
}

func NewAuthService(repo domain.UserRepository) domain.UserService {
	return &service{repo: repo}
}

func (srv *service) Register(ctx context.Context, u *domain.User) error {
	u.Username = strings.TrimSpace(u.Username)
	u.Email = strings.TrimSpace(u.Email)

	if u.Username == "" || u.Email == "" || u.PasswordHash == "" {
		return errors.New("username, email or password cannot be empty")
	}

	rawPassword := u.PasswordHash
	if len(rawPassword) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hash)

	return srv.repo.Register(ctx, u)
}

func (srv *service) Login(ctx context.Context, email, password string) (domain.User, error) {
	email = strings.TrimSpace(email)
	if email == "" || password == "" {
		return domain.User{}, errors.New("email and password are required")
	}

	user, err := srv.repo.GetByEmail(ctx, email)
	if err != nil {
		return domain.User{}, domain.ErrInvalidPassword
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return domain.User{}, domain.ErrInvalidPassword
	}

	return user, nil
}

func (srv *service) GetUser(ctx context.Context, userID int64) (domain.User, error) {
	return srv.repo.GetUser(ctx, userID)
}

func (srv *service) UpdateUser(ctx context.Context, u *domain.User) error {
	u.Username = strings.TrimSpace(u.Username)
	u.Email = strings.TrimSpace(u.Email)
	if u.Username == "" || u.Email == "" {
		return errors.New("username and email cannot be empty")
	}
	return srv.repo.UpdateUser(ctx, u)
}
