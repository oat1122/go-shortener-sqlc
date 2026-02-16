package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"log"

	"go-shortener-sqlc/internal/db"
)

type URLService struct {
	q *db.Queries
}

func NewURLService(q *db.Queries) *URLService {
	return &URLService{q: q}
}

// Shorten processes the logic to shorten a URL.
// It checks for existing URLs (deduplication) and handles collision retries.
func (s *URLService) Shorten(ctx context.Context, originalURL string) (string, error) {
	// 1. Calculate SHA-256 hash
	hash := sha256.Sum256([]byte(originalURL))
	urlHash := hex.EncodeToString(hash[:])

	// 2. Check if URL already exists
	existingURL, err := s.q.GetURLByHash(ctx, urlHash)
	if err == nil {
		return existingURL.ShortCode, nil
	} else if err != sql.ErrNoRows {
		return "", err
	}

	// 3. Generate Short Code with Retry
	var shortCode string
	maxRetries := 5
	for i := 0; i < maxRetries; i++ {
		code, err := generateShortCode()
		if err != nil {
			log.Printf("Error generating short code: %v", err)
			continue
		}

		// Check if code exists
		_, err = s.q.GetURL(ctx, code)
		if err == nil {
			continue // Collision
		} else if err != sql.ErrNoRows {
			return "", err
		}

		shortCode = code
		break
	}

	if shortCode == "" {
		return "", errors.New("failed to generate unique short code")
	}

	// 4. Insert into database
	_, err = s.q.CreateURL(ctx, db.CreateURLParams{
		ShortCode:   shortCode,
		OriginalUrl: originalURL,
		UrlHash:     urlHash,
	})

	if err != nil {
		// Race condition Check
		existingURL, retryErr := s.q.GetURLByHash(ctx, urlHash)
		if retryErr == nil {
			return existingURL.ShortCode, nil
		}
		return "", err
	}

	return shortCode, nil
}

// GetOriginalURL retrieves the original URL for a given short code.
func (s *URLService) GetOriginalURL(ctx context.Context, code string) (string, error) {
	url, err := s.q.GetURL(ctx, code)
	if err != nil {
		return "", err
	}
	return url.OriginalUrl, nil
}

func generateShortCode() (string, error) {
	b := make([]byte, 4)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b)[:6], nil
}
