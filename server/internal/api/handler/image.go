package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"go-shortener-sqlc/internal/service"
)

type ImageHandler struct {
	Service *service.ImageService
}

func NewImageHandler(s *service.ImageService) *ImageHandler {
	return &ImageHandler{Service: s}
}

// Upload handles POST /api/admin/images (multipart/form-data)
func (h *ImageHandler) Upload(w http.ResponseWriter, r *http.Request) {
	// Limit request body size to 10MB + some overhead for form fields
	r.Body = http.MaxBytesReader(w, r.Body, service.MaxUploadSize+1024)

	// Parse multipart form
	if err := r.ParseMultipartForm(service.MaxUploadSize); err != nil {
		http.Error(w, "File too large. Max 10MB allowed.", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Missing image file. Use form field 'image'.", http.StatusBadRequest)
		return
	}
	defer file.Close()

	altText := r.FormValue("alt_text")
	title := r.FormValue("title")

	result, err := h.Service.Upload(r.Context(), file, header, altText, title)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

// List handles GET /api/images
func (h *ImageHandler) List(w http.ResponseWriter, r *http.Request) {
	images, err := h.Service.List(r.Context())
	if err != nil {
		http.Error(w, "Failed to list images", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(images)
}

// Get handles GET /api/images/{id}
func (h *ImageHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	result, err := h.Service.GetByID(r.Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Image not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to get image", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// UpdateImageRequest is the request body for updating image metadata.
type UpdateImageRequest struct {
	AltText string `json:"alt_text"`
	Title   string `json:"title"`
}

// Update handles PUT /api/admin/images/{id}
func (h *ImageHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req UpdateImageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.Service.UpdateMeta(r.Context(), id, req.AltText, req.Title); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Image not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to update image", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Image updated successfully"})
}

// Delete handles DELETE /api/admin/images/{id}
func (h *ImageHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.Service.Delete(r.Context(), id); err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Image not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to delete image", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Image deleted successfully"})
}
