package api

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"image"
	_ "image/jpeg" // Support JPEG decoding
	_ "image/png"  // Support PNG decoding
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/yeqown/go-qrcode/v2"
	"github.com/yeqown/go-qrcode/writer/standard"

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

	// Basic URL validation
	parsedURL, err := url.ParseRequestURI(req.URL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		http.Error(w, "Invalid URL format. Must start with http:// or https://", http.StatusBadRequest)
		return
	}

	// 1. Calculate SHA-256 hash of the original URL
	hash := sha256.Sum256([]byte(req.URL))
	urlHash := hex.EncodeToString(hash[:])

	// 2. Check if URL already exists using hash (Optimized check)
	existingURL, err := s.Queries.GetURLByHash(r.Context(), urlHash)
	if err == nil {
		// URL already exists, return existing short code
		resp := ShortenResponse{ShortCode: existingURL.ShortCode}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	} else if err != sql.ErrNoRows {
		// Database error
		log.Printf("Database error checking URL hash: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Retry loop for collision handling
	var shortCode string
	maxRetries := 5
	for i := 0; i < maxRetries; i++ {
		code, err := generateShortCode()
		if err != nil {
			log.Printf("Error generating short code: %v", err)
			continue
		}

		// Check if code exists
		_, err = s.Queries.GetURL(r.Context(), code)
		if err == nil {
			// Code exists, retry
			continue
		} else if err != sql.ErrNoRows {
			// Database error
			log.Printf("Database error checking short code: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		shortCode = code
		break
	}

	if shortCode == "" {
		http.Error(w, "Failed to generate unique short code after retries", http.StatusServiceUnavailable)
		return
	}

	// 3. Insert into database
	_, err = s.Queries.CreateURL(r.Context(), db.CreateURLParams{
		ShortCode:   shortCode,
		OriginalUrl: req.URL,
		UrlHash:     urlHash,
	})

	if err != nil {
		// Possible Race Condition: Another request might have inserted the same hash just now
		// Try to get the URL one last time
		existingURL, retryErr := s.Queries.GetURLByHash(r.Context(), urlHash)
		if retryErr == nil {
			resp := ShortenResponse{ShortCode: existingURL.ShortCode}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(resp)
			return
		}

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

func (s *Server) GenerateQR(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	if code == "" {
		http.Error(w, "Short code is required", http.StatusBadRequest)
		return
	}

	// 1. Construct the full URL
	fullURL := s.Config.BaseURL + "/" + code

	// 2. Parse uploaded logo (if any)
	// Limit upload size to 5MB
	r.ParseMultipartForm(5 << 20)
	
	// Parse options
	logoSizeStr := r.FormValue("logo_size")
	logoSize, _ := strconv.Atoi(logoSizeStr)
	if logoSize <= 0 {
		logoSize = 100 // Default
	}
	// Cap max size to avoid breaking QR code or being too large
	if logoSize > 240 {
		logoSize = 240
	}

	borderRadiusStr := r.FormValue("border_radius")
	borderRadius, _ := strconv.Atoi(borderRadiusStr)
	if borderRadius < 0 {
		borderRadius = 0
	}

	file, header, err := r.FormFile("logo")

	var options []standard.ImageOption
	// Default options
	options = append(options, standard.WithBgColorRGBHex("#FFFFFF"))
	options = append(options, standard.WithFgColorRGBHex("#000000"))
	options = append(options, standard.WithQRWidth(40)) // Increase module size further to safely support 250px logos

	if err == nil {
		log.Printf("Received logo file: %s, size: %d, target size: %d, radius: %d", header.Filename, header.Size, logoSize, borderRadius)
		defer file.Close()
		// Decode the image
		img, format, err := image.Decode(file)
		if err != nil {
			log.Printf("Error decoding logo: %v", err)
			http.Error(w, "Invalid logo image", http.StatusBadRequest)
			return
		}
		log.Printf("Successfully decoded logo. Format: %s", format)

		// Resize logo
		newImg := resizeImage(img, logoSize)
		
		// Apply border radius
		if borderRadius > 0 {
			newImg = applyBorderRadius(newImg, borderRadius)
		}

		// Add logo options
		options = append(options, standard.WithLogoImage(newImg))
	}

	// 3. Generate QR Code
	qrc, err := qrcode.New(fullURL)
	if err != nil {
		log.Printf("Error generating QR code object: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// 4. Write to response
	w.Header().Set("Content-Type", "image/png")
	
	wr := standard.NewWithWriter(nopCloser{w}, options...)
	if err = qrc.Save(wr); err != nil {
		log.Printf("Error saving QR code: %v", err)
		return
	}
}

// nopCloser aids in adapting http.ResponseWriter to io.WriteCloser if needed
type nopCloser struct {
	io.Writer
}

func (nopCloser) Close() error { return nil }

