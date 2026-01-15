package entity

import "time"

type LinkID int64
type UserID int64

type ShortLink struct {
	ID        LinkID
	OwnerID   UserID
	Slug      string
	TargetURL string
	CreatedAt time.Time
	ExpiresAt *time.Time
	Active    bool
}
