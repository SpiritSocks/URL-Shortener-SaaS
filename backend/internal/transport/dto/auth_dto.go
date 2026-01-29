package dto

import (
	"time"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type UserDTO struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"created_at"`
	IsAdmin   bool      `json:"is_admin"`
}

func (u *UserDTO) ToDomain() domain.User {
	ID := u.ID
	Username := u.Username
	Email := u.Email
	PasswordHash := u.Password
	CreatedAt := u.CreatedAt
	IsAdmin := u.IsAdmin

	return domain.User{
		ID:           ID,
		Username:     Username,
		Email:        Email,
		PasswordHash: PasswordHash,
		CreatedAt:    CreatedAt,
		IsAdmin:      IsAdmin,
	}
}

func ToDTO(t domain.User) UserDTO {
	return UserDTO{
		ID:        t.ID,
		Username:  t.Username,
		Email:     t.Email,
		Password:  t.PasswordHash,
		CreatedAt: t.CreatedAt,
		IsAdmin:   t.IsAdmin,
	}
}
