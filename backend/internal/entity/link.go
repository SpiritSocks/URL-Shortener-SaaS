package entity

// Link represents a link entity in the system.

type Link struct {
	ID         int64
	User_id    int64
	Target_URL string
	Created_At DateTime
	Expires_At DateTime
	Is_Active  bool
}
