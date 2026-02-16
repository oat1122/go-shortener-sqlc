package api

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
)

func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Rate Limiting: 100 requests per minute per IP
	r.Use(httprate.Limit(100, 1*time.Minute, httprate.WithKeyFuncs(httprate.KeyByIP)))

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   s.Config.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Routes
	r.Post("/shorten", s.URLHandler.ShortenURL)
	r.Get("/{code}", s.URLHandler.RedirectURL)
	r.Post("/{code}/qr", s.QRHandler.GenerateQR)

	// Blog Routes
	r.Route("/api", func(r chi.Router) {
		// Public Blog Endpoints
		r.Get("/blog", s.BlogHandler.ListPublishedPosts)
		r.Get("/blog/{slug}", s.BlogHandler.GetPostBySlug)
		
		// Categories & Tags (Public for filter)
		r.Get("/categories", s.BlogHandler.ListCategories)
		r.Get("/tags", s.BlogHandler.ListTags)

		// Admin Endpoints (Todo: Add Auth Middleware)
		r.Post("/categories", s.BlogHandler.CreateCategory)
		r.Put("/categories/{id}", s.BlogHandler.UpdateCategory)
		r.Delete("/categories/{id}", s.BlogHandler.DeleteCategory)

		r.Get("/admin/posts", s.BlogHandler.ListPosts)
		r.Post("/admin/posts", s.BlogHandler.CreatePost)
		r.Put("/admin/posts/{id}", s.BlogHandler.UpdatePost)
		r.Patch("/admin/posts/{id}/views", s.BlogHandler.UpdatePostViews)
		r.Delete("/admin/posts/{id}", s.BlogHandler.DeletePost)
	})

	return r
}
