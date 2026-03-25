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
	IsPrivate   bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt
}

type ServerStats struct {
	MemberCount int
	RoomCount   int
	RoleCount   int
}

type TrendingServer struct {
	ID             string
	Name           string
	Description    *string
	IsPrivate      bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
	MemberCount    int
	RecentMessages int
	ActiveUsers    int
	TrendScore     int
}
