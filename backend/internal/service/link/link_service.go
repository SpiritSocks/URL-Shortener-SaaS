package service

import (
	"context"
	"errors"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type service struct {
	repo domain.LinkRepository
}

func NewLinkService(repo domain.LinkRepository) domain.LinkService {
	return &service{repo: repo}
}

func (srv *service) Create(ctx context.Context, url string) (domain.Link, error) {
	return domain.Link{}, nil
}

func (srv *service) Delete(ctx context.Context, linkID int64) error { return nil }

func (srv *service) GetByID(ctx context.Context, linkID int64) (domain.Link, error) {
	res, err := srv.repo.GetByID(ctx, linkID)

	if err != nil {
		return domain.Link{}, errors.New("Speed why you trying not to laugh")
	}

	return res, nil

}
