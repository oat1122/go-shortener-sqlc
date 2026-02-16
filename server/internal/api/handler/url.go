package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/go-chi/chi/v5"

	"go-shortener-sqlc/internal/service"
	"go-shortener-sqlc/internal/utils"
)

type URLHandler struct {
	Service *service.URLService
}

func NewURLHandler(s *service.URLService) *URLHandler {
	return &URLHandler{Service: s}
}

type ShortenRequest struct {
	URL string `json:"url"`
}

type ShortenResponse struct {
	ShortCode string `json:"short_code"`
}

func (h *URLHandler) ShortenURL(w http.ResponseWriter, r *http.Request) {
	// Limit request body size to 10KB
	r.Body = http.MaxBytesReader(w, r.Body, 10<<10)

	var req ShortenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		if err.Error() == "http: request body too large" {
			http.Error(w, "Request body too large", http.StatusRequestEntityTooLarge)
		} else {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
		}
		return
	}

	if req.URL == "" {
		http.Error(w, "URL is required", http.StatusBadRequest)
		return
	}

	// Limit URL length to 2048 characters
	if len(req.URL) > 2048 {
		http.Error(w, "URL too long (max 2048 chars)", http.StatusBadRequest)
		return
	}

	// Basic URL validation
	parsedURL, err := url.ParseRequestURI(req.URL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		http.Error(w, "Invalid URL format. Must start with http:// or https://", http.StatusBadRequest)
		return
	}

	// SSRF Protection
	if err := utils.ValidateTargetURL(req.URL); err != nil {
		http.Error(w, "Unsafe URL destination (Private IPs not allowed)", http.StatusBadRequest)
		return
	}

	shortCode, err := h.Service.Shorten(r.Context(), req.URL)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	resp := ShortenResponse{ShortCode: shortCode}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *URLHandler) RedirectURL(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	if code == "" {
		http.Error(w, "Short code is required", http.StatusBadRequest)
		return
	}

	originalURL, err := h.Service.GetOriginalURL(r.Context(), code)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "URL not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	http.Redirect(w, r, originalURL, http.StatusFound)
}
