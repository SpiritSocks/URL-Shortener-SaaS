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
	Referer   string
}

type CountryStats struct {
	Country string `json:"country"`
	Clicks  int64  `json:"clicks"`
}

type DeviceStats struct {
	Device string `json:"device"`
	Clicks int64  `json:"clicks"`
}

type BrowserStats struct {
	Browser string `json:"browser"`
	Clicks  int64  `json:"clicks"`
}

type OSStats struct {
	OS     string `json:"os"`
	Clicks int64  `json:"clicks"`
}

type DailyClicks struct {
	Date   string `json:"date"`
	Clicks int64  `json:"clicks"`
}

type OverviewStats struct {
	TotalLinks  int64          `json:"total_links"`
	TotalClicks int64          `json:"total_clicks"`
	AvgPerLink  float64        `json:"avg_per_link"`
	AvgPerDay   float64        `json:"avg_per_day"`
	ClicksOver  []DailyClicks  `json:"clicks_over_time"`
	Countries   []CountryStats `json:"countries"`
	Devices     []DeviceStats  `json:"devices"`
	Browsers    []BrowserStats `json:"browsers"`
	OSStats     []OSStats      `json:"os_stats"`
}

// --- Advanced analytics (Unlimited plan) ---

type RefererStats struct {
	Referer string `json:"referer"`
	Clicks  int64  `json:"clicks"`
}

type HourlyStats struct {
	Hour   int   `json:"hour"`
	Clicks int64 `json:"clicks"`
}

type LinkStats struct {
	LinkID    int64  `json:"link_id"`
	Slug      string `json:"slug"`
	TargetURL string `json:"target_url"`
	Clicks    int64  `json:"clicks"`
}

type RecentClick struct {
	EventID   int64     `json:"event_id"`
	Slug      string    `json:"slug"`
	ClickedAt time.Time `json:"clicked_at"`
	Country   string    `json:"country"`
	Device    string    `json:"device"`
	Browser   string    `json:"browser"`
	OS        string    `json:"os"`
	Referer   string    `json:"referer"`
}

type AdvancedStats struct {
	Referers     []RefererStats `json:"referers"`
	HourlyMap    []HourlyStats  `json:"hourly_map"`
	TopLinks     []LinkStats    `json:"top_links"`
	RecentClicks []RecentClick  `json:"recent_clicks"`
}

type CSVRow struct {
	Slug      string
	ClickedAt string
	Country   string
	Device    string
	Browser   string
	OS        string
	Referer   string
}

// --- Per-link analytics ---

type LinkDetailStats struct {
	LinkID      int64          `json:"link_id"`
	Slug        string         `json:"slug"`
	TargetURL   string         `json:"target_url"`
	CreatedAt   time.Time      `json:"created_at"`
	TotalClicks int64          `json:"total_clicks"`
	ClicksToday int64          `json:"clicks_today"`
	ClicksWeek  int64          `json:"clicks_week"`
	ClicksMonth int64          `json:"clicks_month"`
	ClicksOver  []DailyClicks  `json:"clicks_over_time"`
	Countries   []CountryStats `json:"countries"`
	Devices     []DeviceStats  `json:"devices"`
	Browsers    []BrowserStats `json:"browsers"`
	OSStats     []OSStats      `json:"os_stats"`
	Referers    []RefererStats `json:"referers"`
	HourlyMap   []HourlyStats  `json:"hourly_map"`
	RecentClicks []RecentClick `json:"recent_clicks"`
}

// --- Interfaces ---

type AnalyticsRepository interface {
	TrackClick(ctx context.Context, event *ClickEvent) error
	TotalClicksByOwner(ctx context.Context, ownerID int64) (int64, error)
	ClicksOverTime(ctx context.Context, ownerID int64) ([]DailyClicks, error)
	CountryBreakdown(ctx context.Context, ownerID int64) ([]CountryStats, error)
	DeviceBreakdown(ctx context.Context, ownerID int64) ([]DeviceStats, error)
	BrowserBreakdown(ctx context.Context, ownerID int64) ([]BrowserStats, error)
	OSBreakdown(ctx context.Context, ownerID int64) ([]OSStats, error)

	// Advanced
	RefererBreakdown(ctx context.Context, ownerID int64) ([]RefererStats, error)
	HourlyBreakdown(ctx context.Context, ownerID int64) ([]HourlyStats, error)
	TopLinks(ctx context.Context, ownerID int64, limit int) ([]LinkStats, error)
	RecentClicks(ctx context.Context, ownerID int64, limit int) ([]RecentClick, error)
	ExportCSV(ctx context.Context, ownerID int64) ([]CSVRow, error)

	// Per-link
	TotalClicksByLink(ctx context.Context, linkID int64) (int64, error)
	ClicksByLinkToday(ctx context.Context, linkID int64) (int64, error)
	ClicksByLinkPeriod(ctx context.Context, linkID int64, interval string) (int64, error)
	ClicksOverTimeByLink(ctx context.Context, linkID int64) ([]DailyClicks, error)
	CountryBreakdownByLink(ctx context.Context, linkID int64) ([]CountryStats, error)
	DeviceBreakdownByLink(ctx context.Context, linkID int64) ([]DeviceStats, error)
	BrowserBreakdownByLink(ctx context.Context, linkID int64) ([]BrowserStats, error)
	OSBreakdownByLink(ctx context.Context, linkID int64) ([]OSStats, error)
	RefererBreakdownByLink(ctx context.Context, linkID int64) ([]RefererStats, error)
	HourlyBreakdownByLink(ctx context.Context, linkID int64) ([]HourlyStats, error)
	RecentClicksByLink(ctx context.Context, linkID int64, limit int) ([]RecentClick, error)
}

type AnalyticsService interface {
	TrackClick(ctx context.Context, event *ClickEvent) error
	GetOverview(ctx context.Context, ownerID int64) (OverviewStats, error)
	GetAdvanced(ctx context.Context, ownerID int64) (AdvancedStats, error)
	GetCSVExport(ctx context.Context, ownerID int64) ([]CSVRow, error)
	GetLinkDetail(ctx context.Context, linkID int64, slug, targetURL string, createdAt time.Time, planName string) (LinkDetailStats, error)
}
