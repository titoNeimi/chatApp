package models

import (
	"time"

	"gorm.io/gorm"
)

type Server struct {
	ID          string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	Name        string `gorm:"not null"`
	Description *string
	Rooms       []Room `gorm:"foreignKey:ServerID;references:ID"`
	CreatedAt   time.Time      `gorm:"column:created_at;not null"`
	UpdatedAt   time.Time      `gorm:"column:updated_at;not null"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

