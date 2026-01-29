package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	authrepo "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/repository/postgres"
	authsvc "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/service/auth"
	authttp "github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/transport/http/auth"
)

func main() {
	_ = godotenv.Load("../.env")

	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	fmt.Println(len(dbPass))

	if dbHost == "" || dbPort == "" || dbUser == "" || dbName == "" {
		log.Fatal("DB env vars are missing (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)")
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPass, dbName,
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

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	authRepo := authrepo.NewAuthRepository(db)
	authService := authsvc.NewAuthService(authRepo)
	authHandler := authttp.NewAuthHandler(authService)

	r := gin.Default()

	api := r.Group("/api")
	auth := api.Group("/auth")
	{
		auth.POST("/register", func(c *gin.Context) {
			authHandler.Register(c.Writer, c.Request)
		})
		auth.POST("/login", func(c *gin.Context) {
			authHandler.Login(c.Writer, c.Request)
		})
	}

	log.Printf("listening on :%s", port)
	log.Fatal(r.Run(":" + port))
}
