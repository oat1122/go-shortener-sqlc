package api

import (
	"database/sql"
	"go-shortener-sqlc/internal/db"
)

type Server struct {
	Queries *db.Queries
	DB      *sql.DB
}

func NewServer(conn *sql.DB) *Server {
	return &Server{
		Queries: db.New(conn),
		DB:      conn,
	}
}
