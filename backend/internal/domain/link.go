package domain

import (
	"context"
	"time"
)

type Link struct {
	ID             int64
	OwnerID        int64
	Slug           string
	TargetURL      string
	CreatedAt      time.Time
	IsActive       bool
	CustomDomainID *string
}

type LinkRepository interface {
	Create(ctx context.Context, link *Link) error
	Delete(ctx context.Context, linkID, ownerID int64) error
	GetByID(ctx context.Context, linkID int64) (Link, error)
	GetBySlug(ctx context.Context, slug string) (Link, error)
	GetBySlugAndDomain(ctx context.Context, slug string, domainID string) (Link, error)
	ListByOwner(ctx context.Context, ownerID int64) ([]Link, error)
	CountByOwner(ctx context.Context, ownerID int64) (int64, error)
	TotalCountByOwner(ctx context.Context, ownerID int64) (int64, error)
}

type LinkService interface {
	Create(ctx context.Context, ownerID int64, targetURL string, customDomainID *string) (Link, error)
	Delete(ctx context.Context, linkID, ownerID int64) error
	GetBySlug(ctx context.Context, slug string) (Link, error)
	GetBySlugAndDomain(ctx context.Context, slug string, domainID string) (Link, error)
	ListByOwner(ctx context.Context, ownerID int64) ([]Link, error)
	CountByOwner(ctx context.Context, ownerID int64) (int64, error)
	TotalCountByOwner(ctx context.Context, ownerID int64) (int64, error)
}
