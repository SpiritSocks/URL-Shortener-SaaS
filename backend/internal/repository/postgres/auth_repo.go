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
		SELECT user_id, user_name, email, password_hash, created_at, is_admin, COALESCE(plan_id, 1), plan_expires_at
		FROM users WHERE email = $1
	`
	var u domain.User
	err := r.Conn.QueryRowContext(ctx, q, email).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.CreatedAt, &u.IsAdmin, &u.PlanID, &u.PlanExpiresAt,
	)
	if err == sql.ErrNoRows {
		return domain.User{}, domain.ErrUserNotFound
	}
	return u, err
}

func (r *AuthRepository) GetUser(ctx context.Context, userID int64) (domain.User, error) {
	const q = `
		SELECT user_id, user_name, email, password_hash, created_at, is_admin, COALESCE(plan_id, 1), plan_expires_at
		FROM users WHERE user_id = $1
	`
	var u domain.User
	err := r.Conn.QueryRowContext(ctx, q, userID).Scan(
		&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.CreatedAt, &u.IsAdmin, &u.PlanID, &u.PlanExpiresAt,
	)
	if err == sql.ErrNoRows {
		return domain.User{}, domain.ErrUserNotFound
	}
	return u, err
}

func (r *AuthRepository) UpdateUser(ctx context.Context, u *domain.User) error {
	const q = `UPDATE users SET user_name = $1, email = $2, plan_id = COALESCE(NULLIF($3, 0), plan_id), plan_expires_at = $4 WHERE user_id = $5`
	_, err := r.Conn.ExecContext(ctx, q, u.Username, u.Email, u.PlanID, u.PlanExpiresAt, u.ID)
	return err
}

func (r *AuthRepository) UpdatePassword(ctx context.Context, userID int64, passwordHash string) error {
	const q = `UPDATE users SET password_hash = $1 WHERE user_id = $2`
	_, err := r.Conn.ExecContext(ctx, q, passwordHash, userID)
	return err
}

func (r *AuthRepository) CreatePasswordChangeCode(ctx context.Context, code *domain.PasswordChangeCode) error {
	const q = `
		INSERT INTO password_change_codes (user_id, code, new_password_hash, expires_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`
	return r.Conn.QueryRowContext(ctx, q, code.UserID, code.Code, code.NewPasswordHash, code.ExpiresAt).Scan(&code.ID)
}

func (r *AuthRepository) GetPasswordChangeCode(ctx context.Context, userID int64, code string) (*domain.PasswordChangeCode, error) {
	const q = `
		SELECT id, user_id, code, new_password_hash, expires_at, used
		FROM password_change_codes
		WHERE user_id = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
		ORDER BY created_at DESC
		LIMIT 1
	`
	var c domain.PasswordChangeCode
	err := r.Conn.QueryRowContext(ctx, q, userID, code).Scan(
		&c.ID, &c.UserID, &c.Code, &c.NewPasswordHash, &c.ExpiresAt, &c.Used,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrInvalidCode
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *AuthRepository) MarkPasswordChangeCodeUsed(ctx context.Context, id int64) error {
	const q = `UPDATE password_change_codes SET used = TRUE WHERE id = $1`
	_, err := r.Conn.ExecContext(ctx, q, id)
	return err
}

func (r *AuthRepository) CreatePasswordResetToken(ctx context.Context, token *domain.PasswordResetToken) error {
	const q = `
		INSERT INTO password_reset_tokens (user_id, token, expires_at)
		VALUES ($1, $2, $3)
		RETURNING id
	`
	return r.Conn.QueryRowContext(ctx, q, token.UserID, token.Token, token.ExpiresAt).Scan(&token.ID)
}

func (r *AuthRepository) GetPasswordResetToken(ctx context.Context, token string) (*domain.PasswordResetToken, error) {
	const q = `
		SELECT id, user_id, token, expires_at, used
		FROM password_reset_tokens
		WHERE token = $1 AND used = FALSE AND expires_at > NOW()
		LIMIT 1
	`
	var t domain.PasswordResetToken
	err := r.Conn.QueryRowContext(ctx, q, token).Scan(&t.ID, &t.UserID, &t.Token, &t.ExpiresAt, &t.Used)
	if err == sql.ErrNoRows {
		return nil, domain.ErrInvalidCode
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *AuthRepository) MarkPasswordResetTokenUsed(ctx context.Context, id int64) error {
	const q = `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`
	_, err := r.Conn.ExecContext(ctx, q, id)
	return err
}

func (r *AuthRepository) DeleteUser(ctx context.Context, userID int64) error {
	_, err := r.Conn.ExecContext(ctx, `DELETE FROM users WHERE user_id = $1`, userID)
	return err
}

func (r *AuthRepository) ExpireSubscriptions(ctx context.Context) (int64, error) {
	const q = `
		UPDATE users
		SET plan_id = 1, plan_expires_at = NULL
		WHERE plan_expires_at IS NOT NULL AND plan_expires_at + INTERVAL '3 days' < NOW() AND plan_id != 1
	`
	res, err := r.Conn.ExecContext(ctx, q)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
