package api

import (
	"database/sql"
	"go-shortener-sqlc/internal/config"
	"go-shortener-sqlc/internal/db"
)

type Server struct {
	Queries *db.Queries
	DB      *sql.DB
	Config  *config.Config
}

func NewServer(conn *sql.DB, cfg *config.Config) *Server {
	return &Server{
		Queries: db.New(conn),
		DB:      conn,
		Config:  cfg,
	}
}
