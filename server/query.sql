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
