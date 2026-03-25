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

func (r *AnalyticsRepository) TrackClick(ctx context.Context, event *domain.ClickEvent) error {
	const q = `
		INSERT INTO click_events (link_id, clicked_at, user_agent, country, device, browser, os, referer)
		VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7)
		RETURNING event_id
	`
	return r.Conn.QueryRowContext(ctx, q,
		event.LinkID, event.UserAgent, event.Country, event.Device, event.Browser, event.OS, event.Referer,
	).Scan(&event.ID)
}

func (r *AnalyticsRepository) TotalClicksByOwner(ctx context.Context, ownerID int64) (int64, error) {
	const q = `
		SELECT COUNT(*) FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE l.owner_id = $1
	`
	var count int64
	err := r.Conn.QueryRowContext(ctx, q, ownerID).Scan(&count)
	return count, err
}

func (r *AnalyticsRepository) ClicksOverTime(ctx context.Context, ownerID int64) ([]domain.DailyClicks, error) {
	const q = `
		SELECT TO_CHAR(ce.clicked_at, 'YYYY-MM-DD') AS day, COUNT(*) AS clicks
		FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE l.owner_id = $1 AND ce.clicked_at >= NOW() - INTERVAL '30 days'
		GROUP BY day ORDER BY day
	`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.DailyClicks
	for rows.Next() {
		var d domain.DailyClicks
		if err := rows.Scan(&d.Date, &d.Clicks); err != nil {
			return nil, err
		}
		result = append(result, d)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) CountryBreakdown(ctx context.Context, ownerID int64) ([]domain.CountryStats, error) {
	const q = `
		SELECT COALESCE(NULLIF(ce.country,''), 'Unknown') AS country, COUNT(*) AS clicks
		FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE l.owner_id = $1
		GROUP BY country ORDER BY clicks DESC LIMIT 10
	`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.CountryStats
	for rows.Next() {
		var s domain.CountryStats
		if err := rows.Scan(&s.Country, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) DeviceBreakdown(ctx context.Context, ownerID int64) ([]domain.DeviceStats, error) {
	const q = `
		SELECT COALESCE(NULLIF(ce.device,''), 'Unknown') AS device, COUNT(*) AS clicks
		FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE l.owner_id = $1
		GROUP BY device ORDER BY clicks DESC
	`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.DeviceStats
	for rows.Next() {
		var s domain.DeviceStats
		if err := rows.Scan(&s.Device, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) BrowserBreakdown(ctx context.Context, ownerID int64) ([]domain.BrowserStats, error) {
	const q = `
		SELECT COALESCE(NULLIF(ce.browser,''), 'Unknown') AS browser, COUNT(*) AS clicks
		FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE l.owner_id = $1
		GROUP BY browser ORDER BY clicks DESC
	`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.BrowserStats
	for rows.Next() {
		var s domain.BrowserStats
		if err := rows.Scan(&s.Browser, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) OSBreakdown(ctx context.Context, ownerID int64) ([]domain.OSStats, error) {
	const q = `
		SELECT COALESCE(NULLIF(ce.os,''), 'Unknown') AS os, COUNT(*) AS clicks
		FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE l.owner_id = $1
		GROUP BY os ORDER BY clicks DESC
	`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.OSStats
	for rows.Next() {
		var s domain.OSStats
		if err := rows.Scan(&s.OS, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

// ==================== Advanced Analytics ====================

func (r *AnalyticsRepository) RefererBreakdown(ctx context.Context, ownerID int64) ([]domain.RefererStats, error) {
	const q = `
		SELECT COALESCE(NULLIF(ce.referer, ''), 'Direct') AS referer, COUNT(*) AS clicks
		FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE l.owner_id = $1
		GROUP BY referer ORDER BY clicks DESC LIMIT 15
	`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.RefererStats
	for rows.Next() {
		var s domain.RefererStats
		if err := rows.Scan(&s.Referer, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) HourlyBreakdown(ctx context.Context, ownerID int64) ([]domain.HourlyStats, error) {
	const q = `
		SELECT EXTRACT(HOUR FROM ce.clicked_at)::int AS hour, COUNT(*) AS clicks
		FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE l.owner_id = $1 AND ce.clicked_at >= NOW() - INTERVAL '30 days'
		GROUP BY hour ORDER BY hour
	`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.HourlyStats
	for rows.Next() {
		var s domain.HourlyStats
		if err := rows.Scan(&s.Hour, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) TopLinks(ctx context.Context, ownerID int64, limit int) ([]domain.LinkStats, error) {
	const q = `
		SELECT l.link_id, l.slug, l.target_url, COUNT(ce.event_id) AS clicks
		FROM links l
		LEFT JOIN click_events ce ON ce.link_id = l.link_id
		WHERE l.owner_id = $1
		GROUP BY l.link_id, l.slug, l.target_url
		ORDER BY clicks DESC
		LIMIT $2
	`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.LinkStats
	for rows.Next() {
		var s domain.LinkStats
		if err := rows.Scan(&s.LinkID, &s.Slug, &s.TargetURL, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) RecentClicks(ctx context.Context, ownerID int64, limit int) ([]domain.RecentClick, error) {
	const q = `
		SELECT ce.event_id, l.slug, ce.clicked_at,
		       COALESCE(NULLIF(ce.country,''), 'Unknown'),
		       COALESCE(NULLIF(ce.device,''), 'Unknown'),
		       COALESCE(NULLIF(ce.browser,''), 'Unknown'),
		       COALESCE(NULLIF(ce.os,''), 'Unknown'),
		       COALESCE(NULLIF(ce.referer,''), 'Direct')
		FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE l.owner_id = $1
		ORDER BY ce.clicked_at DESC
		LIMIT $2
	`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.RecentClick
	for rows.Next() {
		var s domain.RecentClick
		if err := rows.Scan(&s.EventID, &s.Slug, &s.ClickedAt, &s.Country, &s.Device, &s.Browser, &s.OS, &s.Referer); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

// ==================== Per-Link Analytics ====================

func (r *AnalyticsRepository) TotalClicksByLink(ctx context.Context, linkID int64) (int64, error) {
	var count int64
	err := r.Conn.QueryRowContext(ctx, `SELECT COUNT(*) FROM click_events WHERE link_id = $1`, linkID).Scan(&count)
	return count, err
}

func (r *AnalyticsRepository) ClicksByLinkToday(ctx context.Context, linkID int64) (int64, error) {
	q := `SELECT COUNT(*) FROM click_events WHERE link_id = $1 AND clicked_at >= CURRENT_DATE`
	var count int64
	err := r.Conn.QueryRowContext(ctx, q, linkID).Scan(&count)
	return count, err
}

func (r *AnalyticsRepository) ClicksByLinkPeriod(ctx context.Context, linkID int64, interval string) (int64, error) {
	q := `SELECT COUNT(*) FROM click_events WHERE link_id = $1 AND clicked_at >= NOW() - $2::interval`
	var count int64
	err := r.Conn.QueryRowContext(ctx, q, linkID, interval).Scan(&count)
	return count, err
}

func (r *AnalyticsRepository) ClicksOverTimeByLink(ctx context.Context, linkID int64) ([]domain.DailyClicks, error) {
	const q = `
		SELECT TO_CHAR(clicked_at, 'YYYY-MM-DD') AS day, COUNT(*) AS clicks
		FROM click_events WHERE link_id = $1 AND clicked_at >= NOW() - INTERVAL '30 days'
		GROUP BY day ORDER BY day
	`
	rows, err := r.Conn.QueryContext(ctx, q, linkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []domain.DailyClicks
	for rows.Next() {
		var d domain.DailyClicks
		if err := rows.Scan(&d.Date, &d.Clicks); err != nil {
			return nil, err
		}
		result = append(result, d)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) CountryBreakdownByLink(ctx context.Context, linkID int64) ([]domain.CountryStats, error) {
	const q = `
		SELECT COALESCE(NULLIF(country,''), 'Unknown') AS country, COUNT(*) AS clicks
		FROM click_events WHERE link_id = $1
		GROUP BY country ORDER BY clicks DESC LIMIT 10
	`
	rows, err := r.Conn.QueryContext(ctx, q, linkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []domain.CountryStats
	for rows.Next() {
		var s domain.CountryStats
		if err := rows.Scan(&s.Country, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) DeviceBreakdownByLink(ctx context.Context, linkID int64) ([]domain.DeviceStats, error) {
	const q = `
		SELECT COALESCE(NULLIF(device,''), 'Unknown') AS device, COUNT(*) AS clicks
		FROM click_events WHERE link_id = $1
		GROUP BY device ORDER BY clicks DESC
	`
	rows, err := r.Conn.QueryContext(ctx, q, linkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []domain.DeviceStats
	for rows.Next() {
		var s domain.DeviceStats
		if err := rows.Scan(&s.Device, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) BrowserBreakdownByLink(ctx context.Context, linkID int64) ([]domain.BrowserStats, error) {
	const q = `
		SELECT COALESCE(NULLIF(browser,''), 'Unknown') AS browser, COUNT(*) AS clicks
		FROM click_events WHERE link_id = $1
		GROUP BY browser ORDER BY clicks DESC
	`
	rows, err := r.Conn.QueryContext(ctx, q, linkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []domain.BrowserStats
	for rows.Next() {
		var s domain.BrowserStats
		if err := rows.Scan(&s.Browser, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) OSBreakdownByLink(ctx context.Context, linkID int64) ([]domain.OSStats, error) {
	const q = `
		SELECT COALESCE(NULLIF(os,''), 'Unknown') AS os, COUNT(*) AS clicks
		FROM click_events WHERE link_id = $1
		GROUP BY os ORDER BY clicks DESC
	`
	rows, err := r.Conn.QueryContext(ctx, q, linkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []domain.OSStats
	for rows.Next() {
		var s domain.OSStats
		if err := rows.Scan(&s.OS, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) RefererBreakdownByLink(ctx context.Context, linkID int64) ([]domain.RefererStats, error) {
	const q = `
		SELECT COALESCE(NULLIF(referer, ''), 'Direct') AS referer, COUNT(*) AS clicks
		FROM click_events WHERE link_id = $1
		GROUP BY referer ORDER BY clicks DESC LIMIT 15
	`
	rows, err := r.Conn.QueryContext(ctx, q, linkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []domain.RefererStats
	for rows.Next() {
		var s domain.RefererStats
		if err := rows.Scan(&s.Referer, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) HourlyBreakdownByLink(ctx context.Context, linkID int64) ([]domain.HourlyStats, error) {
	const q = `
		SELECT EXTRACT(HOUR FROM clicked_at)::int AS hour, COUNT(*) AS clicks
		FROM click_events WHERE link_id = $1 AND clicked_at >= NOW() - INTERVAL '30 days'
		GROUP BY hour ORDER BY hour
	`
	rows, err := r.Conn.QueryContext(ctx, q, linkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []domain.HourlyStats
	for rows.Next() {
		var s domain.HourlyStats
		if err := rows.Scan(&s.Hour, &s.Clicks); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) RecentClicksByLink(ctx context.Context, linkID int64, limit int) ([]domain.RecentClick, error) {
	const q = `
		SELECT ce.event_id, l.slug, ce.clicked_at,
		       COALESCE(NULLIF(ce.country,''), 'Unknown'),
		       COALESCE(NULLIF(ce.device,''), 'Unknown'),
		       COALESCE(NULLIF(ce.browser,''), 'Unknown'),
		       COALESCE(NULLIF(ce.os,''), 'Unknown'),
		       COALESCE(NULLIF(ce.referer,''), 'Direct')
		FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE ce.link_id = $1
		ORDER BY ce.clicked_at DESC LIMIT $2
	`
	rows, err := r.Conn.QueryContext(ctx, q, linkID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []domain.RecentClick
	for rows.Next() {
		var s domain.RecentClick
		if err := rows.Scan(&s.EventID, &s.Slug, &s.ClickedAt, &s.Country, &s.Device, &s.Browser, &s.OS, &s.Referer); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}

func (r *AnalyticsRepository) ExportCSV(ctx context.Context, ownerID int64) ([]domain.CSVRow, error) {
	const q = `
		SELECT l.slug, TO_CHAR(ce.clicked_at, 'YYYY-MM-DD HH24:MI:SS'),
		       COALESCE(NULLIF(ce.country,''), 'Unknown'),
		       COALESCE(NULLIF(ce.device,''), 'Unknown'),
		       COALESCE(NULLIF(ce.browser,''), 'Unknown'),
		       COALESCE(NULLIF(ce.os,''), 'Unknown'),
		       COALESCE(NULLIF(ce.referer,''), 'Direct')
		FROM click_events ce
		JOIN links l ON ce.link_id = l.link_id
		WHERE l.owner_id = $1
		ORDER BY ce.clicked_at DESC
	`
	rows, err := r.Conn.QueryContext(ctx, q, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.CSVRow
	for rows.Next() {
		var s domain.CSVRow
		if err := rows.Scan(&s.Slug, &s.ClickedAt, &s.Country, &s.Device, &s.Browser, &s.OS, &s.Referer); err != nil {
			return nil, err
		}
		result = append(result, s)
	}
	return result, rows.Err()
}
