package customdomain

import (
	"context"
	"fmt"
	"net"
	"os"
	"strings"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
)

type service struct {
	repo domain.CustomDomainRepository
}

func NewCustomDomainService(repo domain.CustomDomainRepository) domain.CustomDomainService {
	return &service{repo: repo}
}

func (s *service) Add(ctx context.Context, userID int64, domainName string) (domain.CustomDomain, error) {
	domainName = strings.ToLower(strings.TrimSpace(domainName))
	if domainName == "" {
		return domain.CustomDomain{}, fmt.Errorf("domain name is required")
	}

	d := domain.CustomDomain{
		UserID: userID,
		Domain: domainName,
	}
	if err := s.repo.Create(ctx, &d); err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique") {
			return domain.CustomDomain{}, domain.ErrDomainTaken
		}
		return domain.CustomDomain{}, err
	}
	return d, nil
}

func (s *service) ListByUser(ctx context.Context, userID int64) ([]domain.CustomDomain, error) {
	return s.repo.ListByUser(ctx, userID)
}

func (s *service) Verify(ctx context.Context, id string, userID int64) (domain.CustomDomain, error) {
	d, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return domain.CustomDomain{}, err
	}
	if d.UserID != userID {
		return domain.CustomDomain{}, domain.ErrUnauthorized
	}

	// Check if the domain's CNAME points to our server
	expectedTarget := os.Getenv("APP_DOMAIN")
	if expectedTarget == "" {
		expectedTarget = "localhost"
	}

	verified := checkCNAME(d.Domain, expectedTarget)
	if err := s.repo.UpdateVerified(ctx, id, verified); err != nil {
		return domain.CustomDomain{}, err
	}

	d.Verified = verified
	if verified {
		d.SSLStatus = "active"
		_ = s.repo.UpdateSSLStatus(ctx, id, "active")
	}

	if !verified {
		return d, domain.ErrDomainNotVerified
	}
	return d, nil
}

func (s *service) Delete(ctx context.Context, id string, userID int64) error {
	return s.repo.Delete(ctx, id, userID)
}

func (s *service) GetByDomain(ctx context.Context, domainName string) (domain.CustomDomain, error) {
	return s.repo.GetByDomain(ctx, domainName)
}

func (s *service) GetByID(ctx context.Context, id string) (domain.CustomDomain, error) {
	return s.repo.GetByID(ctx, id)
}

func checkCNAME(domainName, expectedTarget string) bool {
	cname, err := net.LookupCNAME(domainName)
	if err != nil {
		return false
	}
	cname = strings.TrimSuffix(cname, ".")
	expectedTarget = strings.TrimSuffix(expectedTarget, ".")
	return strings.EqualFold(cname, expectedTarget)
}
