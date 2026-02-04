package domain

import (
	"time"

	"gorm.io/gorm"
)

type Room struct {
	ID          string
	Name        string
	Description *string
	Type        string
	ServerID    *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt
}

const (
	DIRECT_MESSAGE = "direct_message"
	SERVER         = "server"
)
