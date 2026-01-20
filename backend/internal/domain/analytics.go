package domain

import "time"

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
