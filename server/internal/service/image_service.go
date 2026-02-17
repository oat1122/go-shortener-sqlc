package service

import (
	"context"
	"fmt"
	"image"
	"image/jpeg"
	_ "image/png"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"

	"go-shortener-sqlc/internal/db"
	"go-shortener-sqlc/internal/utils"
)

const (
	MaxUploadSize = 10 << 20 // 10MB
	ThumbWidth    = 300
	MediumWidth   = 800
	JPEGQuality   = 80
)

// Allowed MIME types for image uploads
var allowedMIMETypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

type ImageService struct {
	q         *db.Queries
	uploadDir string
}

func NewImageService(q *db.Queries, uploadDir string) *ImageService {
	return &ImageService{q: q, uploadDir: uploadDir}
}

// ImageURLs holds the URLs for different image sizes.
type ImageURLs struct {
	Original string `json:"original"`
	Medium   string `json:"medium"`
	Thumb    string `json:"thumb"`
}

// ImageResponse is the API response for an image.
type ImageResponse struct {
	db.Image
	URLs ImageURLs `json:"urls"`
}

// Upload handles the full upload pipeline: validate → save original → resize → save to DB.
func (s *ImageService) Upload(ctx context.Context, file multipart.File, header *multipart.FileHeader, altText, title string) (*ImageResponse, error) {
	// 1. Validate file size
	if header.Size > MaxUploadSize {
		return nil, fmt.Errorf("file too large: max %dMB allowed", MaxUploadSize/(1<<20))
	}

	// 2. Validate MIME type by reading file header bytes
	buf := make([]byte, 512)
	n, err := file.Read(buf)
	if err != nil && err != io.EOF {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}
	mimeType := http.DetectContentType(buf[:n])
	if !allowedMIMETypes[mimeType] {
		return nil, fmt.Errorf("invalid file type: %s. Only image files (JPEG, PNG, GIF, WebP) are allowed", mimeType)
	}

	// Reset file reader position
	if seeker, ok := file.(io.Seeker); ok {
		if _, err := seeker.Seek(0, io.SeekStart); err != nil {
			return nil, fmt.Errorf("failed to reset file reader: %w", err)
		}
	}

	// 3. Decode Image to get dimensions
	img, _, err := image.Decode(file)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	bounds := img.Bounds()
	width := uint32(bounds.Dx())
	height := uint32(bounds.Dy())

	// 4. Generate unique filename
	imageID := uuid.New().String()
	filename := imageID + ".jpg"

	// 5. Save images in 3 sizes
	sizes := map[string]int{
		"original": 0, // 0 means no resize
		"medium":   MediumWidth,
		"thumb":    ThumbWidth,
	}

	for sizeKey, targetWidth := range sizes {
		dir := filepath.Join(s.uploadDir, sizeKey)

		var resized image.Image
		if targetWidth == 0 {
			resized = img
		} else {
			resized = utils.ResizeImage(img, targetWidth)
		}

		outPath := filepath.Join(dir, filename)
		outFile, err := os.Create(outPath)
		if err != nil {
			return nil, fmt.Errorf("failed to create file %s: %w", outPath, err)
		}

		err = jpeg.Encode(outFile, resized, &jpeg.Options{Quality: JPEGQuality})
		outFile.Close()
		if err != nil {
			return nil, fmt.Errorf("failed to encode JPEG for %s: %w", sizeKey, err)
		}
	}

	// 6. Get final file size (original)
	originalPath := filepath.Join(s.uploadDir, "original", filename)
	stat, err := os.Stat(originalPath)
	if err != nil {
		return nil, fmt.Errorf("failed to stat original file: %w", err)
	}

	// 7. Save metadata to DB
	err = s.q.CreateImage(ctx, db.CreateImageParams{
		ID:           imageID,
		Filename:     filename,
		OriginalName: header.Filename,
		AltText:      altText,
		Title:        title,
		MimeType:     "image/jpeg",
		SizeBytes:    uint32(stat.Size()),
		Width:        width,
		Height:       height,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to save image metadata: %w", err)
	}

	// 8. Fetch and return the saved record
	dbImage, err := s.q.GetImage(ctx, imageID)
	if err != nil {
		return nil, err
	}

	return &ImageResponse{
		Image: dbImage,
		URLs:  s.buildURLs(filename),
	}, nil
}

// GetByID returns image metadata with URLs.
func (s *ImageService) GetByID(ctx context.Context, id string) (*ImageResponse, error) {
	img, err := s.q.GetImage(ctx, id)
	if err != nil {
		return nil, err
	}
	return &ImageResponse{
		Image: img,
		URLs:  s.buildURLs(img.Filename),
	}, nil
}

// List returns all images with URLs.
func (s *ImageService) List(ctx context.Context) ([]ImageResponse, error) {
	images, err := s.q.ListImages(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]ImageResponse, len(images))
	for i, img := range images {
		result[i] = ImageResponse{
			Image: img,
			URLs:  s.buildURLs(img.Filename),
		}
	}
	return result, nil
}

// UpdateMeta updates the SEO fields (alt_text, title) of an image.
func (s *ImageService) UpdateMeta(ctx context.Context, id, altText, title string) error {
	return s.q.UpdateImage(ctx, db.UpdateImageParams{
		ID:      id,
		AltText: altText,
		Title:   title,
	})
}

// Delete removes image files from disk and metadata from DB.
func (s *ImageService) Delete(ctx context.Context, id string) error {
	// 1. Get image metadata to find filename
	img, err := s.q.GetImage(ctx, id)
	if err != nil {
		return err
	}

	// 2. Delete files from all size directories
	for _, sizeKey := range []string{"original", "medium", "thumb"} {
		filePath := filepath.Join(s.uploadDir, sizeKey, img.Filename)
		if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
			// Log but don't fail if file is already gone
			slog.Warn("Failed to delete image file", "path", filePath, "error", err)
		}
	}

	// 3. Delete from DB
	return s.q.DeleteImage(ctx, id)
}

// EnsureUploadDirs creates the upload directories if they don't exist.
func (s *ImageService) EnsureUploadDirs() error {
	for _, sizeKey := range []string{"original", "medium", "thumb"} {
		dir := filepath.Join(s.uploadDir, sizeKey)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
	}
	return nil
}

// buildURLs constructs the URL paths for each image size.
func (s *ImageService) buildURLs(filename string) ImageURLs {
	// Clean upload dir for URL path (remove leading ./)
	base := strings.TrimPrefix(s.uploadDir, "./")
	return ImageURLs{
		Original: "/" + base + "/original/" + filename,
		Medium:   "/" + base + "/medium/" + filename,
		Thumb:    "/" + base + "/thumb/" + filename,
	}
}
