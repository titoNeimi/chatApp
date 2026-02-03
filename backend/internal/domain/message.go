package domain

import "time"

type Message struct {
	ID               string
	Content          string
	UserID           string
	ReplyToMessageID *string
	RoomID           string
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        *time.Time
}
