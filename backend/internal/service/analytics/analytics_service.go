package service

import (
	"context"
	"fmt"
	"time"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type service struct {
	repo     domain.AnalyticsRepository
	linkRepo domain.LinkRepository
}

func NewAnalyticsService(repo domain.AnalyticsRepository, linkRepo domain.LinkRepository) domain.AnalyticsService {
	return &service{repo: repo, linkRepo: linkRepo}
}

func (srv *service) TrackClick(ctx context.Context, event *domain.ClickEvent) error {
	return srv.repo.TrackClick(ctx, event)
}

func (srv *service) GetOverview(ctx context.Context, ownerID int64, planName string) (domain.OverviewStats, error) {
	totalLinks, err := srv.linkRepo.TotalCountByOwner(ctx, ownerID)
	if err != nil {
		return domain.OverviewStats{}, err
	}

	totalClicks, err := srv.repo.TotalClicksByOwner(ctx, ownerID)
	if err != nil {
		return domain.OverviewStats{}, err
	}

	clicksOver, err := srv.repo.ClicksOverTime(ctx, ownerID)
	if err != nil {
		return domain.OverviewStats{}, err
	}

	var avgPerLink float64
	if totalLinks > 0 {
		avgPerLink = float64(totalClicks) / float64(totalLinks)
	}

	var avgPerDay float64
	if len(clicksOver) > 0 {
		avgPerDay = float64(totalClicks) / float64(len(clicksOver))
	}

	stats := domain.OverviewStats{
		TotalLinks:  totalLinks,
		TotalClicks: totalClicks,
		AvgPerLink:  avgPerLink,
		AvgPerDay:   avgPerDay,
		ClicksOver:  clicksOver,
	}

	// Breakdowns are available on Pro and Unlimited plans
	if planName == "pro" || planName == "unlimited" {
		stats.Countries, err = srv.repo.CountryBreakdown(ctx, ownerID)
		if err != nil {
			return domain.OverviewStats{}, err
		}
		stats.Devices, err = srv.repo.DeviceBreakdown(ctx, ownerID)
		if err != nil {
			return domain.OverviewStats{}, err
		}
		stats.Browsers, err = srv.repo.BrowserBreakdown(ctx, ownerID)
		if err != nil {
			return domain.OverviewStats{}, err
		}
		stats.OSStats, err = srv.repo.OSBreakdown(ctx, ownerID)
		if err != nil {
			return domain.OverviewStats{}, err
		}
	}

	return stats, nil
}

func (srv *service) GetAdvanced(ctx context.Context, ownerID int64) (domain.AdvancedStats, error) {
	referers, err := srv.repo.RefererBreakdown(ctx, ownerID)
	if err != nil {
		return domain.AdvancedStats{}, err
	}

	hourly, err := srv.repo.HourlyBreakdown(ctx, ownerID)
	if err != nil {
		return domain.AdvancedStats{}, err
	}

	topLinks, err := srv.repo.TopLinks(ctx, ownerID, 10)
	if err != nil {
		return domain.AdvancedStats{}, err
	}

	recent, err := srv.repo.RecentClicks(ctx, ownerID, 20)
	if err != nil {
		return domain.AdvancedStats{}, err
	}

	return domain.AdvancedStats{
		Referers:     referers,
		HourlyMap:    hourly,
		TopLinks:     topLinks,
		RecentClicks: recent,
	}, nil
}

func (srv *service) GetCSVExport(ctx context.Context, ownerID int64) ([]domain.CSVRow, error) {
	return srv.repo.ExportCSV(ctx, ownerID)
}

func (srv *service) GetLinkDetail(ctx context.Context, linkID int64, slug, targetURL string, createdAt time.Time, planName string) (domain.LinkDetailStats, error) {
	total, err := srv.repo.TotalClicksByLink(ctx, linkID)
	if err != nil {
		return domain.LinkDetailStats{}, fmt.Errorf("total clicks: %w", err)
	}
	clicksToday, err := srv.repo.ClicksByLinkToday(ctx, linkID)
	if err != nil {
		return domain.LinkDetailStats{}, fmt.Errorf("clicks today: %w", err)
	}
	clicksWeek, err := srv.repo.ClicksByLinkPeriod(ctx, linkID, "7 days")
	if err != nil {
		return domain.LinkDetailStats{}, fmt.Errorf("clicks this week: %w", err)
	}
	clicksMonth, err := srv.repo.ClicksByLinkPeriod(ctx, linkID, "30 days")
	if err != nil {
		return domain.LinkDetailStats{}, fmt.Errorf("clicks this month: %w", err)
	}
	clicksOver, err := srv.repo.ClicksOverTimeByLink(ctx, linkID)
	if err != nil {
		return domain.LinkDetailStats{}, fmt.Errorf("clicks over time: %w", err)
	}

	stats := domain.LinkDetailStats{
		LinkID:      linkID,
		Slug:        slug,
		TargetURL:   targetURL,
		CreatedAt:   createdAt,
		TotalClicks: total,
		ClicksToday: clicksToday,
		ClicksWeek:  clicksWeek,
		ClicksMonth: clicksMonth,
		ClicksOver:  clicksOver,
	}

	// Pro and Unlimited get full breakdowns
	if planName == "pro" || planName == "unlimited" {
		stats.Countries, err = srv.repo.CountryBreakdownByLink(ctx, linkID)
		if err != nil {
			return domain.LinkDetailStats{}, fmt.Errorf("country breakdown: %w", err)
		}
		stats.Devices, err = srv.repo.DeviceBreakdownByLink(ctx, linkID)
		if err != nil {
			return domain.LinkDetailStats{}, fmt.Errorf("device breakdown: %w", err)
		}
		stats.Browsers, err = srv.repo.BrowserBreakdownByLink(ctx, linkID)
		if err != nil {
			return domain.LinkDetailStats{}, fmt.Errorf("browser breakdown: %w", err)
		}
		stats.OSStats, err = srv.repo.OSBreakdownByLink(ctx, linkID)
		if err != nil {
			return domain.LinkDetailStats{}, fmt.Errorf("os breakdown: %w", err)
		}
	}

	// Unlimited gets advanced per-link analytics
	if planName == "unlimited" {
		stats.Referers, err = srv.repo.RefererBreakdownByLink(ctx, linkID)
		if err != nil {
			return domain.LinkDetailStats{}, fmt.Errorf("referer breakdown: %w", err)
		}
		stats.HourlyMap, err = srv.repo.HourlyBreakdownByLink(ctx, linkID)
		if err != nil {
			return domain.LinkDetailStats{}, fmt.Errorf("hourly breakdown: %w", err)
		}
		stats.RecentClicks, err = srv.repo.RecentClicksByLink(ctx, linkID, 20)
		if err != nil {
			return domain.LinkDetailStats{}, fmt.Errorf("recent clicks: %w", err)
		}
	}

	return stats, nil
}
