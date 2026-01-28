package postgres

import (
	"context"
	"database/sql"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type AuthRepository struct {
	Conn *sql.DB
}

func NewAuthRepository(conn *sql.DB) *AuthRepository {
	return &AuthRepository{Conn: conn}
}

func (aupo *AuthRepository) Register(ctx context.Context, u domain.User) (domain.User, error) {
	return domain.User{}, nil
}

func (aupo *AuthRepository) Login(ctx context.Context, email string, password string) (domain.User, error) {
	return domain.User{}, nil
}

func (aupo *AuthRepository) Logout(ctx context.Context) error { return nil }

func (aupo *AuthRepository) GetUser(ctx context.Context) (domain.User, error) {
	return domain.User{}, nil
}
