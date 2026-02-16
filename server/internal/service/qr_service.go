package service

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/draw"
	"io"

	"github.com/yeqown/go-qrcode/v2"
	"github.com/yeqown/go-qrcode/writer/standard"

	"go-shortener-sqlc/internal/utils"
)

type QRService struct {
	BaseURL string
}

func NewQRService(baseURL string) *QRService {
	return &QRService{BaseURL: baseURL}
}

type QROptions struct {
	Logo         image.Image
	LogoSize     int
	BorderRadius int
	FgColor      string
	BgColor      string
	GradientStart string
	GradientEnd   string
}

// GenerateQR generates a QR code image based on the short code and options.
func (s *QRService) GenerateQR(ctx context.Context, code string, opts QROptions) (image.Image, error) {
	fullURL := s.BaseURL + "/" + code
	
	// Defaults
	if opts.LogoSize <= 0 { opts.LogoSize = 100 }
	if opts.LogoSize > 240 { opts.LogoSize = 240 }
	if opts.BorderRadius < 0 { opts.BorderRadius = 0 }
	if opts.FgColor == "" { opts.FgColor = "#000000" }
	if opts.BgColor == "" { opts.BgColor = "#FFFFFF" }

	qrc, err := qrcode.New(fullURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create QR object: %w", err)
	}

	useGradient := opts.GradientStart != "" && opts.GradientEnd != ""

	if !useGradient {
		// Standard generation
		options := []standard.ImageOption{
			standard.WithBgColorRGBHex(opts.BgColor),
			standard.WithFgColorRGBHex(opts.FgColor),
			standard.WithQRWidth(40),
		}

		if opts.Logo != nil {
			logoProcessed := utils.ResizeImage(opts.Logo, opts.LogoSize)
			if opts.BorderRadius > 0 {
				logoProcessed = utils.ApplyBorderRadius(logoProcessed, opts.BorderRadius)
			}
			options = append(options, standard.WithLogoImage(logoProcessed))
		}

		// Write to buffer to get image
		buf := new(bytes.Buffer)
		wr := standard.NewWithWriter(nopCloser{buf}, options...)
		if err = qrc.Save(wr); err != nil {
			return nil, fmt.Errorf("failed to save QR: %w", err)
		}
		
		img, _, err := image.Decode(buf)
		return img, err
	}

	// Gradient Generation
	// 1. Generate Base QR (Black on White)
	buf := new(bytes.Buffer)
	baseOptions := []standard.ImageOption{
		standard.WithBgColorRGBHex("#FFFFFF"),
		standard.WithFgColorRGBHex("#000000"),
		standard.WithQRWidth(40),
	}
	wr := standard.NewWithWriter(nopCloser{buf}, baseOptions...)
	if err := qrc.Save(wr); err != nil {
		return nil, fmt.Errorf("failed to generate base QR: %w", err)
	}

	baseImg, _, err := image.Decode(buf)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base QR: %w", err)
	}

	// 2. Create Gradient
	bounds := baseImg.Bounds()
	gradImg, err := utils.GenerateLinearGradient(bounds.Dx(), bounds.Dy(), opts.GradientStart, opts.GradientEnd)
	if err != nil {
		return nil, fmt.Errorf("failed to generate gradient: %w", err)
	}

	// 3. Apply Gradient Mask
	finalImg, err := utils.ApplyGradientMask(baseImg, gradImg, opts.BgColor)
	if err != nil {
		return nil, fmt.Errorf("failed to apply gradient: %w", err)
	}

	// 4. Draw Logo if present
	if opts.Logo != nil {
		logoProcessed := utils.ResizeImage(opts.Logo, opts.LogoSize)
		if opts.BorderRadius > 0 {
			logoProcessed = utils.ApplyBorderRadius(logoProcessed, opts.BorderRadius)
		}

		logoBounds := logoProcessed.Bounds()
		x := (bounds.Dx() - logoBounds.Dx()) / 2
		y := (bounds.Dy() - logoBounds.Dy()) / 2

		dst, ok := finalImg.(draw.Image)
		if ok {
			draw.Draw(dst, image.Rect(x, y, x+logoBounds.Dx(), y+logoBounds.Dy()), logoProcessed, logoBounds.Min, draw.Over)
		}
	}

	return finalImg, nil
}

type nopCloser struct {
	io.Writer
}

func (nopCloser) Close() error { return nil }
