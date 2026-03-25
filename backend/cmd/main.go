package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/url"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/repository/postgres"
	analyticssvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/analytics"
	authsvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/auth"
	billingsvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/billing"
	customdomainsvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/customdomain"
	linksvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/link"
	transport "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http"
	authttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/auth"
	billinghttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/billing"
	customdomainhttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/customdomain"
	linkhttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/link"
	qrhttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/qr"
)

func main() {
	_ = godotenv.Load("../.env")

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

	if err := db.Ping(); err != nil {
		log.Fatal(err)
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

	// Services
	authService := authsvc.NewAuthService(authRepo)
	linkService := linksvc.NewLinkService(linkRepo)
	analyticsService := analyticssvc.NewAnalyticsService(analyticsRepo, linkRepo)
	billingService := billingsvc.NewBillingService(planRepo, paymentRepo, authRepo)
	customDomainService := customdomainsvc.NewCustomDomainService(customDomainRepo)

	// Handlers
	authHandler := authttp.NewAuthHandler(authService)
	linkHandler := linkhttp.NewLinkHandler(linkService, analyticsService, billingService, customDomainService)
	analyticsHandler := linkhttp.NewAnalyticsHandler(analyticsService, billingService, linkService)
	billingHandler := billinghttp.NewBillingHandler(billingService)
	customDomainHandler := customdomainhttp.NewCustomDomainHandler(customDomainService, billingService)

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

	// Public: YooKassa webhook
	api.POST("/billing/webhook", billingHandler.Webhook)

	// Public: Plans list
	api.GET("/plans", billingHandler.GetPlans)

	// Protected routes
	protected := api.Group("")
	protected.Use(transport.AuthMiddleware())
	{
		// User
		protected.GET("/me", authHandler.GetMe)
		protected.PUT("/me", authHandler.UpdateMe)

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

func runMigrations(db *sql.DB) {
	files := []string{"../migrations/001_init.sql", "../migrations/002_plans.sql", "../migrations/003_advanced_analytics.sql", "../migrations/004_custom_domains.sql"}
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
