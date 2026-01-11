package entity

import "time"

// User represents a user entity in the system.

type DateTime time.Time

type User struct {
	ID           int64
	Name         string
	Email        string
	PasswordHash string
	CreatedAt    DateTime
}
