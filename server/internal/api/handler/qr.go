package handler

import (
	"context"
	"image"
	"image/png"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"go-shortener-sqlc/internal/service"
)

type QRHandler struct {
	Service *service.QRService
}

func NewQRHandler(s *service.QRService) *QRHandler {
	return &QRHandler{Service: s}
}

func (h *QRHandler) GenerateQR(w http.ResponseWriter, r *http.Request) {
	// Add timeout context
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	r = r.WithContext(ctx)

	// Limit request body size to 6MB
	r.Body = http.MaxBytesReader(w, r.Body, 6<<20)

	code := chi.URLParam(r, "code")
	if code == "" {
		http.Error(w, "Short code is required", http.StatusBadRequest)
		return
	}

	// Parse uploaded logo (and other form fields)
	// Limit upload size to 5MB
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	// Parse options
	opts := service.QROptions{
		LogoSize:      100,
		FgColor:       r.FormValue("fg_color"),
		BgColor:       r.FormValue("bg_color"),
		GradientStart: r.FormValue("gradient_start"),
		GradientEnd:   r.FormValue("gradient_end"),
	}

	if val := r.FormValue("logo_size"); val != "" {
		if size, err := strconv.Atoi(val); err == nil {
			opts.LogoSize = size
		}
	}

	if val := r.FormValue("border_radius"); val != "" {
		if radius, err := strconv.Atoi(val); err == nil {
			opts.BorderRadius = radius
		}
	}

	file, _, err := r.FormFile("logo")
	if err == nil {
		defer file.Close()
		
		// Security check (dimensions)
		cfg, _, err := image.DecodeConfig(file)
		if err != nil {
			http.Error(w, "Invalid image file", http.StatusBadRequest)
			return
		}

		if cfg.Width > 2048 || cfg.Height > 2048 {
			http.Error(w, "Image dimensions too large (max 2048x2048)", http.StatusBadRequest)
			return
		}

		file.Seek(0, 0)
		img, _, err := image.Decode(file)
		if err == nil {
			opts.Logo = img
		}
	}

	// Call Service
	qrImage, err := h.Service.GenerateQR(ctx, code, opts)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "image/png")
	pngEncoder := png.Encoder{CompressionLevel: png.BestSpeed}
	if err := pngEncoder.Encode(w, qrImage); err != nil {
		http.Error(w, "Error encoding PNG", http.StatusInternalServerError)
	}
}
