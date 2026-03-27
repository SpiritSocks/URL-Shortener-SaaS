package bio

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	bioSvc     domain.BioPageService
	billingSvc domain.BillingService
}

func NewBioHandler(bioSvc domain.BioPageService, billingSvc domain.BillingService) *Handler {
	return &Handler{bioSvc: bioSvc, billingSvc: billingSvc}
}

func (h *Handler) CreatePage(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	var req struct {
		Handle      string `json:"handle"`
		DisplayName string `json:"display_name"`
		BioText     string `json:"bio_text"`
		AvatarURL   string `json:"avatar_url"`
		Theme       string `json:"theme"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Handle == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "handle is required"})
		return
	}

	page, err := h.bioSvc.CreatePage(c.Request.Context(), userID, req.Handle, req.DisplayName, req.BioText, req.AvatarURL, req.Theme)
	if err != nil {
		if errors.Is(err, domain.ErrHandleTaken) {
			c.JSON(http.StatusConflict, gin.H{"error": "handle_taken", "message": "This handle is already taken"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, pageToJSON(page))
}

func (h *Handler) UpdatePage(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	var req struct {
		DisplayName string `json:"display_name"`
		BioText     string `json:"bio_text"`
		AvatarURL   string `json:"avatar_url"`
		Theme       string `json:"theme"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	page, err := h.bioSvc.UpdatePage(c.Request.Context(), userID, req.DisplayName, req.BioText, req.AvatarURL, req.Theme)
	if err != nil {
		if errors.Is(err, domain.ErrBioPageNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "bio page not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pageToJSON(page))
}

func (h *Handler) GetMyPage(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	page, links, err := h.bioSvc.GetMyPage(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, domain.ErrBioPageNotFound) {
			c.JSON(http.StatusOK, gin.H{"exists": false})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	plan, _ := h.billingSvc.GetUserPlan(c.Request.Context(), userID)

	linksList := make([]map[string]interface{}, 0, len(links))
	for _, bl := range links {
		linksList = append(linksList, bioLinkToJSON(bl))
	}

	c.JSON(http.StatusOK, gin.H{
		"exists":         true,
		"page":           pageToJSON(page),
		"links":          linksList,
		"max_bio_links":  plan.MaxBioLinks,
	})
}

func (h *Handler) AddBioLink(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	var req struct {
		Title string `json:"title"`
		URL   string `json:"url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Title == "" || req.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title and url are required"})
		return
	}

	bl, err := h.bioSvc.AddLink(c.Request.Context(), userID, req.Title, req.URL)
	if err != nil {
		if errors.Is(err, domain.ErrBioPageNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "create a bio page first"})
			return
		}
		if errors.Is(err, domain.ErrBioLinkLimitReached) {
			c.JSON(http.StatusForbidden, gin.H{"error": "bio_link_limit", "message": "Bio link limit reached. Upgrade your plan to add more."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, bioLinkToJSON(bl))
}

func (h *Handler) RemoveBioLink(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)
	bioLinkID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid bio link id"})
		return
	}

	if err := h.bioSvc.RemoveLink(c.Request.Context(), userID, bioLinkID); err != nil {
		if errors.Is(err, domain.ErrBioLinkNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "bio link not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "bio link removed"})
}

func (h *Handler) ReorderLinks(c *gin.Context) {
	userID := c.MustGet("user_id").(int64)

	var req struct {
		OrderedIDs []int64 `json:"ordered_ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || len(req.OrderedIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ordered_ids is required"})
		return
	}

	if err := h.bioSvc.ReorderLinks(c.Request.Context(), userID, req.OrderedIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "links reordered"})
}

func (h *Handler) GetPublicPage(c *gin.Context) {
	handle := c.Param("handle")
	if handle == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "handle is required"})
		return
	}

	page, links, showBranding, err := h.bioSvc.GetPublicPage(c.Request.Context(), handle)
	if err != nil {
		if errors.Is(err, domain.ErrBioPageNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "bio page not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	linksList := make([]map[string]interface{}, 0, len(links))
	for _, bl := range links {
		linksList = append(linksList, bioLinkToJSON(bl))
	}

	c.JSON(http.StatusOK, gin.H{
		"page":          pageToJSON(page),
		"links":         linksList,
		"show_branding": showBranding,
	})
}

func pageToJSON(p domain.BioPage) map[string]interface{} {
	return map[string]interface{}{
		"id":           p.ID,
		"handle":       p.Handle,
		"display_name": p.DisplayName,
		"bio_text":     p.BioText,
		"avatar_url":   p.AvatarURL,
		"theme":        p.Theme,
		"created_at":   p.CreatedAt,
		"updated_at":   p.UpdatedAt,
	}
}

func bioLinkToJSON(bl domain.BioLink) map[string]interface{} {
	return map[string]interface{}{
		"id":         bl.ID,
		"link_id":    bl.LinkID,
		"title":      bl.Title,
		"slug":       bl.Slug,
		"target_url": bl.TargetURL,
		"position":   bl.Position,
		"is_visible": bl.IsVisible,
	}
}
