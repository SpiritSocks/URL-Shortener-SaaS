package domain

import (
	"context"
	"time"
)

type CustomDomain struct {
	ID        string
	UserID    int64
	Domain    string
	Verified  bool
	SSLStatus string
	CreatedAt time.Time
}

type CustomDomainRepository interface {
	Create(ctx context.Context, d *CustomDomain) error
	GetByDomain(ctx context.Context, domain string) (CustomDomain, error)
	GetByID(ctx context.Context, id string) (CustomDomain, error)
	ListByUser(ctx context.Context, userID int64) ([]CustomDomain, error)
	UpdateVerified(ctx context.Context, id string, verified bool) error
	UpdateSSLStatus(ctx context.Context, id string, status string) error
	Delete(ctx context.Context, id string, userID int64) error
}

type CustomDomainService interface {
	Add(ctx context.Context, userID int64, domain string) (CustomDomain, error)
	ListByUser(ctx context.Context, userID int64) ([]CustomDomain, error)
	Verify(ctx context.Context, id string, userID int64) (CustomDomain, error)
	Delete(ctx context.Context, id string, userID int64) error
	GetByDomain(ctx context.Context, domain string) (CustomDomain, error)
	GetByID(ctx context.Context, id string) (CustomDomain, error)
}
