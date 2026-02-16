package service

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"

	"go-shortener-sqlc/internal/db"
	"go-shortener-sqlc/internal/utils"
)

type BlogService struct {
	q *db.Queries
}

func NewBlogService(q *db.Queries) *BlogService {
	return &BlogService{q: q}
}

// Categories

func (s *BlogService) CreateCategory(ctx context.Context, name, slug string) error {
	id := uuid.New().String()
	if slug == "" {
		slug = utils.MakeSlug(name)
	}
	return s.q.CreateCategory(ctx, db.CreateCategoryParams{
		ID:   id,
		Name: name,
		Slug: slug,
	})
}

func (s *BlogService) ListCategories(ctx context.Context) ([]db.Category, error) {
	return s.q.ListCategories(ctx)
}

func (s *BlogService) GetCategory(ctx context.Context, id string) (db.Category, error) {
	return s.q.GetCategory(ctx, id)
}

func (s *BlogService) GetCategoryBySlug(ctx context.Context, slug string) (db.Category, error) {
	return s.q.GetCategoryBySlug(ctx, slug)
}

func (s *BlogService) UpdateCategory(ctx context.Context, id, name, slug string) error {
	if slug == "" {
		slug = utils.MakeSlug(name)
	}
	return s.q.UpdateCategory(ctx, db.UpdateCategoryParams{
		ID:   id,
		Name: name,
		Slug: slug,
	})
}

func (s *BlogService) DeleteCategory(ctx context.Context, id string) error {
	return s.q.DeleteCategory(ctx, id)
}

// Tags

func (s *BlogService) ListTags(ctx context.Context) ([]db.Tag, error) {
	return s.q.ListTags(ctx)
}

// EnsureTags takes a list of tag names, checks if they exist, creates them if not,
// and returns a list of Tag IDs.
func (s *BlogService) EnsureTags(ctx context.Context, tagNames []string) ([]string, error) {
	var tagIDs []string
	for _, name := range tagNames {
		// Clean up tag name
		name = utils.MakeSlug(name) // Or just TrimSpace depending on requirements. Let's assume tags are slug-like.
                                    // Actually, Tags usually have a display name and a slug. 
                                    // For simplicity, let's assume the input is the Display Name.
		
		// Check if tag exists by Name
		tag, err := s.q.GetTagByName(ctx, name)
		if err == nil {
			tagIDs = append(tagIDs, tag.ID)
			continue
		}

		if err != sql.ErrNoRows {
			return nil, err
		}

		// Create new tag
		newID := uuid.New().String()
		slug := utils.MakeSlug(name)
		err = s.q.CreateTag(ctx, db.CreateTagParams{
			ID:   newID,
			Name: name,
			Slug: slug,
		})
		if err != nil {
			// If slug collision, we might need to handle it. 
			// For now, return error.
			return nil, err
		}
		tagIDs = append(tagIDs, newID)
	}
	return tagIDs, nil
}

// Posts

type CreatePostParams struct {
	Title           string
	Slug            string
	Content         string
	Excerpt         string
	MetaDescription string
	Keywords        string
	FeaturedImage   string
	CategoryID      string
	TagNames        []string
	Status          db.PostsStatus
}

