package service

import (
	"context"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type PlanService interface {
	GetByID(ctx context.Context, planID int64) (domain.Plan, error)
	ListActive(ctx context.Context) ([]domain.Plan, error)
}

type SubscriptionService interface {
	CheckActive(ctx context.Context, sub domain.Subscription) (bool, error)
	EnforceAction(ctx context.Context, sub domain.Subscription) (bool, error)
	Checkout(ctx context.Context) error
	Cancel(ctx context.Context) error
}
