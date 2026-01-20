package http

import (
	"context"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service"
)

type Handler struct {
	svc service.LinkService
}

func NewLinkHandler(svc domain.LinkRepository) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Create(ctx context.Context, url string) (domain.Link, error) {
	return domain.Link{}, nil
}

func (h *Handler) Delete(ctx context.Context, linkID int64) error { return nil }
