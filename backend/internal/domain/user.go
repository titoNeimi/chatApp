package domain

import "time"

type User struct {
	ID            string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Username      string
	Email         string
	Password_hash string    `gorm:"column:password_hash"`
	Role          string
	CreatedAt     time.Time `gorm:"column:created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at"`
	// Banned    bool
	// BannedAt  *time.Time
	// BanReason *string
}
