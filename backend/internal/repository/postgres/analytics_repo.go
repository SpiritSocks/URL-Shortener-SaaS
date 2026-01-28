package postgres

import (
	"context"
	"database/sql"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type AnalyticsRepository struct {
	Conn *sql.DB
}

func NewAnalyticsRepository(conn *sql.DB) *AnalyticsRepository {
	return &AnalyticsRepository{Conn: conn}
}

func (repo *AnalyticsRepository) TrackClick(ctx context.Context) error {
	return nil
}

func (repo *AnalyticsRepository) GetLinkReport(ctx context.Context, linkID int64) (domain.ClickEvent, error) {
	return domain.ClickEvent{}, nil
}

func (repo *AnalyticsRepository) GetOverview(ctx context.Context) ([]domain.ClickEvent, error) {
	return []domain.ClickEvent{}, nil
}
