package utils

import (
	"regexp"
	"strings"
)

func MakeSlug(s string) string {
	// 1. Convert to lowercase
	s = strings.ToLower(s)

	// 2. Replace spaces with hyphens
	s = strings.ReplaceAll(s, " ", "-")

	// 3. Remove non-alphanumeric characters (except hyphens)
	// This regex keeps a-z, 0-9, and hyphens.  It removes everything else.
	// Thai characters will be removed if we use [^a-z0-9-].
	// For a simple start, let's keep it restrictive for English, 
	// or if we want to support Thai slugs, we might need a better library or just allow all non-special chars.
	// For "Plan Be", let's assume English slugs for URLs or just basic clean up.
	// Note: Browsers encode Thai URLs anyway. 
	// Let's just remove "unsafe" URL characters.
	
	reg, _ := regexp.Compile("[^a-z0-9\\-]+")
	s = reg.ReplaceAllString(s, "")

	// 4. Remove multiple hyphens
	reg2, _ := regexp.Compile("-+")
	s = reg2.ReplaceAllString(s, "-")

	// 5. Trim hyphens from start and end
	s = strings.Trim(s, "-")

	return s
}
