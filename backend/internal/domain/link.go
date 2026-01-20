package domain

import (
	"context"
	"time"
)

type Link struct {
	ID        int64
	OwnerID   int64
	Slug      string
	TargetURL string
	CreatedAt time.Time
	IsActive  bool
}

type LinkRepository interface {
	Create(ctx context.Context, url string) (Link, error)
	Delete(ctx context.Context, linkID int64) error
	GetByID(ctx context.Context, linkID int64) (Link, error)
}
