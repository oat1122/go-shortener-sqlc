package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"

	"go-shortener-sqlc/internal/api"
	"go-shortener-sqlc/internal/db"
)

func main() {
	// Load environment variables
	// Try loading from current directory first, then fallback to relative path
	if err := godotenv.Load(); err != nil {
		if err := godotenv.Load("../../.env"); err != nil {
			log.Println("No .env file found, using default/system environment variables")
		}
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL must be set")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Connect to database
	conn, err := sql.Open("mysql", dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close()

	if err := conn.Ping(); err != nil {
		log.Fatalf("Unable to ping database: %v\n", err)
	}

	queries := db.New(conn)
	server := &api.Server{
		Queries: queries,
		DB:      conn,
	}

	// Setup Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Post("/shorten", server.ShortenURL)
	r.Get("/{code}", server.RedirectURL)

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