func (s *BlogService) CreatePost(ctx context.Context, params CreatePostParams) error {
	postID := uuid.New().String()
	
	if params.Slug == "" {
		params.Slug = utils.MakeSlug(params.Title)
	}

	// 1. Create Post
	err := s.q.CreatePost(ctx, db.CreatePostParams{
		ID:              postID,
		Title:           params.Title,
		Slug:            params.Slug,
		Content:         params.Content,
		Excerpt:         sql.NullString{String: params.Excerpt, Valid: params.Excerpt != ""},
		MetaDescription: sql.NullString{String: params.MetaDescription, Valid: params.MetaDescription != ""},
		Keywords:        sql.NullString{String: params.Keywords, Valid: params.Keywords != ""},
		FeaturedImage:   sql.NullString{String: params.FeaturedImage, Valid: params.FeaturedImage != ""},
		Status:          params.Status,
		CategoryID:      sql.NullString{String: params.CategoryID, Valid: params.CategoryID != ""},
		PublishedAt:     sql.NullTime{Time: time.Now(), Valid: params.Status == db.PostsStatusPublished},
	})
	if err != nil {
		return err
	}

	// 2. Handle Tags
	if len(params.TagNames) > 0 {
		tagIDs, err := s.EnsureTags(ctx, params.TagNames)
		if err != nil {
			return err
		}
		for _, tagID := range tagIDs {
			err = s.q.AddTagToPost(ctx, db.AddTagToPostParams{
				PostID: postID,
				TagID:  tagID,
			})
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *BlogService) ListPublishedPosts(ctx context.Context) ([]db.ListPublishedPostsWithCategoryRow, error) {
	return s.q.ListPublishedPostsWithCategory(ctx)
}

func (s *BlogService) GetPostBySlug(ctx context.Context, slug string) (db.Post, error) {
	post, err := s.q.GetPostBySlug(ctx, slug)
	if err != nil {
		return db.Post{}, err
	}
	
	// Increment view count 
	// We ignore error here to not block the read if increment fails (e.g. read-only db)
	_ = s.q.IncrementPostViews(ctx, post.ID)

	return post, nil
}

func (s *BlogService) GetPost(ctx context.Context, id string) (db.Post, error) {
	return s.q.GetPost(ctx, id)
}

func (s *BlogService) ListPosts(ctx context.Context) ([]db.Post, error) {
	return s.q.ListPosts(ctx)
}

type UpdatePostParams struct {
	ID              string
	Title           string
	Slug            string
	Content         string
	Excerpt         string
	MetaDescription string
	Keywords        string
	FeaturedImage   string
	CategoryID      string
	TagNames        []string
	Status          db.PostsStatus
	PublishedAt     time.Time
}

func (s *BlogService) UpdatePost(ctx context.Context, params UpdatePostParams) error {
	if params.Slug == "" {
		params.Slug = utils.MakeSlug(params.Title)
	}

	// 1. Update Post
	err := s.q.UpdatePost(ctx, db.UpdatePostParams{
		ID:              params.ID,
		Title:           params.Title,
		Slug:            params.Slug,
		Content:         params.Content,
		Excerpt:         sql.NullString{String: params.Excerpt, Valid: params.Excerpt != ""},
		MetaDescription: sql.NullString{String: params.MetaDescription, Valid: params.MetaDescription != ""},
		Keywords:        sql.NullString{String: params.Keywords, Valid: params.Keywords != ""},
		FeaturedImage:   sql.NullString{String: params.FeaturedImage, Valid: params.FeaturedImage != ""},
		Status:          params.Status,
		CategoryID:      sql.NullString{String: params.CategoryID, Valid: params.CategoryID != ""},
		PublishedAt:     sql.NullTime{Time: params.PublishedAt, Valid: !params.PublishedAt.IsZero()},
	})
	if err != nil {
		return err
	}

	// 2. Handle Tags (Replace all)
	// First, remove existing tags
	err = s.q.RemoveTagsFromPost(ctx, params.ID)
	if err != nil {
		return err
	}

	// Then add new ones
	if len(params.TagNames) > 0 {
		tagIDs, err := s.EnsureTags(ctx, params.TagNames)
		if err != nil {
			return err
		}
		for _, tagID := range tagIDs {
			err = s.q.AddTagToPost(ctx, db.AddTagToPostParams{
				PostID: params.ID,
				TagID:  tagID,
			})
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *BlogService) DeletePost(ctx context.Context, id string) error {
	return s.q.DeletePost(ctx, id)
}

func (s *BlogService) UpdatePostViews(ctx context.Context, id string, views uint32) error {
	return s.q.UpdatePostViews(ctx, db.UpdatePostViewsParams{
		ID:    id,
		Views: views,
	})
}
