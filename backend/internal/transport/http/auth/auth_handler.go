package http

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/dto"
	transport "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http"
)

type Handler struct {
	svc domain.UserService
}

func NewAuthHandler(svc domain.UserService) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Register(c *gin.Context) {
	var req dto.UserDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("decode error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := req.ToDomain()

	if err := h.svc.Register(c.Request.Context(), &user); err != nil {
		log.Println("REGISTER ERROR:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := transport.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  dto.ToDTO(user),
	})
}

func (h *Handler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.svc.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	token, err := transport.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  dto.ToDTO(user),
	})
}

func (h *Handler) GetMe(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	user, err := h.svc.GetUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, dto.ToDTO(user))
}

func (h *Handler) DeleteMe(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	if err := h.svc.DeleteUser(c.Request.Context(), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete account"})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) UpdateMe(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	var req dto.UserDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := req.ToDomain()
	user.ID = userID

	if err := h.svc.UpdateUser(c.Request.Context(), &user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := h.svc.GetUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve updated user"})
		return
	}
	c.JSON(http.StatusOK, dto.ToDTO(updated))
}

func (h *Handler) RequestPasswordChange(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	var req struct {
		NewPassword string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.RequestPasswordChange(c.Request.Context(), userID, req.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "code sent"})
}

func (h *Handler) RequestPasswordReset(c *gin.Context) {
	var req struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Always return success to not reveal if email exists
	if err := h.svc.RequestPasswordReset(c.Request.Context(), req.Email); err != nil {
		log.Printf("[forgot-password] failed to send reset email to %s: %v", req.Email, err)
	}
	c.JSON(http.StatusOK, gin.H{"message": "if the email exists, a reset link has been sent"})
}

func (h *Handler) ResetPassword(c *gin.Context) {
	var req struct {
		Token       string `json:"token"`
		NewPassword string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.ResetPassword(c.Request.Context(), req.Token, req.NewPassword); err != nil {
		if err == domain.ErrInvalidCode {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ссылка недействительна или истекла"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "password reset successful"})
}

func (h *Handler) ConfirmPasswordChange(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	var req struct {
		Code string `json:"code"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.ConfirmPasswordChange(c.Request.Context(), userID, req.Code); err != nil {
		status := http.StatusBadRequest
		if err == domain.ErrInvalidCode {
			status = http.StatusUnauthorized
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "password changed"})
}
