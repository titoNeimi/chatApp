package domain

import "time"

const (
	RoleUser  = "user"
	RoleAdmin = "admin"
)

func IsValidRole(role string) bool {
	return role == RoleUser || role == RoleAdmin
}

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
