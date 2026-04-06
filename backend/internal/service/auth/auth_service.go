package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	emailsvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/email"
	"golang.org/x/crypto/bcrypt"
)

type service struct {
	repo     domain.UserRepository
	emailSvc *emailsvc.Service
}

func NewAuthService(repo domain.UserRepository, emailSvc *emailsvc.Service) domain.UserService {
	return &service{repo: repo, emailSvc: emailSvc}
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

func (srv *service) DeleteUser(ctx context.Context, userID int64) error {
	return srv.repo.DeleteUser(ctx, userID)
}

func generateCode() (string, error) {
	b := make([]byte, 3)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", int(b[0])<<16|int(b[1])<<8|int(b[2])%1000000), nil
}

func (srv *service) RequestPasswordChange(ctx context.Context, userID int64, newPassword string) error {
	if len(newPassword) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	user, err := srv.repo.GetUser(ctx, userID)
	if err != nil {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	code, err := generateCode()
	if err != nil {
		return err
	}

	pcc := &domain.PasswordChangeCode{
		UserID:          userID,
		Code:            code,
		NewPasswordHash: string(hash),
		ExpiresAt:       time.Now().Add(10 * time.Minute),
	}
	if err := srv.repo.CreatePasswordChangeCode(ctx, pcc); err != nil {
		return err
	}

	return srv.emailSvc.SendCode(user.Email, code)
}

func (srv *service) ConfirmPasswordChange(ctx context.Context, userID int64, code string) error {
	pcc, err := srv.repo.GetPasswordChangeCode(ctx, userID, strings.TrimSpace(code))
	if err != nil {
		return err
	}

	if err := srv.repo.UpdatePassword(ctx, userID, pcc.NewPasswordHash); err != nil {
		return err
	}

	return srv.repo.MarkPasswordChangeCodeUsed(ctx, pcc.ID)
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func (srv *service) RequestPasswordReset(ctx context.Context, email string) error {
	user, err := srv.repo.GetByEmail(ctx, strings.TrimSpace(email))
	if err != nil {
		// Don't reveal if email exists
		return nil
	}

	token, err := generateToken()
	if err != nil {
		return err
	}

	prt := &domain.PasswordResetToken{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: time.Now().Add(30 * time.Minute),
	}
	if err := srv.repo.CreatePasswordResetToken(ctx, prt); err != nil {
		return err
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", frontendURL, token)

	return srv.emailSvc.SendResetLink(user.Email, resetLink)
}

func (srv *service) ResetPassword(ctx context.Context, token, newPassword string) error {
	if len(newPassword) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	prt, err := srv.repo.GetPasswordResetToken(ctx, strings.TrimSpace(token))
	if err != nil {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	if err := srv.repo.UpdatePassword(ctx, prt.UserID, string(hash)); err != nil {
		return err
	}

	return srv.repo.MarkPasswordResetTokenUsed(ctx, prt.ID)
}
