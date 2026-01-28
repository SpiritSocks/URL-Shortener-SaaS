package domain

import (
	"context"
	"time"
)

type ClickEvent struct {
	ID        int64
	LinkID    int64
	ClickedAt time.Time
	UserAgent string
	Country   string
	Device    string
	Browser   string
	OS        string
}

type AnalyticsRepository interface {
	TrackClick(ctx context.Context) error
	GetLinkReport(ctx context.Context, linkID int64) (ClickEvent, error)
	GetOverview(ctx context.Context) ([]ClickEvent, error)
}

type AnalyticsService interface {
	TrackClick(ctx context.Context) error
	GetLinkReport(ctx context.Context, linkID int64) (ClickEvent, error)
	GetOverview(ctx context.Context, ownerID int64) ([]ClickEvent, error)
}
