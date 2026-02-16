package api

import (
	"database/sql"
	"go-shortener-sqlc/internal/api/handler"
	"go-shortener-sqlc/internal/config"
	"go-shortener-sqlc/internal/db"
	"go-shortener-sqlc/internal/service"
)

type Server struct {
	Config     *config.Config
	URLHandler  *handler.URLHandler
	QRHandler   *handler.QRHandler
	BlogHandler *handler.BlogHandler
}

func NewServer(conn *sql.DB, cfg *config.Config) *Server {
	// Initialize Repositories (using sqlc directly for now)
	queries := db.New(conn)

	// Initialize Services
	urlService := service.NewURLService(queries)
	qrService := service.NewQRService(cfg.BaseURL)
	blogService := service.NewBlogService(queries)

	// Initialize Handlers
	urlHandler := handler.NewURLHandler(urlService)
	qrHandler := handler.NewQRHandler(qrService)
	blogHandler := handler.NewBlogHandler(blogService)

	return &Server{
		Config:      cfg,
		URLHandler:  urlHandler,
		QRHandler:   qrHandler,
		BlogHandler: blogHandler,
	}
}
