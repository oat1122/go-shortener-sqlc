package api

import (
	"fmt"
	"go-shortener-sqlc/internal/auth"
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
		// Auth Routes
		r.Post("/auth/login", s.AuthHandler.Login)
		r.Post("/auth/logout", s.AuthHandler.Logout)
		r.Get("/auth/me", s.AuthHandler.Me)

		// Public Blog Endpoints
		r.Get("/blog", s.BlogHandler.ListPublishedPosts)
		r.Get("/blog/{slug}", s.BlogHandler.GetPostBySlug)
		
		// Categories & Tags (Public for filter)
		r.Get("/categories", s.BlogHandler.ListCategories)
		r.Get("/tags", s.BlogHandler.ListTags)

		// Admin Endpoints
		r.Group(func(r chi.Router) {
			r.Use(AdminOnlyMiddleware) // Protect these routes
			
			r.Post("/categories", s.BlogHandler.CreateCategory)
			r.Put("/categories/{id}", s.BlogHandler.UpdateCategory)
			r.Delete("/categories/{id}", s.BlogHandler.DeleteCategory)

			r.Post("/tags", s.BlogHandler.CreateTag)
			r.Put("/tags/{id}", s.BlogHandler.UpdateTag)
			r.Delete("/tags/{id}", s.BlogHandler.DeleteTag)

			r.Get("/admin/posts", s.BlogHandler.ListPosts)
			r.Get("/admin/posts/{id}", s.BlogHandler.GetPost)
			r.Post("/admin/posts", s.BlogHandler.CreatePost)
			r.Put("/admin/posts/{id}", s.BlogHandler.UpdatePost)
			r.Patch("/admin/posts/{id}/views", s.BlogHandler.UpdatePostViews)
			r.Delete("/admin/posts/{id}", s.BlogHandler.DeletePost)
		})
	})

	return r
}

func AdminOnlyMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_token")
		if err != nil {
			fmt.Printf("Auth Middleware Error: No cookie found. Error: %v\n Headers: %v\n", err, r.Header)
			http.Error(w, "Unauthorized - No Cookie", http.StatusUnauthorized)
			return
		}

		claims, err := auth.ValidateToken(cookie.Value)
		if err != nil {
			fmt.Printf("Auth Middleware Error: Invalid token. Error: %v\n", err)
			http.Error(w, "Unauthorized - Invalid Token", http.StatusUnauthorized)
			return
		}

		if claims.Role != "admin" {
			fmt.Printf("Auth Middleware Error: Forbidden access. User Role: %s\n", claims.Role)
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

