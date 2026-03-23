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
	IsPrivate   bool           `gorm:"default:false"`
	IsReadOnly  bool           `gorm:"default:false;not null"`
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
		IsPrivate:   room.IsPrivate,
		IsReadOnly:  room.IsReadOnly,
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
		IsPrivate:   r.IsPrivate,
		IsReadOnly:  r.IsReadOnly,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
		DeletedAt:   r.DeletedAt,
	}
}
