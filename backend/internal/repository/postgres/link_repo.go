package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type LinkRepository struct {
	Conn *sql.DB
}

func NewLinkRepository(conn *sql.DB) *LinkRepository {
	return &LinkRepository{Conn: conn}
}

func (r *LinkRepository) Create(ctx context.Context, link *domain.Link) error {
	const q = `
		INSERT INTO links (owner_id, slug, target_url, custom_domain_id, created_at, is_active)
		VALUES (NULLIF($1, 0), $2, $3, $4, NOW(), TRUE)
		RETURNING link_id, created_at
	`
	return r.Conn.QueryRowContext(ctx, q,
		link.OwnerID, link.Slug, link.TargetURL, link.CustomDomainID,
	).Scan(&link.ID, &link.CreatedAt)
}

func (r *LinkRepository) Delete(ctx context.Context, linkID, ownerID int64) error {
	const q = `DELETE FROM links WHERE link_id = $1 AND owner_id = $2`
	res, err := r.Conn.ExecContext(ctx, q, linkID, ownerID)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return domain.ErrLinkNotFound
	}
	return nil
}

func scanLink(row interface {
	Scan(dest ...any) error
}) (domain.Link, error) {
	var link domain.Link
	var ownerID sql.NullInt64
	err := row.Scan(&link.ID, &ownerID, &link.Slug, &link.TargetURL, &link.CreatedAt, &link.IsActive, &link.CustomDomainID)
	link.OwnerID = ownerID.Int64
	return link, err
}

func (r *LinkRepository) GetByID(ctx context.Context, linkID int64) (domain.Link, error) {
	const q = `SELECT link_id, owner_id, slug, target_url, created_at, is_active, custom_domain_id FROM links WHERE link_id = $1`
	link, err := scanLink(r.Conn.QueryRowContext(ctx, q, linkID))
	if err == sql.ErrNoRows {
		return domain.Link{}, domain.ErrLinkNotFound
	}
	if err != nil {
		return domain.Link{}, fmt.Errorf("failed to get link: %w", err)
	}
	return link, nil
}

func (r *LinkRepository) GetBySlug(ctx context.Context, slug string) (domain.Link, error) {
	const q = `SELECT link_id, owner_id, slug, target_url, created_at, is_active, custom_domain_id FROM links WHERE slug = $1 AND is_active = TRUE`
	link, err := scanLink(r.Conn.QueryRowContext(ctx, q, slug))
	if err == sql.ErrNoRows {
		return domain.Link{}, domain.ErrLinkNotFound
	}
	return link, err
}

func (r *LinkRepository) GetBySlugAndDomain(ctx context.Context, slug string, domainID string) (domain.Link, error) {
	const q = `SELECT link_id, owner_id, slug, target_url, created_at, is_active, custom_domain_id
		FROM links WHERE slug = $1 AND custom_domain_id = $2 AND is_active = TRUE`
	link, err := scanLink(r.Conn.QueryRowContext(ctx, q, slug, domainID))
	if err == sql.ErrNoRows {
		return domain.Link{}, domain.ErrLinkNotFound
	}
	return link, err
}

func (r *LinkRepository) ListByOwner(ctx context.Context, ownerID int64) ([]domain.Link, error) {
	const q = `SELECT link_id, owner_id, slug, target_url, created_at, is_active, custom_domain_id FROM links WHERE owner_id = $1 ORDER BY created_at DESC`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []domain.Link
	for rows.Next() {
		l, err := scanLink(rows)
		if err != nil {
			return nil, err
		}
		links = append(links, l)
	}
	return links, rows.Err()
}

func (r *LinkRepository) CountByOwner(ctx context.Context, ownerID int64) (int64, error) {
	const q = `SELECT COUNT(*) FROM links WHERE owner_id = $1 AND created_at >= date_trunc('month', NOW())`
	var count int64
	err := r.Conn.QueryRowContext(ctx, q, ownerID).Scan(&count)
	return count, err
}

func (r *LinkRepository) TotalCountByOwner(ctx context.Context, ownerID int64) (int64, error) {
	const q = `SELECT COUNT(*) FROM links WHERE owner_id = $1`
	var count int64
	err := r.Conn.QueryRowContext(ctx, q, ownerID).Scan(&count)
	return count, err
}
