-- name: CreateURL :execresult
INSERT INTO urls (
  short_code, original_url, url_hash
) VALUES (
  ?, ?, ?
);

-- name: GetURL :one
SELECT * FROM urls
WHERE short_code = ? LIMIT 1;

-- name: GetURLByHash :one
SELECT * FROM urls
WHERE url_hash = ? LIMIT 1;

-- Blog Queries

-- Categories

-- name: CreateCategory :exec
INSERT INTO categories (
  id, name, slug
) VALUES (
  ?, ?, ?
);

-- name: GetCategory :one
SELECT * FROM categories
WHERE id = ? LIMIT 1;

-- name: GetCategoryBySlug :one
SELECT * FROM categories
WHERE slug = ? LIMIT 1;

-- name: ListCategories :many
SELECT * FROM categories
ORDER BY name;

-- name: UpdateCategory :exec
UPDATE categories
SET name = ?, slug = ?
WHERE id = ?;

-- name: DeleteCategory :exec
DELETE FROM categories
WHERE id = ?;

-- Tags

-- name: CreateTag :exec
INSERT INTO tags (
  id, name, slug
) VALUES (
  ?, ?, ?
);

-- name: GetTag :one
SELECT * FROM tags
WHERE id = ? LIMIT 1;

-- name: GetTagBySlug :one
SELECT * FROM tags
WHERE slug = ? LIMIT 1;

-- name: GetTagByName :one
SELECT * FROM tags
WHERE name = ? LIMIT 1;

-- name: ListTags :many
SELECT * FROM tags
ORDER BY name;

-- Posts

-- name: CreatePost :exec
INSERT INTO posts (
  id, title, slug, content, excerpt, meta_description, keywords, featured_image, status, category_id, published_at
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
);

-- name: GetPost :one
SELECT * FROM posts
WHERE id = ? LIMIT 1;

-- name: GetPostBySlug :one
SELECT * FROM posts
WHERE slug = ? LIMIT 1;

-- name: ListPosts :many
SELECT * FROM posts
ORDER BY created_at DESC;

-- name: ListPublishedPosts :many
SELECT * FROM posts
WHERE status = 'published'
ORDER BY published_at DESC;

-- name: ListPublishedPostsWithCategory :many
SELECT p.*, c.name AS category_name, c.slug AS category_slug
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC;

-- name: UpdatePost :exec
UPDATE posts
SET title = ?, slug = ?, content = ?, excerpt = ?, meta_description = ?, keywords = ?, featured_image = ?, status = ?, category_id = ?, published_at = ?
WHERE id = ?;

-- name: UpdatePostViews :exec
UPDATE posts
SET views = ?
WHERE id = ?;

-- name: IncrementPostViews :exec
UPDATE posts
SET views = views + 1
WHERE id = ?;

-- name: DeletePost :exec
DELETE FROM posts
WHERE id = ?;

-- Post Tags

-- name: AddTagToPost :exec
INSERT INTO post_tags (post_id, tag_id)
VALUES (?, ?);

-- name: RemoveTagsFromPost :exec
DELETE FROM post_tags
WHERE post_id = ?;

-- name: GetPostTags :many
SELECT t.* FROM tags t
JOIN post_tags pt ON t.id = pt.tag_id
WHERE pt.post_id = ?;

-- Auth Queries

-- name: CreateUser :exec
INSERT INTO users (
  id, username, password_hash, role
) VALUES (
  ?, ?, ?, ?
);

-- name: GetUserByUsername :one
SELECT * FROM users
WHERE username = ? LIMIT 1;

-- name: UpdateUserPassword :exec
UPDATE users
SET password_hash = ?
WHERE username = ?;
