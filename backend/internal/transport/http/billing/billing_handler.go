package http

import (
	"encoding/json"
	"net/http"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc domain.BillingService
}

func NewBillingHandler(svc domain.BillingService) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) GetPlans(c *gin.Context) {
	plans, err := h.svc.GetPlans(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, plans)
}

func (h *Handler) GetUserPlan(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	plan, err := h.svc.GetUserPlan(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, plan)
}

func (h *Handler) CreatePayment(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	var req struct {
		Plan string `json:"plan"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "plan is required"})
		return
	}

	redirectURL, err := h.svc.CreatePayment(c.Request.Context(), userID, req.Plan)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if redirectURL == "" {
		// Free plan, assigned directly
		c.JSON(http.StatusOK, gin.H{"message": "plan updated", "redirect_url": ""})
		return
	}

	c.JSON(http.StatusOK, gin.H{"redirect_url": redirectURL})
}

type yookassaWebhookPayload struct {
	Event  string `json:"event"`
	Object struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	} `json:"object"`
}

func (h *Handler) Webhook(c *gin.Context) {
	var payload yookassaWebhookPayload
	if err := json.NewDecoder(c.Request.Body).Decode(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	if err := h.svc.HandleWebhook(c.Request.Context(), payload.Object.ID, payload.Object.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
