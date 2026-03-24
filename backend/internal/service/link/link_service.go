package service

import (
	"context"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type service struct {
	repo domain.LinkRepository
}

func NewLinkService(repo domain.LinkRepository) domain.LinkService {
	return &service{repo: repo}
}

func (srv *service) Create(ctx context.Context, ownerID int64, targetURL string, customDomainID *string) (domain.Link, error) {
	slug := SlugGenerator(targetURL)

	link := domain.Link{
		OwnerID:        ownerID,
		Slug:           slug,
		TargetURL:      targetURL,
		IsActive:       true,
		CustomDomainID: customDomainID,
	}

	if err := srv.repo.Create(ctx, &link); err != nil {
		return domain.Link{}, err
	}

	return link, nil
}

func (srv *service) Delete(ctx context.Context, linkID, ownerID int64) error {
	return srv.repo.Delete(ctx, linkID, ownerID)
}

func (srv *service) GetBySlug(ctx context.Context, slug string) (domain.Link, error) {
	return srv.repo.GetBySlug(ctx, slug)
}

func (srv *service) GetBySlugAndDomain(ctx context.Context, slug string, domainID string) (domain.Link, error) {
	return srv.repo.GetBySlugAndDomain(ctx, slug, domainID)
}

func (srv *service) ListByOwner(ctx context.Context, ownerID int64) ([]domain.Link, error) {
	return srv.repo.ListByOwner(ctx, ownerID)
}

func (srv *service) CountByOwner(ctx context.Context, ownerID int64) (int64, error) {
	return srv.repo.CountByOwner(ctx, ownerID)
}
