package http

import (
	"encoding/json"
	"log"
	"net/http"

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

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.UserDTO

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("decode error:", err)
		writeJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	user := req.ToDomain()

	if err := h.svc.Register(r.Context(), &user); err != nil {
		log.Println("REGISTER ERROR:", err)
		writeJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	token, err := transport.GenerateToken(user.ID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"token": token,
		"user":  dto.ToDTO(user),
	})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.svc.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		writeJSONError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	token, err := transport.GenerateToken(user.ID)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"token": token,
		"user":  dto.ToDTO(user),
	})
}

func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request, userID int64) {
	user, err := h.svc.GetUser(r.Context(), userID)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "user not found")
		return
	}
	writeJSON(w, http.StatusOK, dto.ToDTO(user))
}

func (h *Handler) UpdateMe(w http.ResponseWriter, r *http.Request, userID int64) {
	var req dto.UserDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	user := req.ToDomain()
	user.ID = userID

	if err := h.svc.UpdateUser(r.Context(), &user); err != nil {
		writeJSONError(w, http.StatusBadRequest, err.Error())
		return
	}

	updated, _ := h.svc.GetUser(r.Context(), userID)
	writeJSON(w, http.StatusOK, dto.ToDTO(updated))
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeJSONError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
