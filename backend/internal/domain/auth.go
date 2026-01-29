package domain

import (
	"context"
	"time"
)

type User struct {
	ID           int64
	Username     string
	Email        string
	PasswordHash string
	CreatedAt    time.Time
	IsAdmin      bool
}

type UserRepository interface {
	Register(ctx context.Context, u *User) error
	Login(ctx context.Context) error
	Logout(ctx context.Context) error
	GetUser(ctx context.Context, userID int64) (User, error)
}

type UserService interface {
	Register(ctx context.Context, u *User) error
	Login(ctx context.Context) error
	Logout(ctx context.Context) error
	GetUser(ctx context.Context, userID int64) (User, error)
}
