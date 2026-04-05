package domain

import (
	"context"
	"time"
)

type BioPage struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	Handle      string    `json:"handle"`
	DisplayName string    `json:"display_name"`
	BioText     string    `json:"bio_text"`
	AvatarURL   string    `json:"avatar_url"`
	Theme       string    `json:"theme"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type BioLink struct {
	ID        int64     `json:"id"`
	BioPageID int64     `json:"bio_page_id"`
	LinkID    int64     `json:"link_id"`
	Title     string    `json:"title"`
	Position  int       `json:"position"`
	IsVisible bool      `json:"is_visible"`
	CreatedAt time.Time `json:"created_at"`
	// Populated via JOIN with links table
	Slug      string `json:"slug"`
	TargetURL string `json:"target_url"`
}

type BioPageRepository interface {
	CreatePage(ctx context.Context, page *BioPage) error
	GetPageByUserID(ctx context.Context, userID int64) (BioPage, error)
	GetPageByHandle(ctx context.Context, handle string) (BioPage, error)
	UpdatePage(ctx context.Context, page *BioPage) error
	HandleExists(ctx context.Context, handle string) (bool, error)

	AddLink(ctx context.Context, bl *BioLink) error
	RemoveLink(ctx context.Context, bioLinkID int64, bioPageID int64) error
	ListLinks(ctx context.Context, bioPageID int64) ([]BioLink, error)
	ListVisibleLinks(ctx context.Context, bioPageID int64) ([]BioLink, error)
	ReorderLinks(ctx context.Context, bioPageID int64, orderedIDs []int64) error
	CountLinks(ctx context.Context, bioPageID int64) (int64, error)
}

type BioPageService interface {
	// Page management (auth required)
	CreatePage(ctx context.Context, userID int64, handle, displayName, bioText, avatarURL, theme string) (BioPage, error)
	UpdatePage(ctx context.Context, userID int64, handle, displayName, bioText, avatarURL, theme string) (BioPage, error)
	GetMyPage(ctx context.Context, userID int64) (BioPage, []BioLink, error)

	// Bio link management (auth required)
	AddLink(ctx context.Context, userID int64, title, targetURL string) (BioLink, error)
	RemoveLink(ctx context.Context, userID int64, bioLinkID int64) error
	ReorderLinks(ctx context.Context, userID int64, orderedIDs []int64) error

	// Public (no auth)
	GetPublicPage(ctx context.Context, handle string) (BioPage, []BioLink, bool, error)
}
