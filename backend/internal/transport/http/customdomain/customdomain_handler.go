package customdomain

import (
	"errors"
	"net"
	"net/http"
	"os"
	"strings"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc        domain.CustomDomainService
	billingSvc domain.BillingService
}

func NewCustomDomainHandler(svc domain.CustomDomainService, billingSvc domain.BillingService) *Handler {
	return &Handler{svc: svc, billingSvc: billingSvc}
}

func (h *Handler) requirePaidPlan(c *gin.Context) bool {
	userID := c.MustGet("user_id").(int64)
	plan, err := h.billingSvc.GetUserPlan(c.Request.Context(), userID)
	if err != nil || plan.Name == "free" {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "custom_domains_locked",
			"message": "Custom domains are available on Pro and Unlimited plans. Upgrade to use this feature.",
		})
		return false
	}
	return true
}

func (h *Handler) Add(c *gin.Context) {
	if !h.requirePaidPlan(c) {
		return
	}
	userID := c.MustGet("user_id").(int64)

	var req struct {
		Domain string `json:"domain"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Domain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "domain is required"})
		return
	}

	d, err := h.svc.Add(c.Request.Context(), userID, req.Domain)
	if err != nil {
		if errors.Is(err, domain.ErrDomainTaken) {
			c.JSON(http.StatusConflict, gin.H{"error": "domain already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, domainToJSON(d))
}

func (h *Handler) List(c *gin.Context) {
	if !h.requirePaidPlan(c) {
		return
	}
	userID := c.MustGet("user_id").(int64)

	domains, err := h.svc.ListByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result := make([]map[string]interface{}, 0, len(domains))
	for _, d := range domains {
		result = append(result, domainToJSON(d))
	}
	c.JSON(http.StatusOK, result)
}

func (h *Handler) Verify(c *gin.Context) {
	if !h.requirePaidPlan(c) {
		return
	}
	userID := c.MustGet("user_id").(int64)
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid domain id"})
		return
	}

	d, err := h.svc.Verify(c.Request.Context(), id, userID)
	if err != nil {
		if errors.Is(err, domain.ErrDomainNotVerified) {
			c.JSON(http.StatusOK, gin.H{
				"domain":   domainToJSON(d),
				"verified": false,
				"message":  "CNAME record not found. Please add a CNAME record pointing to your app domain.",
			})
			return
		}
		if errors.Is(err, domain.ErrDomainNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "domain not found"})
			return
		}
		if errors.Is(err, domain.ErrUnauthorized) {
			c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"domain":   domainToJSON(d),
		"verified": true,
		"message":  "Domain verified successfully!",
	})
}

func (h *Handler) Delete(c *gin.Context) {
	if !h.requirePaidPlan(c) {
		return
	}
	userID := c.MustGet("user_id").(int64)
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid domain id"})
		return
	}

	if err := h.svc.Delete(c.Request.Context(), id, userID); err != nil {
		if errors.Is(err, domain.ErrDomainNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "domain not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "domain deleted"})
}

// Ask is used by Caddy on-demand TLS to decide whether to issue a certificate.
// It returns 200 only for verified custom domains or the main app domain.
func (h *Handler) Ask(c *gin.Context) {
	domainName := strings.ToLower(strings.TrimSpace(c.Query("domain")))
	if domainName == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	if strings.HasSuffix(domainName, ".") {
		domainName = strings.TrimSuffix(domainName, ".")
	}

	if strings.Contains(domainName, ":") {
		if host, _, err := net.SplitHostPort(domainName); err == nil {
			domainName = host
		} else {
			parts := strings.Split(domainName, ":")
			domainName = parts[0]
		}
	}

	appDomain := strings.ToLower(strings.TrimSpace(os.Getenv("APP_DOMAIN")))
	if appDomain != "" {
		appDomain = strings.TrimSuffix(appDomain, ".")
		if domainName == appDomain || domainName == "www."+appDomain {
			c.Status(http.StatusOK)
			return
		}
	}

	d, err := h.svc.GetByDomain(c.Request.Context(), domainName)
	if err != nil || !d.Verified {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	c.Status(http.StatusOK)
}

func domainToJSON(d domain.CustomDomain) map[string]interface{} {
	return map[string]interface{}{
		"id":         d.ID,
		"domain":     d.Domain,
		"verified":   d.Verified,
		"ssl_status": d.SSLStatus,
		"created_at": d.CreatedAt,
	}
}
