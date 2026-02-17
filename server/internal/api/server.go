package api

import (
	"database/sql"
	"go-shortener-sqlc/internal/api/handler"
	"go-shortener-sqlc/internal/config"
	"go-shortener-sqlc/internal/db"
	"go-shortener-sqlc/internal/service"

	"github.com/redis/go-redis/v9"
)

type Server struct {
	DB           *sql.DB
	Config       *config.Config
	URLHandler   *handler.URLHandler
	QRHandler    *handler.QRHandler
	BlogHandler  *handler.BlogHandler
	AuthHandler  *handler.AuthHandler
	ImageHandler *handler.ImageHandler
}

func NewServer(conn *sql.DB, cfg *config.Config, rdb *redis.Client) *Server {
	// Initialize Repositories (using sqlc directly for now)
	queries := db.New(conn)

	// Initialize Services
	urlService := service.NewURLService(queries, rdb)
	qrService := service.NewQRService(cfg.BaseURL)
	blogService := service.NewBlogService(queries)
	imageService := service.NewImageService(queries, cfg.UploadDir)

	// Initialize Handlers
	urlHandler := handler.NewURLHandler(urlService)
	qrHandler := handler.NewQRHandler(qrService)
	blogHandler := handler.NewBlogHandler(blogService)
	authHandler := handler.NewAuthHandler(queries)
	imageHandler := handler.NewImageHandler(imageService)

	return &Server{
		DB:           conn,
		Config:       cfg,
		URLHandler:   urlHandler,
		QRHandler:    qrHandler,
		BlogHandler:  blogHandler,
		AuthHandler:  authHandler,
		ImageHandler: imageHandler,
	}
}
