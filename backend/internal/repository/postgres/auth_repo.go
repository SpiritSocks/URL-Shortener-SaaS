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

func (aupo *AuthRepository) Register(ctx context.Context, u *domain.User) error {
	const q = `
        INSERT INTO users (user_name, email, password_hash, created_at, is_admin)
        VALUES ($1, $2, $3, NOW(), $4)
        RETURNING user_id
    `
	return aupo.Conn.QueryRowContext(
		ctx,
		q,
		u.Username,
		u.Email,
		u.PasswordHash,
		u.IsAdmin,
	).Scan(&u.ID)
}

func (aupo *AuthRepository) Login(ctx context.Context) error {
	return nil
}

func (aupo *AuthRepository) Logout(ctx context.Context) error { return nil }

func (aupo *AuthRepository) GetUser(ctx context.Context, userID int64) (domain.User, error) {
	return domain.User{}, nil
}
