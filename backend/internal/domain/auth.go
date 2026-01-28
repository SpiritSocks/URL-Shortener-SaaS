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
	Register(ctx context.Context, u User) (User, error)
	Login(ctx context.Context, email string, password string) (User, error)
	Logout(ctx context.Context) error
	GetUser(ctx context.Context) (User, error)
}

type UserService interface {
	Register(ctx context.Context, username, email, password string) (User, error)
	Login(ctx context.Context, email string, password string) (User, error)
	Logout(ctx context.Context) error
	GetUser(ctx context.Context) (User, error)
}
