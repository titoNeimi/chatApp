package domain

import "time"

type User struct {
	ID            string
	Username      string
	Email         string
	Password_hash string
	Role          string
	CreatedAt     time.Time
	UpdatedAt     time.Time
	// Banned    bool
	// BannedAt  *time.Time
	// BanReason *string
}
