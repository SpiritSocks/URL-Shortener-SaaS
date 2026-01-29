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

func (lpo *LinkRepository) Create(ctx context.Context, url string) (domain.Link, error) {

	//slug := service.SlugGenerator(url)

	return domain.Link{}, nil
}

func (lpo *LinkRepository) Delete(ctx context.Context, linkID int64) error { return nil }

func (lpo *LinkRepository) GetByID(ctx context.Context, linkID int64) (domain.Link, error) {

	query := `SELECT id, owner_id, slug, target_url, created_at, is_active FROM link WHERE id = ?`

	var link domain.Link

	err := lpo.Conn.QueryRowContext(ctx, query, linkID).Scan(
		&link.ID,
		&link.OwnerID,
		&link.Slug,
		&link.TargetURL,
		&link.CreatedAt,
		&link.IsActive,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return domain.Link{}, fmt.Errorf("no link with id: %w", err)
		}
		return domain.Link{}, fmt.Errorf("Failed to get link")
	}

	return link, nil
}
