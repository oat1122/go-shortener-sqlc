package utils

import (
	"encoding/hex"
	"errors"
	"image"
	"image/color"
	"image/draw"
	_ "image/jpeg"
	_ "image/png"

	xdraw "golang.org/x/image/draw"
)

var ErrInvalidHex = errors.New("invalid hex color")

// ResizeImage resizes the image to the specified width while maintaining aspect ratio.
func ResizeImage(img image.Image, targetWidth int) image.Image {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	if width <= targetWidth {
		return img
	}

	// Calculate new dimensions maintaining aspect ratio
	newW := targetWidth
	newH := (height * targetWidth) / width

	dst := image.NewRGBA(image.Rect(0, 0, newW, newH))
	xdraw.CatmullRom.Scale(dst, dst.Bounds(), img, bounds, draw.Over, nil)
	return dst
}

// ApplyBorderRadius applies a border radius to the image.
func ApplyBorderRadius(img image.Image, radius int) image.Image {
	if radius <= 0 {
		return img
	}

	bounds := img.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	
	// Create a new RGBA image for the result
	dst := image.NewRGBA(bounds)
	
	// Draw the source image onto the destination
	draw.Draw(dst, bounds, img, bounds.Min, draw.Src)

	// Fill corners with transparent color
    for y := 0; y < h; y++ {
        for x := 0; x < w; x++ {
            // Check if pixel is within the rounded rectangle
            if !isInRoundedRect(x, y, w, h, float64(radius)) {
                 dst.Set(x + bounds.Min.X, y + bounds.Min.Y, color.Transparent)
            }
        }
    }

	return dst
}

// isInRoundedRect checks if a point (x,y) is inside a rounded rectangle of size w*h with radius r
func isInRoundedRect(x, y, w, h int, r float64) bool {
    // If radius is bigger than half dimension, clamp it
    if r > float64(w)/2 { r = float64(w)/2 }
    if r > float64(h)/2 { r = float64(h)/2 }
    
    // Top-Left corner
    if float64(x) < r && float64(y) < r {
        dx := float64(x) - r
        dy := float64(y) - r
        return dx*dx + dy*dy <= r*r
    }
    
    // Top-Right corner
    if float64(x) > float64(w)-r && float64(y) < r {
        dx := float64(x) - (float64(w) - r)
        dy := float64(y) - r
        return dx*dx + dy*dy <= r*r
    }
    
    // Bottom-Left corner
    if float64(x) < r && float64(y) > float64(h)-r {
        dx := float64(x) - r
        dy := float64(y) - (float64(h) - r)
        return dx*dx + dy*dy <= r*r
    }
    
    // Bottom-Right corner
    if float64(x) > float64(w)-r && float64(y) > float64(h)-r {
        dx := float64(x) - (float64(w) - r)
        dy := float64(y) - (float64(h) - r)
        return dx*dx + dy*dy <= r*r
    }
    
    // Inside the main cross area
    return true
}

// GenerateLinearGradient creates a linear gradient image from startColor to endColor.
func GenerateLinearGradient(w, h int, startHex, endHex string) (image.Image, error) {
	startColor, err := ParseHexColor(startHex)
	if err != nil {
		return nil, err
	}
	endColor, err := ParseHexColor(endHex)
	if err != nil {
		return nil, err
	}

	img := image.NewRGBA(image.Rect(0, 0, w, h))

	r1, g1, b1, _ := startColor.RGBA()
	r2, g2, b2, _ := endColor.RGBA()

	for y := 0; y < h; y++ {
		// Calculate interpolation factor (0.0 to 1.0)
		t := float64(y) / float64(h)

		// Interpolate
		r := uint8((float64(r1)*(1-t) + float64(r2)*t) / 257)
		g := uint8((float64(g1)*(1-t) + float64(g2)*t) / 257)
		b := uint8((float64(b1)*(1-t) + float64(b2)*t) / 257)

		col := color.RGBA{R: r, G: g, B: b, A: 255}

		for x := 0; x < w; x++ {
			img.Set(x, y, col)
		}
	}
	return img, nil
}

// ApplyGradientMask applies the gradient to the QR code's foreground (black pixels).
func ApplyGradientMask(src image.Image, gradient image.Image, bgColorHex string) (image.Image, error) {
	bounds := src.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	
	// Resize gradient to match QR code size if needed
	if gradient.Bounds().Dx() != w || gradient.Bounds().Dy() != h {
		gradient = ResizeImage(gradient, w)
	}

	bgColor, err := ParseHexColor(bgColorHex)
	if err != nil {
		return nil, err
	}

	out := image.NewRGBA(bounds)

	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			originalColor := src.At(x, y)
			r, g, b, _ := originalColor.RGBA()
			// Improve darkness check: luminance or just sum. 
			// 0xFFFF is max for 16-bit color chanel.
			// Black is 0, 0, 0. White is FFFF, FFFF, FFFF.
			isForeground := (r + g + b) < (3 * 0x8000) // Simple < 50% brightness check

			if isForeground {
				// Take color from gradient
				out.Set(x, y, gradient.At(x, y))
			} else {
				// Set background color
				out.Set(x, y, bgColor)
			}
		}
	}

	return out, nil
}

// ParseHexColor parses a hex string (#RRGGBB) to color.RGBA
func ParseHexColor(s string) (color.RGBA, error) {
	c := color.RGBA{A: 255}
	if len(s) > 0 && s[0] == '#' {
		s = s[1:]
	}
	
	// Handle #RGB
	if len(s) == 3 {
		s = string([]byte{s[0], s[0], s[1], s[1], s[2], s[2]})
	}

	if len(s) != 6 {
		return c, ErrInvalidHex
	}

	// hex.DecodeString is easier
    b, err := hex.DecodeString(s)
    if err != nil {
        return c, err
    }
    c.R = b[0]
    c.G = b[1]
    c.B = b[2]

	return c, nil
}
