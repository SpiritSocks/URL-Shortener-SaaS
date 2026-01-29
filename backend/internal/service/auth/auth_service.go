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

func (srv *service) Login(ctx context.Context) error {
	return nil
}

func (srv *service) Logout(ctx context.Context) error { return nil }

func (srv *service) GetUser(ctx context.Context, userID int64) (domain.User, error) {
	return domain.User{}, nil
}
