package http

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/analytics/geoip"
	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/analytics/useragent"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	linkSvc         domain.LinkService
	analyticsSvc    domain.AnalyticsService
	billingSvc      domain.BillingService
	customDomainSvc domain.CustomDomainService
}

func NewLinkHandler(linkSvc domain.LinkService, analyticsSvc domain.AnalyticsService, billingSvc domain.BillingService, customDomainSvc domain.CustomDomainService) *Handler {
	return &Handler{linkSvc: linkSvc, analyticsSvc: analyticsSvc, billingSvc: billingSvc, customDomainSvc: customDomainSvc}
}

func (h *Handler) ShortenPublic(c *gin.Context) {
	var req struct {
		URL string `json:"url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.URL) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url is required"})
		return
	}

	req.URL = strings.TrimSpace(req.URL)
	if !strings.HasPrefix(req.URL, "http://") && !strings.HasPrefix(req.URL, "https://") {
		req.URL = "https://" + req.URL
	}

	// ownerID = 0 → stored as NULL (guest link)
	link, err := h.linkSvc.Create(c.Request.Context(), 0, req.URL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	appDomain := os.Getenv("APP_DOMAIN")
	if appDomain == "" {
		appDomain = "localhost"
	}

	shortURL := "https://" + appDomain + "/r/" + link.Slug

	c.JSON(http.StatusCreated, gin.H{
		"slug":      link.Slug,
		"short_url": shortURL,
	})
}

func (h *Handler) Create(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	// Check plan limits
	plan, err := h.billingSvc.GetUserPlan(c.Request.Context(), userID)
	if err == nil && plan.MaxLinks >= 0 {
		count, _ := h.linkSvc.CountByOwner(c.Request.Context(), userID)
		if count >= plan.MaxLinks {
			c.JSON(http.StatusForbidden, gin.H{
				"error": fmt.Sprintf("You have reached your plan limit of %d links. Upgrade your plan to create more.", plan.MaxLinks),
			})
			return
		}
	}

	var req struct {
		URL            string  `json:"url"`
		CustomDomainID *string `json:"custom_domain_id,omitempty"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url is required"})
		return
	}

	req.URL = strings.TrimSpace(req.URL)
	if req.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url is required"})
		return
	}

	if !strings.HasPrefix(req.URL, "http://") && !strings.HasPrefix(req.URL, "https://") {
		req.URL = "https://" + req.URL
	}

	link, err := h.linkSvc.Create(c.Request.Context(), userID, req.URL, req.CustomDomainID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, linkToJSON(link))
}

func (h *Handler) List(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	links, err := h.linkSvc.ListByOwner(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result := make([]map[string]interface{}, 0, len(links))
	for _, l := range links {
		result = append(result, linkToJSON(l))
	}
	c.JSON(http.StatusOK, result)
}

func (h *Handler) Delete(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	linkID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid link id"})
		return
	}

	if err := h.linkSvc.Delete(c.Request.Context(), linkID, userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *Handler) Redirect(c *gin.Context) {
	slug := c.Param("slug")
	host := c.Request.Host

	// Strip port if present
	if idx := strings.LastIndex(host, ":"); idx != -1 {
		host = host[:idx]
	}

	var link domain.Link
	var err error

	appDomain := os.Getenv("APP_DOMAIN")
	if appDomain == "" {
		appDomain = "localhost"
	}

	if host == appDomain || host == "www."+appDomain || host == "localhost" {
		// Normal lookup on our own domain
		link, err = h.linkSvc.GetBySlug(c.Request.Context(), slug)
	} else {
		// Custom domain lookup — join through custom_domains
		cd, cdErr := h.customDomainSvc.GetByDomain(c.Request.Context(), host)
		if cdErr != nil || !cd.Verified {
			c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
			return
		}
		link, err = h.linkSvc.GetBySlugAndDomain(c.Request.Context(), slug, cd.ID)
	}

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
		return
	}

	ua := c.GetHeader("User-Agent")
	info := useragent.Parse(ua)

	clientIP := c.ClientIP()
	country := c.GetHeader("CF-IPCountry")
	if country == "" {
		country = geoip.LookupCountry(clientIP)
	}

	referer := c.GetHeader("Referer")

	event := &domain.ClickEvent{
		LinkID:    link.ID,
		UserAgent: ua,
		Country:   country,
		Device:    info.Device,
		Browser:   info.Browser,
		OS:        info.OS,
		Referer:   referer,
	}
	_ = h.analyticsSvc.TrackClick(c.Request.Context(), event)

	c.Redirect(http.StatusFound, link.TargetURL)
}

