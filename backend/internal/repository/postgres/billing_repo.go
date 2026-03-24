package postgres

import (
	"context"
	"database/sql"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type PlanRepository struct {
	Conn *sql.DB
}

func NewPlanRepository(conn *sql.DB) *PlanRepository {
	return &PlanRepository{Conn: conn}
}

func (r *PlanRepository) GetAll(ctx context.Context) ([]domain.Plan, error) {
	const q = `SELECT plan_id, name, price_kop, max_links, has_analytics FROM plans ORDER BY price_kop`
	rows, err := r.Conn.QueryContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plans []domain.Plan
	for rows.Next() {
		var p domain.Plan
		if err := rows.Scan(&p.PlanID, &p.Name, &p.PriceKop, &p.MaxLinks, &p.HasAnalytics); err != nil {
			return nil, err
		}
		plans = append(plans, p)
	}
	return plans, rows.Err()
}

func (r *PlanRepository) GetByID(ctx context.Context, planID int64) (domain.Plan, error) {
	const q = `SELECT plan_id, name, price_kop, max_links, has_analytics FROM plans WHERE plan_id = $1`
	var p domain.Plan
	err := r.Conn.QueryRowContext(ctx, q, planID).Scan(&p.PlanID, &p.Name, &p.PriceKop, &p.MaxLinks, &p.HasAnalytics)
	return p, err
}

func (r *PlanRepository) GetByName(ctx context.Context, name string) (domain.Plan, error) {
	const q = `SELECT plan_id, name, price_kop, max_links, has_analytics FROM plans WHERE name = $1`
	var p domain.Plan
	err := r.Conn.QueryRowContext(ctx, q, name).Scan(&p.PlanID, &p.Name, &p.PriceKop, &p.MaxLinks, &p.HasAnalytics)
	return p, err
}

type PaymentRepository struct {
	Conn *sql.DB
}

func NewPaymentRepository(conn *sql.DB) *PaymentRepository {
	return &PaymentRepository{Conn: conn}
}

func (r *PaymentRepository) Create(ctx context.Context, p *domain.Payment) error {
	const q = `
		INSERT INTO payments (user_id, plan_id, yookassa_id, amount_kop, status, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING payment_id
	`
	return r.Conn.QueryRowContext(ctx, q,
		p.UserID, p.PlanID, p.YookassaID, p.AmountKop, p.Status,
	).Scan(&p.PaymentID)
}

func (r *PaymentRepository) GetByYookassaID(ctx context.Context, yookassaID string) (domain.Payment, error) {
	const q = `SELECT payment_id, user_id, plan_id, yookassa_id, amount_kop, status FROM payments WHERE yookassa_id = $1`
	var p domain.Payment
	err := r.Conn.QueryRowContext(ctx, q, yookassaID).Scan(
		&p.PaymentID, &p.UserID, &p.PlanID, &p.YookassaID, &p.AmountKop, &p.Status,
	)
	return p, err
}

func (r *PaymentRepository) UpdateStatus(ctx context.Context, yookassaID, status string) error {
	const q = `UPDATE payments SET status = $1, confirmed_at = NOW() WHERE yookassa_id = $2`
	_, err := r.Conn.ExecContext(ctx, q, status, yookassaID)
	return err
}
