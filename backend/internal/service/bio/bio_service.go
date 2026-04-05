package bio

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

var handleRe = regexp.MustCompile(`^[a-z0-9_-]{3,50}$`)

type service struct {
	bioRepo    domain.BioPageRepository
	linkSvc    domain.LinkService
	billingSvc domain.BillingService
}

func NewBioService(bioRepo domain.BioPageRepository, linkSvc domain.LinkService, billingSvc domain.BillingService) domain.BioPageService {
	return &service{bioRepo: bioRepo, linkSvc: linkSvc, billingSvc: billingSvc}
}

func (s *service) CreatePage(ctx context.Context, userID int64, handle, displayName, bioText, avatarURL, theme string) (domain.BioPage, error) {
	handle = strings.ToLower(strings.TrimSpace(handle))
	if !handleRe.MatchString(handle) {
		return domain.BioPage{}, fmt.Errorf("handle must be 3-50 characters: lowercase letters, numbers, hyphens, underscores")
	}

	displayName = strings.TrimSpace(displayName)
	bioText = strings.TrimSpace(bioText)
	avatarURL = strings.TrimSpace(avatarURL)
	theme = strings.TrimSpace(theme)
	if theme == "" {
		theme = "default"
	}

	page := domain.BioPage{
		UserID:      userID,
		Handle:      handle,
		DisplayName: displayName,
		BioText:     bioText,
		AvatarURL:   avatarURL,
		Theme:       theme,
	}
	if err := s.bioRepo.CreatePage(ctx, &page); err != nil {
		return domain.BioPage{}, err
	}
	return page, nil
}

func (s *service) UpdatePage(ctx context.Context, userID int64, displayName, bioText, avatarURL, theme string) (domain.BioPage, error) {
	page, err := s.bioRepo.GetPageByUserID(ctx, userID)
	if err != nil {
		return domain.BioPage{}, err
	}

	page.DisplayName = strings.TrimSpace(displayName)
	page.BioText = strings.TrimSpace(bioText)
	page.AvatarURL = strings.TrimSpace(avatarURL)
	theme = strings.TrimSpace(theme)
	if theme != "" {
		page.Theme = theme
	}

	if err := s.bioRepo.UpdatePage(ctx, &page); err != nil {
		return domain.BioPage{}, err
	}
	return page, nil
}

func (s *service) GetMyPage(ctx context.Context, userID int64) (domain.BioPage, []domain.BioLink, error) {
	page, err := s.bioRepo.GetPageByUserID(ctx, userID)
	if err != nil {
		return domain.BioPage{}, nil, err
	}
	links, err := s.bioRepo.ListLinks(ctx, page.ID)
	if err != nil {
		return domain.BioPage{}, nil, err
	}
	return page, links, nil
}

func (s *service) AddLink(ctx context.Context, userID int64, title, targetURL string) (domain.BioLink, error) {
	page, err := s.bioRepo.GetPageByUserID(ctx, userID)
	if err != nil {
		return domain.BioLink{}, err
	}

	// Check plan limits
	plan, err := s.billingSvc.GetUserPlan(ctx, userID)
	if err == nil && plan.MaxBioLinks >= 0 {
		count, _ := s.bioRepo.CountLinks(ctx, page.ID)
		if count >= plan.MaxBioLinks {
			return domain.BioLink{}, domain.ErrBioLinkLimitReached
		}
	}

	// Create a short link via existing link service
	link, err := s.linkSvc.Create(ctx, userID, targetURL, nil)
	if err != nil {
		return domain.BioLink{}, fmt.Errorf("create short link: %w", err)
	}

	bl := domain.BioLink{
		BioPageID: page.ID,
		LinkID:    link.ID,
		Title:     strings.TrimSpace(title),
		Slug:      link.Slug,
		TargetURL: link.TargetURL,
	}
	if err := s.bioRepo.AddLink(ctx, &bl); err != nil {
		return domain.BioLink{}, err
	}
	return bl, nil
}

func (s *service) RemoveLink(ctx context.Context, userID int64, bioLinkID int64) error {
	page, err := s.bioRepo.GetPageByUserID(ctx, userID)
	if err != nil {
		return err
	}
	return s.bioRepo.RemoveLink(ctx, bioLinkID, page.ID)
}

func (s *service) ReorderLinks(ctx context.Context, userID int64, orderedIDs []int64) error {
	page, err := s.bioRepo.GetPageByUserID(ctx, userID)
	if err != nil {
		return err
	}
	return s.bioRepo.ReorderLinks(ctx, page.ID, orderedIDs)
}

func (s *service) GetPublicPage(ctx context.Context, handle string) (domain.BioPage, []domain.BioLink, bool, error) {
	page, err := s.bioRepo.GetPageByHandle(ctx, handle)
	if err != nil {
		return domain.BioPage{}, nil, false, err
	}

	links, err := s.bioRepo.ListVisibleLinks(ctx, page.ID)
	if err != nil {
		return domain.BioPage{}, nil, false, err
	}

	// Determine branding based on owner's plan
	showBranding := true
	plan, err := s.billingSvc.GetUserPlan(ctx, page.UserID)
	if err == nil && (plan.Name == "unlimited" || plan.Name == "friends") {
		showBranding = false
	}

	return page, links, showBranding, nil
}
