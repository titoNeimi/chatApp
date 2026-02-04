package domain

import (
	"time"

	"gorm.io/gorm"
)

type Server struct {
	ID          string
	Name        string
	Description *string
	RoomIDs     []string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt
}
