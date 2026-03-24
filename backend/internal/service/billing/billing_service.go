package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	"github.com/google/uuid"
)

type service struct {
	planRepo    domain.PlanRepository
	paymentRepo domain.PaymentRepository
	userRepo    domain.UserRepository
}

func NewBillingService(planRepo domain.PlanRepository, paymentRepo domain.PaymentRepository, userRepo domain.UserRepository) domain.BillingService {
	return &service{
		planRepo:    planRepo,
		paymentRepo: paymentRepo,
		userRepo:    userRepo,
	}
}

func (s *service) GetPlans(ctx context.Context) ([]domain.Plan, error) {
	return s.planRepo.GetAll(ctx)
}

func (s *service) GetUserPlan(ctx context.Context, userID int64) (domain.Plan, error) {
	user, err := s.userRepo.GetUser(ctx, userID)
	if err != nil {
		return domain.Plan{}, err
	}
	planID := user.PlanID
	if planID == 0 {
		planID = 1
	}
	return s.planRepo.GetByID(ctx, planID)
}

type yookassaAmount struct {
	Value    string `json:"value"`
	Currency string `json:"currency"`
}

type yookassaConfirmation struct {
	Type      string `json:"type"`
	ReturnURL string `json:"return_url,omitempty"`
	URL       string `json:"confirmation_url,omitempty"`
}

type yookassaRequest struct {
	Amount       yookassaAmount       `json:"amount"`
	Confirmation yookassaConfirmation `json:"confirmation"`
	Description  string               `json:"description"`
	Capture      bool                 `json:"capture"`
	Metadata     map[string]string    `json:"metadata,omitempty"`
}

type yookassaResponse struct {
	ID           string               `json:"id"`
	Status       string               `json:"status"`
	Confirmation yookassaConfirmation `json:"confirmation"`
}

func (s *service) CreatePayment(ctx context.Context, userID int64, planName string) (string, error) {
	plan, err := s.planRepo.GetByName(ctx, planName)
	if err != nil {
		return "", fmt.Errorf("plan not found: %w", err)
	}

	if plan.PriceKop == 0 {
		// Free plan — just assign directly
		user, err := s.userRepo.GetUser(ctx, userID)
		if err != nil {
			return "", err
		}
		user.PlanID = plan.PlanID
		if err := s.userRepo.UpdateUser(ctx, &user); err != nil {
			return "", err
		}
		return "", nil
	}

	shopID := os.Getenv("YOOKASSA_SHOP_ID")
	secretKey := os.Getenv("YOOKASSA_SECRET_KEY")
	returnURL := os.Getenv("YOOKASSA_RETURN_URL")
	if returnURL == "" {
		returnURL = "http://localhost:5173/profile"
	}

	priceRub := fmt.Sprintf("%.2f", float64(plan.PriceKop)/100.0)

	reqBody := yookassaRequest{
		Amount: yookassaAmount{
			Value:    priceRub,
			Currency: "RUB",
		},
		Confirmation: yookassaConfirmation{
			Type:      "redirect",
			ReturnURL: returnURL,
		},
		Description: fmt.Sprintf("Подписка на план %s", plan.Name),
		Capture:     true,
		Metadata: map[string]string{
			"user_id":   fmt.Sprintf("%d", userID),
			"plan_name": plan.Name,
		},
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.yookassa.ru/v3/payments", bytes.NewReader(body))
	if err != nil {
		return "", err
	}

	req.SetBasicAuth(shopID, secretKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Idempotence-Key", uuid.New().String())

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("yookassa request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("yookassa returned status %d", resp.StatusCode)
	}

	var ykResp yookassaResponse
	if err := json.NewDecoder(resp.Body).Decode(&ykResp); err != nil {
		return "", err
	}

	payment := &domain.Payment{
		UserID:     userID,
		PlanID:     plan.PlanID,
		YookassaID: ykResp.ID,
		AmountKop:  plan.PriceKop,
		Status:     "pending",
	}
	if err := s.paymentRepo.Create(ctx, payment); err != nil {
		return "", err
	}

	return ykResp.Confirmation.URL, nil
}

func (s *service) HandleWebhook(ctx context.Context, yookassaID, status string) error {
	if err := s.paymentRepo.UpdateStatus(ctx, yookassaID, status); err != nil {
		return err
	}

	if status != "succeeded" {
		return nil
	}

	payment, err := s.paymentRepo.GetByYookassaID(ctx, yookassaID)
	if err != nil {
		return err
	}

	user, err := s.userRepo.GetUser(ctx, payment.UserID)
	if err != nil {
		return err
	}

	user.PlanID = payment.PlanID
	return s.userRepo.UpdateUser(ctx, &user)
}
