package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"

	"go-shortener-sqlc/internal/api"
	"go-shortener-sqlc/internal/config"
	"go-shortener-sqlc/internal/database"
)

func main() {
	// 0. Setup structured logging (JSON)
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	// 1. Load Configuration
	cfg := config.Load()

	// 2. Connect to Database
	db, err := database.New(cfg.DatabaseURL)
	if err != nil {
		slog.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	// 3. Ensure upload directories exist
	for _, size := range []string{"original", "medium", "thumb"} {
		dir := filepath.Join(cfg.UploadDir, size)
		if err := os.MkdirAll(dir, 0755); err != nil {
			slog.Error("Failed to create upload directory", "dir", dir, "error", err)
			os.Exit(1)
		}
	}
	slog.Info("Upload directory ready", "path", cfg.UploadDir)

	// 4. Connect to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr: cfg.RedisAddr,
	})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		slog.Error("Failed to connect to Redis", "addr", cfg.RedisAddr, "error", err)
		os.Exit(1)
	}
	defer rdb.Close()
	slog.Info("Redis connected", "addr", cfg.RedisAddr)

	// 5. Initialize Server
	srv := api.NewServer(db, cfg, rdb)

	// 6. Create HTTP Server
	httpServer := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: srv.Routes(),
	}

	// 7. Start Server in goroutine
	go func() {
		slog.Info("Server starting", "port", cfg.Port)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Server failed", "error", err)
			os.Exit(1)
		}
	}()

	// 8. Wait for interrupt signal (Ctrl+C or Docker stop)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("Shutting down server gracefully...")

	// 9. Graceful shutdown with 10s timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		slog.Error("Server forced to shutdown", "error", err)
		os.Exit(1)
	}

	slog.Info("Server exited cleanly")
}
