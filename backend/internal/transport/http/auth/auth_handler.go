package http

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/dto"
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
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, dto.ToDTO(user))
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) (domain.User, error) {
	return domain.User{}, nil
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeJSONError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": msg,
	})
}
