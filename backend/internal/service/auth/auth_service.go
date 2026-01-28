package service

import (
	"context"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type service struct {
	repo domain.UserRepository
}

func NewAuthService(repo domain.UserRepository) domain.UserService {
	return &service{repo: repo}
}

func (srv *service) Register(ctx context.Context, username, email, password string) (domain.User, error) {
	return domain.User{}, nil
}

func (srv *service) Login(ctx context.Context, email string, password string) (domain.User, error) {
	return domain.User{}, nil
}

func (srv *service) Logout(ctx context.Context) error { return nil }

func (srv *service) GetUser(ctx context.Context) (domain.User, error) {
	return domain.User{}, nil
}
