package domain

import "time"

type BlockedUser struct {
	BlockerID     string
	BlockedUserID string
	CreatedAt     time.Time
	DeletedAt     *time.Time
}
