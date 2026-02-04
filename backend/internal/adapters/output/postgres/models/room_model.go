package models

import (
	"chatApp/internal/domain"
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

func RoomFromDomain(room *domain.Room) *Room {
	if room == nil {
		return nil
	}
	return &Room{
		ID:          room.ID,
		Name:        room.Name,
		Description: room.Description,
		Type:        room.Type,
		ServerID:    room.ServerID,
		CreatedAt:   room.CreatedAt,
		UpdatedAt:   room.UpdatedAt,
		DeletedAt:   room.DeletedAt,
	}
}

func (r *Room) ToDomain() *domain.Room {
	if r == nil {
		return nil
	}
	return &domain.Room{
		ID:          r.ID,
		Name:        r.Name,
		Description: r.Description,
		Type:        r.Type,
		ServerID:    r.ServerID,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
		DeletedAt:   r.DeletedAt,
	}
}
