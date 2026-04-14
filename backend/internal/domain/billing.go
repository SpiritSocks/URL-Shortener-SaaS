package domain

import (
	"context"
	"time"
)

type Plan struct {
	PlanID       int64  `json:"plan_id"`
	Name         string `json:"name"`
	PriceKop     int64  `json:"price_kop"`
	MaxLinks     int64  `json:"max_links"`
	HasAnalytics bool   `json:"has_analytics"`
	MaxBioLinks  int64  `json:"max_bio_links"`
}

type Payment struct {
	PaymentID   int64
	UserID      int64
	PlanID      int64
	YookassaID  string
	AmountKop   int64
	Status      string
	CreatedAt   time.Time
	ConfirmedAt *time.Time
}

type PlanRepository interface {
	GetAll(ctx context.Context) ([]Plan, error)
	GetByID(ctx context.Context, planID int64) (Plan, error)
	GetByName(ctx context.Context, name string) (Plan, error)
}

type PaymentRepository interface {
	Create(ctx context.Context, p *Payment) error
	GetByYookassaID(ctx context.Context, yookassaID string) (Payment, error)
	UpdateStatus(ctx context.Context, yookassaID, status string) error
}

// PlanIsUnlimited returns true for plans that get all Unlimited features.
// Add new plan names here to automatically inherit everything.
func PlanIsUnlimited(name string) bool {
	return name == "unlimited" || name == "friends"
}

// PlanIsPaidOrAbove returns true for any non-free plan.
func PlanIsPaidOrAbove(name string) bool {
	return name != "" && name != "free"
}

type BillingService interface {
	GetPlans(ctx context.Context) ([]Plan, error)
	GetUserPlan(ctx context.Context, userID int64) (Plan, error)
	CreatePayment(ctx context.Context, userID int64, planName string) (string, error) // returns redirect URL
	HandleWebhook(ctx context.Context, yookassaID, status string) error
}
