package bio

import (
	"fmt"
	"html"
	"html/template"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

var themeCSS = map[string]struct{ bg, text, subtext, btn, btnText, footer string }{
	"default": {"#FAFAF5", "#1a1a1a", "#6b7280", "#343b1b", "#ffffff", "#9ca3af"},
	"dark":    {"#1a1a2e", "#ffffff", "#9ca3af", "#4c6fb1", "#ffffff", "#4b5563"},
	"ocean":   {"linear-gradient(to bottom, #0f3460, #16213e)", "#ffffff", "#bfdbfe", "#16c79a", "#ffffff", "rgba(147,197,253,0.5)"},
	"sunset":  {"linear-gradient(to bottom, #f8b500, #e74c3c)", "#ffffff", "#fef9c3", "rgba(255,255,255,0.9)", "#e74c3c", "rgba(255,255,255,0.5)"},
}

const bioSSRTemplate = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{.Title}}</title>
<meta property="og:title" content="{{.OGTitle}}">
<meta property="og:description" content="{{.OGDescription}}">
<meta property="og:url" content="{{.OGUrl}}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="Linxie">
{{if .OGImage}}<meta property="og:image" content="{{.OGImage}}">
<meta property="og:image:width" content="256">
<meta property="og:image:height" content="256">{{end}}
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{{.OGTitle}}">
<meta name="twitter:description" content="{{.OGDescription}}">
{{if .OGImage}}<meta name="twitter:image" content="{{.OGImage}}">{{end}}
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:48px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:{{.BG}}}
.wrap{width:100%;max-width:28rem;display:flex;flex-direction:column;align-items:center;gap:24px}
.avatar{width:96px;height:96px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,0.3);box-shadow:0 4px 6px rgba(0,0,0,0.1)}
.info{text-align:center}
.name{font-size:1.5rem;font-weight:700;color:{{.TextColor}}}
.handle{font-size:0.875rem;color:{{.SubtextColor}};margin-top:4px}
.bio{font-size:0.875rem;color:{{.SubtextColor}};margin-top:12px;max-width:24rem;white-space:pre-line}
.links{width:100%;display:flex;flex-direction:column;gap:12px;margin-top:8px}
.links a{display:flex;align-items:center;justify-content:center;width:100%;background:{{.BtnBG}};color:{{.BtnText}};font-weight:500;padding:14px 24px;border-radius:12px;text-decoration:none;box-shadow:0 1px 2px rgba(0,0,0,0.05);transition:transform 0.2s,box-shadow 0.2s}
.links a:hover{transform:scale(1.02);box-shadow:0 4px 6px rgba(0,0,0,0.1)}
.footer{margin-top:32px;font-size:0.75rem;color:{{.FooterColor}};text-decoration:none}
.footer:hover{opacity:0.8}
</style>
</head>
<body>
<div class="wrap">
{{if .AvatarURL}}<img class="avatar" src="{{.AvatarURL}}" alt="{{.DisplayName}}">{{end}}
<div class="info">
<h1 class="name">{{.DisplayName}}</h1>
{{if .ShowHandle}}<p class="handle">@{{.Handle}}</p>{{end}}
{{if .BioText}}<p class="bio">{{.BioText}}</p>{{end}}
</div>
<div class="links">
{{range .Links}}<a href="/r/{{.Slug}}">{{.Title}}</a>
{{end}}</div>
{{if .ShowBranding}}<a href="/" class="footer">Powered by Linxie</a>{{end}}
</div>
</body>
</html>`

var ssrTpl = template.Must(template.New("bio_ssr").Parse(bioSSRTemplate))

type ssrData struct {
	Title        string
	OGTitle      string
	OGDescription string
	OGUrl        string
	OGImage      string
	BG           template.CSS
	TextColor    template.CSS
	SubtextColor template.CSS
	BtnBG        template.CSS
	BtnText      template.CSS
	FooterColor  template.CSS
	AvatarURL    string
	DisplayName  string
	Handle       string
	ShowHandle   bool
	BioText      string
	ShowBranding bool
	Links        []ssrLink
}

type ssrLink struct {
	Slug  string
	Title string
}

func (h *Handler) ServeBioPageSSR(c *gin.Context) {
	handle := c.Param("handle")
	if handle == "" {
		c.String(http.StatusNotFound, "Not found")
		return
	}

	page, links, showBranding, err := h.bioSvc.GetPublicPage(c.Request.Context(), handle)
	if err != nil {
		c.String(http.StatusNotFound, "Not found")
		return
	}

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "https://linxie.ru"
	}

	theme := themeCSS[page.Theme]
	if theme == (struct{ bg, text, subtext, btn, btnText, footer string }{}) {
		theme = themeCSS["default"]
	}

	displayName := page.DisplayName
	if displayName == "" {
		displayName = "@" + page.Handle
	}

	ogDesc := page.BioText
	if ogDesc == "" {
		ogDesc = fmt.Sprintf("@%s на Linxie", page.Handle)
	}
	// Truncate for OG
	if len([]rune(ogDesc)) > 200 {
		ogDesc = string([]rune(ogDesc)[:197]) + "..."
	}

	ogImage := page.AvatarURL
	if ogImage != "" && !strings.HasPrefix(ogImage, "http") {
		ogImage = baseURL + ogImage
	}

	ssrLinks := make([]ssrLink, 0, len(links))
	for _, l := range links {
		ssrLinks = append(ssrLinks, ssrLink{
			Slug:  l.Slug,
			Title: html.EscapeString(l.Title),
		})
	}

	data := ssrData{
		Title:         displayName + " — Linxie",
		OGTitle:       displayName,
		OGDescription: ogDesc,
		OGUrl:         fmt.Sprintf("%s/@%s", baseURL, page.Handle),
		OGImage:       ogImage,
		BG:            template.CSS(theme.bg),
		TextColor:     template.CSS(theme.text),
		SubtextColor:  template.CSS(theme.subtext),
		BtnBG:         template.CSS(theme.btn),
		BtnText:       template.CSS(theme.btnText),
		FooterColor:   template.CSS(theme.footer),
		AvatarURL:     page.AvatarURL,
		DisplayName:   displayName,
		Handle:        page.Handle,
		ShowHandle:     page.DisplayName != "",
		BioText:       page.BioText,
		ShowBranding:  showBranding,
		Links:         ssrLinks,
	}

	c.Header("Content-Type", "text/html; charset=utf-8")
	if err := ssrTpl.Execute(c.Writer, data); err != nil {
		c.String(http.StatusInternalServerError, "render error")
	}
}
