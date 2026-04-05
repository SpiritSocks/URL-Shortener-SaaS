package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/url"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/domain"
	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/repository/postgres"
	analyticssvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/analytics"
	authsvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/auth"
	billingsvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/billing"
	biosvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/bio"
	customdomainsvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/customdomain"
	linksvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/link"
	transport "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http"
	authttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/auth"
	billinghttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/billing"
	biohttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/bio"
	customdomainhttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/customdomain"
	linkhttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/link"
	qrhttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/qr"
	uploadhttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/upload"
)

func main() {
	_ = godotenv.Load("../.env") // local dev
	_ = godotenv.Load(".env")    // docker

	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	if dbHost == "" || dbPort == "" || dbUser == "" || dbName == "" {
		log.Fatal("DB env vars are missing (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)")
	}

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		url.PathEscape(dbUser), url.PathEscape(dbPass), dbHost, dbPort, dbName,
	)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	for i := 0; i < 30; i++ {
		if err := db.Ping(); err == nil {
			break
		}
		if i == 29 {
			log.Fatal("could not connect to database after 30 attempts")
		}
		log.Printf("waiting for database... (%d/30)", i+1)
		time.Sleep(time.Second)
	}

	// Run migrations
	runMigrations(db)

	// Repositories
	authRepo := postgres.NewAuthRepository(db)
	linkRepo := postgres.NewLinkRepository(db)
	analyticsRepo := postgres.NewAnalyticsRepository(db)
	planRepo := postgres.NewPlanRepository(db)
	paymentRepo := postgres.NewPaymentRepository(db)
	customDomainRepo := postgres.NewCustomDomainRepository(db)
	bioRepo := postgres.NewBioRepository(db)

	// Services
	authService := authsvc.NewAuthService(authRepo)
	linkService := linksvc.NewLinkService(linkRepo)
	analyticsService := analyticssvc.NewAnalyticsService(analyticsRepo, linkRepo)
	billingService := billingsvc.NewBillingService(planRepo, paymentRepo, authRepo)
	customDomainService := customdomainsvc.NewCustomDomainService(customDomainRepo)
	bioService := biosvc.NewBioService(bioRepo, linkService, billingService)

	// Start background subscription expiry checker
	go runSubscriptionExpiry(authRepo)

	// Handlers
	authHandler := authttp.NewAuthHandler(authService)
	linkHandler := linkhttp.NewLinkHandler(linkService, analyticsService, billingService, customDomainService)
	analyticsHandler := linkhttp.NewAnalyticsHandler(analyticsService, billingService, linkService, customDomainService)
	billingHandler := billinghttp.NewBillingHandler(billingService)
	customDomainHandler := customdomainhttp.NewCustomDomainHandler(customDomainService, billingService)
	bioHandler := biohttp.NewBioHandler(bioService, billingService)

	r := gin.Default()

	// CORS
	r.Use(corsMiddleware())

	// Public: Auth
	api := r.Group("/api")
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Public: Redirect short links (both /r/:slug and /:slug for custom domains)
	r.GET("/r/:slug", linkHandler.Redirect)

	// Public: QR code
	r.GET("/api/qr/:slug", qrhttp.QRHandler)

	// Static: uploaded files
	uploadsDir := "./uploads"
	if _, err := os.Stat("./migrations"); os.IsNotExist(err) {
		uploadsDir = "../uploads"
	}
	_ = os.MkdirAll(uploadsDir+"/avatars", 0755)
	r.Static("/uploads", uploadsDir)

	// Public: YooKassa webhook
	api.POST("/billing/webhook", billingHandler.Webhook)

	// Public: Plans list
	api.GET("/plans", billingHandler.GetPlans)

	// Public: Bio page
	api.GET("/bio/:handle", bioHandler.GetPublicPage)

	// Public: Guest URL shortener (landing page demo)
	api.POST("/links/shorten", linkHandler.ShortenPublic)

	// Public: Custom domain TLS ask (Caddy on-demand)
	api.GET("/custom-domains/ask", customDomainHandler.Ask)

	// Protected routes
	protected := api.Group("")
	protected.Use(transport.AuthMiddleware())
	{
		// User
		protected.GET("/me", authHandler.GetMe)
		protected.PUT("/me", authHandler.UpdateMe)
		protected.DELETE("/me", authHandler.DeleteMe)

		// Links
		protected.POST("/links", linkHandler.Create)
		protected.GET("/links", linkHandler.List)
		protected.DELETE("/links/:id", linkHandler.Delete)

		// Analytics
		protected.GET("/analytics/overview", analyticsHandler.GetOverview)
		protected.GET("/analytics/advanced", analyticsHandler.GetAdvanced)
		protected.GET("/analytics/export", analyticsHandler.ExportCSV)
		protected.GET("/analytics/link/:id", analyticsHandler.GetLinkDetail)

		// Billing
		protected.GET("/billing/plan", billingHandler.GetUserPlan)
		protected.POST("/billing/pay", billingHandler.CreatePayment)

		// Custom Domains
		protected.POST("/domains", customDomainHandler.Add)
		protected.GET("/domains", customDomainHandler.List)
		protected.POST("/domains/:id/verify", customDomainHandler.Verify)
		protected.DELETE("/domains/:id", customDomainHandler.Delete)

		// Upload
		protected.POST("/upload/avatar", uploadhttp.UploadAvatar)

		// Bio Pages
		protected.POST("/bio/page", bioHandler.CreatePage)
		protected.PUT("/bio/page", bioHandler.UpdatePage)
		protected.GET("/bio/page", bioHandler.GetMyPage)
		protected.POST("/bio/links", bioHandler.AddBioLink)
		protected.DELETE("/bio/links/:id", bioHandler.RemoveBioLink)
		protected.PUT("/bio/links/reorder", bioHandler.ReorderLinks)
	}

	log.Printf("listening on :%s", port)
	log.Fatal(r.Run(":" + port))
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := os.Getenv("FRONTEND_URL")
		if origin == "" {
			origin = "http://localhost:5173"
		}
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func runSubscriptionExpiry(userRepo domain.UserRepository) {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		n, err := userRepo.ExpireSubscriptions(ctx)
		cancel()
		if err != nil {
			log.Printf("[subscription-expiry] error: %v", err)
		} else if n > 0 {
			log.Printf("[subscription-expiry] downgraded %d expired subscription(s) to free", n)
		}
	}
}

func runMigrations(db *sql.DB) {
	// Try ./migrations first (Docker), fall back to ../migrations (local dev)
	migrationDir := "./migrations"
	if _, err := os.Stat(migrationDir); os.IsNotExist(err) {
		migrationDir = "../migrations"
	}
	files := []string{
		migrationDir + "/001_init.sql",
		migrationDir + "/002_plans.sql",
		migrationDir + "/003_advanced_analytics.sql",
		migrationDir + "/004_custom_domains.sql",
		migrationDir + "/005_fix_domain_fk.sql",
		migrationDir + "/006_bio_pages.sql",
		migrationDir + "/007_plan_expiry.sql",
		migrationDir + "/008_update_unlimited_price.sql",
		migrationDir + "/009_guest_links.sql",
	}
	for _, f := range files {
		migration, err := os.ReadFile(f)
		if err != nil {
			log.Printf("Warning: could not read %s: %v", f, err)
			continue
		}
		if _, err := db.Exec(string(migration)); err != nil {
			log.Printf("Warning: migration %s error: %v", f, err)
		} else {
			log.Printf("Migration %s applied", f)
		}
	}
}
