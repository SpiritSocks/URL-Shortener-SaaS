package postgres

import "time"

type ShortLink_Model struct {
	ID         int64
	User_ID    int64
	Slug       string
	Target_URL string
	Created_At time.Time
	Expires_At *time.Time
	Is_Active  bool
}
