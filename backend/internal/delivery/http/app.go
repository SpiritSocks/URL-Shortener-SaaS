package http

import (
	"github.com/SpiritSocks/URL-Shortener-SaaS/backend/internal/config"

	"github.com/gin-gonic/gin"
)

type App struct {
	config *config.Config
	router *gin.Engine
}

func NewApp(cfg *config.Config) *App {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return &App{
		config: cfg,
		router: router,
	}
}

func (a *App) Run() error {
	return a.router.Run(":" + a.config.HTTPPort)
}
