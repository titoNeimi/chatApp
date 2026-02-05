package valaidation

import (
	"chatApp/internal/domain"
	"strings"
)

func IsValidID(id string) error {
	if strings.TrimSpace(id) == "" {
		return domain.ErrInvalidID
	}
	return nil
}
