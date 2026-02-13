package api

import (
	"image"
	"image/color"
	"image/draw"
	_ "image/jpeg"
	_ "image/png"

	xdraw "golang.org/x/image/draw"
)

// resizeImage resizes the image to the specified width while maintaining aspect ratio.
func resizeImage(img image.Image, targetWidth int) image.Image {
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

// applyBorderRadius applies a border radius to the image.
// If radius is large enough (>= width/2 or >= height/2), it effectively makes it a circle/oval.
func applyBorderRadius(img image.Image, radius int) image.Image {
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
