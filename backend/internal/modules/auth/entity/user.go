package auth

import "time"

type DateTime time.Time

type User struct {
	ID            int64
	Username      string
	Email         string
	Password_Hash string
	Created_At    DateTime
}
