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

type UserRepository interface {
	Register(ctx context.Context, u *User) error
	GetByEmail(ctx context.Context, email string) (User, error)
	GetUser(ctx context.Context, userID int64) (User, error)
	UpdateUser(ctx context.Context, u *User) error
	ExpireSubscriptions(ctx context.Context) (int64, error)
}

type UserService interface {
	Register(ctx context.Context, u *User) error
	Login(ctx context.Context, email, password string) (User, error)
	GetUser(ctx context.Context, userID int64) (User, error)
	UpdateUser(ctx context.Context, u *User) error
}
