package domain

import (
	"context"
	"time"
)

type Plan struct {
	PlanID int64
	Name   string
	PPM    float64 // Price Per Month
	Limit  int64
}

type Subscription struct {
	SubscriptionID int64
	OwnerID        int64
	PlanID         int64
	StartedAt      time.Time
	ExpiresAt      time.Time
	IsActive       bool
}

type PlanRepository interface {
	GetByID(ctx context.Context, planID int64) (Plan, error)
	ListActive(ctx context.Context) ([]Plan, error)
}

type SubscriptionRepository interface {
	CheckActive(sub Subscription) (bool, error)
	EnforceAction(sub Subscription) (bool, error)
	Checkout() error
	Cancel() error
}

type PlanService interface {
	GetByID(ctx context.Context, planID int64) (Plan, error)
	ListActive(ctx context.Context) ([]Plan, error)
}

type SubscriptionService interface {
	CheckActive(ctx context.Context, sub Subscription) (bool, error)
	EnforceAction(ctx context.Context, sub Subscription) (bool, error)
	Checkout(ctx context.Context) error
	Cancel(ctx context.Context) error
}
