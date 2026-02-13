package api

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	"go-shortener-sqlc/internal/db"
)



type ShortenRequest struct {
	URL string `json:"url"`
}

type ShortenResponse struct {
	ShortCode string `json:"short_code"`
}

func (s *Server) ShortenURL(w http.ResponseWriter, r *http.Request) {
	var req ShortenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.URL == "" {
		http.Error(w, "URL is required", http.StatusBadRequest)
		return
	}

	// Generate a random short code (simple implementation)
	shortCode, err := generateShortCode()
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Insert into database
	_, err = s.Queries.CreateURL(r.Context(), db.CreateURLParams{
		ShortCode:   shortCode,
		OriginalUrl: req.URL,
	})

	if err != nil {
		log.Printf("Error creating URL: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	resp := ShortenResponse{ShortCode: shortCode}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (s *Server) RedirectURL(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	if code == "" {
		http.Error(w, "Short code is required", http.StatusBadRequest)
		return
	}

	url, err := s.Queries.GetURL(r.Context(), code)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "URL not found", http.StatusNotFound)
		} else {
			log.Printf("Error getting URL: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	http.Redirect(w, r, url.OriginalUrl, http.StatusFound)
}

// generateShortCode generates a random 6-character string
func generateShortCode() (string, error) {
	b := make([]byte, 4) // 4 bytes * 8 bits = 32 bits. Base64 encodes 6 bits per char. 32/6 = 5.33 -> 6 chars approx.
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b)[:6], nil
}
