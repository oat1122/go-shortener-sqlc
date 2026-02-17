package config

import (
	"log/slog"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	AllowedOrigins []string
	BaseURL        string
	UploadDir      string
	RedisAddr      string
}

func Load() *Config {
	// Try loading from current directory first, then fallback to relative path (for flexible development)
	if err := godotenv.Load(); err != nil {
		if err := godotenv.Load("../../.env"); err != nil {
			slog.Warn("No .env file found, using default/system environment variables")
		}
	}

	port := os.Getenv("PORT")
	// if port == "" {
	// 	port = "8080"
	// }

	dbURL := os.Getenv("DATABASE_URL")
	// if dbURL == "" {
	// 	log.Fatal("DATABASE_URL must be set")
	// }

	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	// if allowedOrigins == "" {
	// 	allowedOrigins = "http://localhost:3000" // Default for dev
	// }

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		// baseURL = "http://localhost:8080"
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	return &Config{
		Port:           port,
		DatabaseURL:    dbURL,
		AllowedOrigins: strings.Split(allowedOrigins, ","),
		BaseURL:        baseURL,
		UploadDir:      uploadDir,
		RedisAddr:      redisAddr,
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
