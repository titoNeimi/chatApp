package domain

import "time"

type DMChannel struct {
	ID string
	User1ID string
	User2ID string
	RoomID string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}