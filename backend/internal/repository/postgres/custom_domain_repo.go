package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type CustomDomainRepository struct {
	Conn *sql.DB
}

func NewCustomDomainRepository(conn *sql.DB) *CustomDomainRepository {
	return &CustomDomainRepository{Conn: conn}
}

func (r *CustomDomainRepository) Create(ctx context.Context, d *domain.CustomDomain) error {
	const q = `
		INSERT INTO custom_domains (user_id, domain, verified, ssl_status, created_at)
		VALUES ($1, $2, FALSE, 'pending', NOW())
		RETURNING id, created_at
	`
	return r.Conn.QueryRowContext(ctx, q, d.UserID, d.Domain).Scan(&d.ID, &d.CreatedAt)
}

func (r *CustomDomainRepository) GetByDomain(ctx context.Context, domainName string) (domain.CustomDomain, error) {
	const q = `SELECT id, user_id, domain, verified, ssl_status, created_at FROM custom_domains WHERE domain = $1`
	var d domain.CustomDomain
	err := r.Conn.QueryRowContext(ctx, q, domainName).Scan(
		&d.ID, &d.UserID, &d.Domain, &d.Verified, &d.SSLStatus, &d.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return domain.CustomDomain{}, domain.ErrDomainNotFound
	}
	if err != nil {
		return domain.CustomDomain{}, fmt.Errorf("failed to get custom domain: %w", err)
	}
	return d, nil
}

func (r *CustomDomainRepository) GetByID(ctx context.Context, id string) (domain.CustomDomain, error) {
	const q = `SELECT id, user_id, domain, verified, ssl_status, created_at FROM custom_domains WHERE id = $1`
	var d domain.CustomDomain
	err := r.Conn.QueryRowContext(ctx, q, id).Scan(
		&d.ID, &d.UserID, &d.Domain, &d.Verified, &d.SSLStatus, &d.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return domain.CustomDomain{}, domain.ErrDomainNotFound
	}
	if err != nil {
		return domain.CustomDomain{}, fmt.Errorf("failed to get custom domain: %w", err)
	}
	return d, nil
}

func (r *CustomDomainRepository) ListByUser(ctx context.Context, userID int64) ([]domain.CustomDomain, error) {
	const q = `SELECT id, user_id, domain, verified, ssl_status, created_at FROM custom_domains WHERE user_id = $1 ORDER BY created_at DESC`
	rows, err := r.Conn.QueryContext(ctx, q, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var domains []domain.CustomDomain
	for rows.Next() {
		var d domain.CustomDomain
		if err := rows.Scan(&d.ID, &d.UserID, &d.Domain, &d.Verified, &d.SSLStatus, &d.CreatedAt); err != nil {
			return nil, err
		}
		domains = append(domains, d)
	}
	return domains, rows.Err()
}

func (r *CustomDomainRepository) UpdateVerified(ctx context.Context, id string, verified bool) error {
	const q = `UPDATE custom_domains SET verified = $2 WHERE id = $1`
	res, err := r.Conn.ExecContext(ctx, q, id, verified)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return domain.ErrDomainNotFound
	}
	return nil
}

func (r *CustomDomainRepository) UpdateSSLStatus(ctx context.Context, id string, status string) error {
	const q = `UPDATE custom_domains SET ssl_status = $2 WHERE id = $1`
	res, err := r.Conn.ExecContext(ctx, q, id, status)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return domain.ErrDomainNotFound
	}
	return nil
}

func (r *CustomDomainRepository) Delete(ctx context.Context, id string, userID int64) error {
	const q = `DELETE FROM custom_domains WHERE id = $1 AND user_id = $2`
	res, err := r.Conn.ExecContext(ctx, q, id, userID)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return domain.ErrDomainNotFound
	}
	return nil
}
