package models

import (
	"time"

	"gorm.io/gorm"
)

type Room struct {
	ID          string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	Name        string `gorm:"not null"`
	Description *string
	Type        string         `gorm:"check:type IN ('direct_message','server');not null"`
	ServerID    *string        `gorm:"type:uuid;index"`
	Server      *Server        `gorm:"foreignKey:ServerID;references:ID"`
	CreatedAt   time.Time      `gorm:"column:created_at;not null"`
	UpdatedAt   time.Time      `gorm:"column:updated_at;not null"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

const (
	DIRECT_MESSAGE = "direct_message"
	SERVER         = "server"
)
