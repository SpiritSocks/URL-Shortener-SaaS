package service

import (
	"context"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type service struct {
	repo domain.AnalyticsRepository
}

func NewAnalyticsService(repo domain.AnalyticsRepository) domain.AnalyticsService {
	return &service{repo: repo}
}

func (srv *service) TrackClick(ctx context.Context) error {
	return nil
}

func (srv *service) GetLinkReport(ctx context.Context, linkID int64) (domain.ClickEvent, error) {
	return domain.ClickEvent{}, nil
}

func (srv *service) GetOverview(ctx context.Context, ownerID int64) ([]domain.ClickEvent, error) {
	return []domain.ClickEvent{}, nil
}
