package Gamelist

import (
	"slices"
	"strings"
)

// Strip common prefixes from titles and convert to lowercase for sorting
func (gb *GameBrowser) SanitizeTitle(title string) string {
	// Common articles and unimportant words to remove from the beginning
	prefixes := []string{"the ", "a ", "an "}
	// Convert to lowercase and trim whitespace
	sanitized := strings.ToLower(strings.TrimSpace(title))
	// Remove prefixes if they exist at the beginning
	for _, prefix := range prefixes {
		if strings.HasPrefix(sanitized, prefix) {
			sanitized = strings.TrimSpace(sanitized[len(prefix):])
			break // Only remove the first matching prefix
		}
	}
	return sanitized
}

func (gb *GameBrowser) SortGameList() {
	slices.SortStableFunc(gb.Games, func(a, b Game) int {
		return strings.Compare(gb.SanitizeTitle(a.Title), gb.SanitizeTitle(b.Title))
	})
}
