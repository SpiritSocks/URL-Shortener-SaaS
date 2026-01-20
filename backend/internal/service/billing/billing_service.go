package service

import "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"

type service struct {
	repo domain.SubscriptionRepository
}
