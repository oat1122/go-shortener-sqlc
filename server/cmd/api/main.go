package main

import (
	"log"
	"net/http"

	"go-shortener-sqlc/internal/api"
	"go-shortener-sqlc/internal/config"
	"go-shortener-sqlc/internal/database"
)

func main() {
	// 1. Load Configuration
	cfg := config.Load()

	// 2. Connect to Database
	db, err := database.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// 3. Initialize Server
	srv := api.NewServer(db)

	// 4. Start Server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, srv.Routes()); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