func linkToJSON(l domain.Link) map[string]interface{} {
	m := map[string]interface{}{
		"id":         l.ID,
		"slug":       l.Slug,
		"target_url": l.TargetURL,
		"created_at": l.CreatedAt,
		"is_active":  l.IsActive,
	}
	if l.CustomDomainID != nil {
		m["custom_domain_id"] = *l.CustomDomainID
	}
	return m
}

// ==================== Analytics Handler ====================

type AnalyticsHandler struct {
	analyticsSvc    domain.AnalyticsService
	billingSvc      domain.BillingService
	linkSvc         domain.LinkService
	customDomainSvc domain.CustomDomainService
}

func NewAnalyticsHandler(svc domain.AnalyticsService, billingSvc domain.BillingService, linkSvc domain.LinkService, customDomainSvc domain.CustomDomainService) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsSvc: svc, billingSvc: billingSvc, linkSvc: linkSvc, customDomainSvc: customDomainSvc}
}

func (h *AnalyticsHandler) GetOverview(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	plan, _ := h.billingSvc.GetUserPlan(c.Request.Context(), userID)
	planName := plan.Name
	if planName == "" {
		planName = "free"
	}

	stats, err := h.analyticsSvc.GetOverview(c.Request.Context(), userID, planName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	w := c.Writer
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Plan-Name", planName)
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(stats)
}

func (h *AnalyticsHandler) GetAdvanced(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	plan, err := h.billingSvc.GetUserPlan(c.Request.Context(), userID)
	if err == nil {
		if !plan.HasAnalytics {
			c.JSON(http.StatusForbidden, gin.H{"error": "analytics_locked", "message": "Upgrade your plan to access analytics"})
			return
		}
		if plan.Name != "unlimited" {
			c.JSON(http.StatusForbidden, gin.H{"error": "advanced_locked", "message": "Advanced analytics is available on the Unlimited plan"})
			return
		}
	}

	stats, err := h.analyticsSvc.GetAdvanced(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *AnalyticsHandler) GetLinkDetail(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	linkID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid link id"})
		return
	}

	// Verify link belongs to user
	links, err := h.linkSvc.ListByOwner(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var found domain.Link
	for _, l := range links {
		if l.ID == linkID {
			found = l
			break
		}
	}
	if found.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
		return
	}

	plan, _ := h.billingSvc.GetUserPlan(c.Request.Context(), userID)
	planName := plan.Name
	if planName == "" {
		planName = "free"
	}

	stats, err := h.analyticsSvc.GetLinkDetail(c.Request.Context(), linkID, found.Slug, found.TargetURL, found.CreatedAt, planName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	resp := gin.H{
		"stats":     stats,
		"plan_name": planName,
	}
	if found.CustomDomainID != nil {
		resp["custom_domain_id"] = *found.CustomDomainID
		if h.customDomainSvc != nil {
			if cd, err := h.customDomainSvc.GetByID(c.Request.Context(), *found.CustomDomainID); err == nil {
				resp["custom_domain"] = cd.Domain
			}
		}
	}

	c.JSON(http.StatusOK, resp)
}

func (h *AnalyticsHandler) ExportCSV(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	plan, err := h.billingSvc.GetUserPlan(c.Request.Context(), userID)
	if err == nil {
		if !plan.HasAnalytics {
			c.JSON(http.StatusForbidden, gin.H{"error": "analytics_locked"})
			return
		}
		if plan.Name != "unlimited" {
			c.JSON(http.StatusForbidden, gin.H{"error": "advanced_locked", "message": "CSV export is available on the Unlimited plan"})
			return
		}
	}

	rows, err := h.analyticsSvc.GetCSVExport(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Writer.Header().Set("Content-Type", "text/csv")
	c.Writer.Header().Set("Content-Disposition", "attachment; filename=analytics_export.csv")

	w := csv.NewWriter(c.Writer)
	_ = w.Write([]string{"Slug", "Clicked At", "Country", "Device", "Browser", "OS", "Referer"})
	for _, r := range rows {
		_ = w.Write([]string{r.Slug, r.ClickedAt, r.Country, r.Device, r.Browser, r.OS, r.Referer})
	}
	w.Flush()
}
