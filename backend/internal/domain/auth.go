package domain

import (
	"context"
	"time"
)

type User struct {
	ID            int64
	Username      string
	Email         string
	PasswordHash  string
	CreatedAt     time.Time
	IsAdmin       bool
	PlanID        int64
	PlanExpiresAt *time.Time
}

type PasswordChangeCode struct {
	ID              int64
	UserID          int64
	Code            string
	NewPasswordHash string
	ExpiresAt       time.Time
	Used            bool
}

type PasswordResetToken struct {
	ID        int64
	UserID    int64
	Token     string
	ExpiresAt time.Time
	Used      bool
}

type UserRepository interface {
	Register(ctx context.Context, u *User) error
	GetByEmail(ctx context.Context, email string) (User, error)
	GetUser(ctx context.Context, userID int64) (User, error)
	UpdateUser(ctx context.Context, u *User) error
	UpdatePassword(ctx context.Context, userID int64, passwordHash string) error
	DeleteUser(ctx context.Context, userID int64) error
	ExpireSubscriptions(ctx context.Context) (int64, error)
	CreatePasswordChangeCode(ctx context.Context, code *PasswordChangeCode) error
	GetPasswordChangeCode(ctx context.Context, userID int64, code string) (*PasswordChangeCode, error)
	MarkPasswordChangeCodeUsed(ctx context.Context, id int64) error
	CreatePasswordResetToken(ctx context.Context, token *PasswordResetToken) error
	GetPasswordResetToken(ctx context.Context, token string) (*PasswordResetToken, error)
	MarkPasswordResetTokenUsed(ctx context.Context, id int64) error
}

type UserService interface {
	Register(ctx context.Context, u *User) error
	Login(ctx context.Context, email, password string) (User, error)
	GetUser(ctx context.Context, userID int64) (User, error)
	UpdateUser(ctx context.Context, u *User) error
	DeleteUser(ctx context.Context, userID int64) error
	RequestPasswordChange(ctx context.Context, userID int64, newPassword string) error
	ConfirmPasswordChange(ctx context.Context, userID int64, code string) error
	RequestPasswordReset(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, token, newPassword string) error
}
