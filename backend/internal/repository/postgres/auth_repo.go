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

func (r *AuthRepository) Register(ctx context.Context, u *domain.User) error {
	const q = `
		INSERT INTO users (user_name, email, password_hash, created_at, is_admin)
		VALUES ($1, $2, $3, NOW(), $4)
		RETURNING user_id
	`
	return r.Conn.QueryRowContext(ctx, q,
		u.Username, u.Email, u.PasswordHash, u.IsAdmin,
	).Scan(&u.ID)
}

func (r *AuthRepository) GetByEmail(ctx context.Context, email string) (domain.User, error) {
	const q = `
		SELECT user_id, user_name, email, password_hash, created_at, is_admin, COALESCE(plan_id, 1)
		FROM users WHERE email = $1
	`
	var u domain.User
	err := r.Conn.QueryRowContext(ctx, q, email).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.CreatedAt, &u.IsAdmin, &u.PlanID,
	)
	if err == sql.ErrNoRows {
		return domain.User{}, domain.ErrUserNotFound
	}
	return u, err
}

func (r *AuthRepository) GetUser(ctx context.Context, userID int64) (domain.User, error) {
	const q = `
		SELECT user_id, user_name, email, password_hash, created_at, is_admin, COALESCE(plan_id, 1)
		FROM users WHERE user_id = $1
	`
	var u domain.User
	err := r.Conn.QueryRowContext(ctx, q, userID).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.CreatedAt, &u.IsAdmin, &u.PlanID,
	)
	if err == sql.ErrNoRows {
		return domain.User{}, domain.ErrUserNotFound
	}
	return u, err
}

func (r *AuthRepository) UpdateUser(ctx context.Context, u *domain.User) error {
	const q = `UPDATE users SET user_name = $1, email = $2, plan_id = COALESCE(NULLIF($3, 0), plan_id) WHERE user_id = $4`
	_, err := r.Conn.ExecContext(ctx, q, u.Username, u.Email, u.PlanID, u.ID)
	return err
}
