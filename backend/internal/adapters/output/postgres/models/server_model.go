package models

import (
	"chatApp/internal/domain"
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

func ServerFromDomain(server *domain.Server) *Server {
	if server == nil {
		return nil
	}
	return &Server{
		ID:          server.ID,
		Name:        server.Name,
		Description: server.Description,
		CreatedAt:   server.CreatedAt,
		UpdatedAt:   server.UpdatedAt,
		DeletedAt:   server.DeletedAt,
	}
}

func (s *Server) ToDomain() *domain.Server {
	if s == nil {
		return nil
	}
	roomIDs := make([]string, 0, len(s.Rooms))
	for i := range s.Rooms {
		roomIDs = append(roomIDs, s.Rooms[i].ID)
	}
	return &domain.Server{
		ID:          s.ID,
		Name:        s.Name,
		Description: s.Description,
		RoomIDs:     roomIDs,
		CreatedAt:   s.CreatedAt,
		UpdatedAt:   s.UpdatedAt,
		DeletedAt:   s.DeletedAt,
	}
}
