package dto

import (
	"time"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type UserDTO struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"password,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	IsAdmin   bool      `json:"is_admin"`
	PlanID    int64     `json:"plan_id"`
}

func (u *UserDTO) ToDomain() domain.User {
	return domain.User{
		ID:           u.ID,
		Username:     u.Username,
		Email:        u.Email,
		PasswordHash: u.Password,
		CreatedAt:    u.CreatedAt,
		IsAdmin:      u.IsAdmin,
		PlanID:       u.PlanID,
	}
}

func ToDTO(t domain.User) UserDTO {
	return UserDTO{
		ID:        t.ID,
		Username:  t.Username,
		Email:     t.Email,
		CreatedAt: t.CreatedAt,
		IsAdmin:   t.IsAdmin,
		PlanID:    t.PlanID,
	}
}
