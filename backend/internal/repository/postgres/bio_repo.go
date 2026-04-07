package postgres

import (
	"context"
	"database/sql"
	"strings"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type BioRepository struct {
	Conn *sql.DB
}

func NewBioRepository(conn *sql.DB) *BioRepository {
	return &BioRepository{Conn: conn}
}

func (r *BioRepository) CreatePage(ctx context.Context, page *domain.BioPage) error {
	const q = `
		INSERT INTO bio_pages (user_id, handle, display_name, bio_text, avatar_url, theme)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING bio_page_id, created_at, updated_at
	`
	err := r.Conn.QueryRowContext(ctx, q,
		page.UserID, page.Handle, page.DisplayName, page.BioText, page.AvatarURL, page.Theme,
	).Scan(&page.ID, &page.CreatedAt, &page.UpdatedAt)
	if err != nil && (strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique")) {
		if strings.Contains(err.Error(), "handle") {
			return domain.ErrHandleTaken
		}
	}
	return err
}

func (r *BioRepository) GetPageByUserID(ctx context.Context, userID int64) (domain.BioPage, error) {
	const q = `SELECT bio_page_id, user_id, handle, display_name, bio_text, avatar_url, theme, created_at, updated_at
		FROM bio_pages WHERE user_id = $1`
	var p domain.BioPage
	err := r.Conn.QueryRowContext(ctx, q, userID).Scan(
		&p.ID, &p.UserID, &p.Handle, &p.DisplayName, &p.BioText, &p.AvatarURL, &p.Theme, &p.CreatedAt, &p.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return domain.BioPage{}, domain.ErrBioPageNotFound
	}
	return p, err
}

func (r *BioRepository) GetPageByHandle(ctx context.Context, handle string) (domain.BioPage, error) {
	const q = `SELECT bio_page_id, user_id, handle, display_name, bio_text, avatar_url, theme, created_at, updated_at
		FROM bio_pages WHERE handle = $1`
	var p domain.BioPage
	err := r.Conn.QueryRowContext(ctx, q, handle).Scan(
		&p.ID, &p.UserID, &p.Handle, &p.DisplayName, &p.BioText, &p.AvatarURL, &p.Theme, &p.CreatedAt, &p.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return domain.BioPage{}, domain.ErrBioPageNotFound
	}
	return p, err
}

func (r *BioRepository) UpdatePage(ctx context.Context, page *domain.BioPage) error {
	const q = `UPDATE bio_pages SET handle=$1, display_name=$2, bio_text=$3, avatar_url=$4, theme=$5, updated_at=NOW()
		WHERE user_id=$6 RETURNING updated_at`
	err := r.Conn.QueryRowContext(ctx, q,
		page.Handle, page.DisplayName, page.BioText, page.AvatarURL, page.Theme, page.UserID,
	).Scan(&page.UpdatedAt)
	if err != nil && (strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique")) {
		if strings.Contains(err.Error(), "handle") {
			return domain.ErrHandleTaken
		}
	}
	return err
}

func (r *BioRepository) HandleExists(ctx context.Context, handle string) (bool, error) {
	const q = `SELECT EXISTS(SELECT 1 FROM bio_pages WHERE handle = $1)`
	var exists bool
	err := r.Conn.QueryRowContext(ctx, q, handle).Scan(&exists)
	return exists, err
}

func (r *BioRepository) AddLink(ctx context.Context, bl *domain.BioLink) error {
	const q = `
		INSERT INTO bio_links (bio_page_id, link_id, title, position)
		VALUES ($1, $2, $3, (SELECT COALESCE(MAX(position),0)+1 FROM bio_links WHERE bio_page_id=$1))
		RETURNING bio_link_id, position, created_at
	`
	return r.Conn.QueryRowContext(ctx, q,
		bl.BioPageID, bl.LinkID, bl.Title,
	).Scan(&bl.ID, &bl.Position, &bl.CreatedAt)
}

func (r *BioRepository) UpdateLink(ctx context.Context, bioLinkID int64, bioPageID int64, title string, targetURL string) error {
	tx, err := r.Conn.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update title in bio_links
	res, err := tx.ExecContext(ctx,
		`UPDATE bio_links SET title=$1 WHERE bio_link_id=$2 AND bio_page_id=$3`,
		title, bioLinkID, bioPageID,
	)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return domain.ErrBioLinkNotFound
	}

	// Update target_url in the linked links row
	_, err = tx.ExecContext(ctx,
		`UPDATE links SET target_url=$1 WHERE link_id=(SELECT link_id FROM bio_links WHERE bio_link_id=$2)`,
		targetURL, bioLinkID,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *BioRepository) RemoveLink(ctx context.Context, bioLinkID int64, bioPageID int64) error {
	const q = `DELETE FROM bio_links WHERE bio_link_id=$1 AND bio_page_id=$2`
	res, err := r.Conn.ExecContext(ctx, q, bioLinkID, bioPageID)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return domain.ErrBioLinkNotFound
	}
	return nil
}

func (r *BioRepository) listLinksQuery(ctx context.Context, bioPageID int64, visibleOnly bool) ([]domain.BioLink, error) {
	q := `SELECT bl.bio_link_id, bl.bio_page_id, bl.link_id, bl.title, bl.position, bl.is_visible, bl.created_at,
		l.slug, l.target_url
		FROM bio_links bl JOIN links l ON l.link_id = bl.link_id
		WHERE bl.bio_page_id = $1`
	if visibleOnly {
		q += ` AND bl.is_visible = TRUE`
	}
	q += ` ORDER BY bl.position ASC`

	rows, err := r.Conn.QueryContext(ctx, q, bioPageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []domain.BioLink
	for rows.Next() {
		var bl domain.BioLink
		if err := rows.Scan(
			&bl.ID, &bl.BioPageID, &bl.LinkID, &bl.Title, &bl.Position, &bl.IsVisible, &bl.CreatedAt,
			&bl.Slug, &bl.TargetURL,
		); err != nil {
			return nil, err
		}
		links = append(links, bl)
	}
	return links, rows.Err()
}

func (r *BioRepository) ListLinks(ctx context.Context, bioPageID int64) ([]domain.BioLink, error) {
	return r.listLinksQuery(ctx, bioPageID, false)
}

func (r *BioRepository) ListVisibleLinks(ctx context.Context, bioPageID int64) ([]domain.BioLink, error) {
	return r.listLinksQuery(ctx, bioPageID, true)
}

func (r *BioRepository) ReorderLinks(ctx context.Context, bioPageID int64, orderedIDs []int64) error {
	tx, err := r.Conn.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	const q = `UPDATE bio_links SET position=$1 WHERE bio_link_id=$2 AND bio_page_id=$3`
	for i, id := range orderedIDs {
		if _, err := tx.ExecContext(ctx, q, i, id, bioPageID); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (r *BioRepository) CountLinks(ctx context.Context, bioPageID int64) (int64, error) {
	const q = `SELECT COUNT(*) FROM bio_links WHERE bio_page_id = $1`
	var count int64
	err := r.Conn.QueryRowContext(ctx, q, bioPageID).Scan(&count)
	return count, err
}
