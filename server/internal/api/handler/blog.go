package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"go-shortener-sqlc/internal/db"
	"go-shortener-sqlc/internal/service"
)

type BlogHandler struct {
	Service *service.BlogService
}

func NewBlogHandler(s *service.BlogService) *BlogHandler {
	return &BlogHandler{Service: s}
}

// --- Categories ---

type CreateCategoryRequest struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

func (h *BlogHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	var req CreateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	if err := h.Service.CreateCategory(r.Context(), req.Name, req.Slug); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *BlogHandler) ListCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := h.Service.ListCategories(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func (h *BlogHandler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req CreateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.Service.UpdateCategory(r.Context(), id, req.Name, req.Slug); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *BlogHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.Service.DeleteCategory(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// --- Tags ---

func (h *BlogHandler) ListTags(w http.ResponseWriter, r *http.Request) {
	tags, err := h.Service.ListTags(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tags)
}

func (h *BlogHandler) CreateTag(w http.ResponseWriter, r *http.Request) {
	var req CreateCategoryRequest // Using same structure as Category for now: name, slug
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	if err := h.Service.CreateTag(r.Context(), req.Name, req.Slug); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *BlogHandler) UpdateTag(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req CreateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.Service.UpdateTag(r.Context(), id, req.Name, req.Slug); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *BlogHandler) DeleteTag(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.Service.DeleteTag(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}



// --- Posts ---

type CreatePostRequest struct {
	Title           string   `json:"title"`
	Slug            string   `json:"slug"`
	Content         string   `json:"content"`
	Excerpt         string   `json:"excerpt"`
	MetaDescription string   `json:"meta_description"`
	Keywords        string   `json:"keywords"`
	FeaturedImage   string   `json:"featured_image"`
	CategoryID      string   `json:"category_id"`
	TagNames        []string `json:"tags"` // Array of tag names
	Status          string   `json:"status"`
}

func (h *BlogHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	var req CreatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Title == "" || req.Content == "" {
		http.Error(w, "Title and Content are required", http.StatusBadRequest)
		return
	}

	status := db.PostsStatusDraft
	if req.Status == "published" {
		status = db.PostsStatusPublished
	}

	err := h.Service.CreatePost(r.Context(), service.CreatePostParams{
		Title:           req.Title,
		Slug:            req.Slug,
		Content:         req.Content,
		Excerpt:         req.Excerpt,
		MetaDescription: req.MetaDescription,
		Keywords:        req.Keywords,
		FeaturedImage:   req.FeaturedImage,
		CategoryID:      req.CategoryID,
		TagNames:        req.TagNames,
		Status:          status,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *BlogHandler) ListPublishedPosts(w http.ResponseWriter, r *http.Request) {
	posts, err := h.Service.ListPublishedPosts(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

func (h *BlogHandler) GetPostBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	post, err := h.Service.GetPostBySlug(r.Context(), slug)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Post not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (h *BlogHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	post, err := h.Service.GetPost(r.Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Post not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

// Simple Admin List (All Posts)
func (h *BlogHandler) ListPosts(w http.ResponseWriter, r *http.Request) {
	posts, err := h.Service.ListPosts(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

func (h *BlogHandler) UpdatePostViews(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req struct {
		Views uint32 `json:"views"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.Service.UpdatePostViews(r.Context(), id, req.Views); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *BlogHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.Service.DeletePost(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

type UpdatePostRequest struct {
	CreatePostRequest
	PublishedAt time.Time `json:"published_at"`
}

func (h *BlogHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	status := db.PostsStatusDraft
	if req.Status == "published" {
		status = db.PostsStatusPublished
	} else if req.Status == "archived" {
		status = db.PostsStatusArchived
	}

	err := h.Service.UpdatePost(r.Context(), service.UpdatePostParams{
		ID:              id,
		Title:           req.Title,
		Slug:            req.Slug,
		Content:         req.Content,
		Excerpt:         req.Excerpt,
		MetaDescription: req.MetaDescription,
		Keywords:        req.Keywords,
		FeaturedImage:   req.FeaturedImage,
		CategoryID:      req.CategoryID,
		TagNames:        req.TagNames,
		Status:          status,
		PublishedAt:     req.PublishedAt,
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
