package domain

import "time"

type Invitation struct {
	ID        string
	ServerID  string
	CreatedBy string
	Code      string
	MaxUses   *int
	Uses      int
	ExpiresAt *time.Time
	CreatedAt time.Time
}
