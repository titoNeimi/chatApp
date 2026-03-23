package models

import (
	"chatApp/internal/domain"
	"time"

	"gorm.io/gorm"
)

type DirectMessageChannel struct {
	ID        string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	User1ID   string         `gorm:"type:uuid;index;not null"`
	User1     User           `gorm:"foreignKey:User1ID;references:ID"`
	User2ID   string         `gorm:"type:uuid;index;not null"`
	User2     User           `gorm:"foreignKey:User2ID;references:ID"`
	RoomID    string         `gorm:"type:uuid;not null;index"`
	Room      Room           `gorm:"foreignKey:RoomID;references:ID"`
	CreatedAt time.Time      `gorm:"column:created_at;not null"`
	UpdatedAt time.Time      `gorm:"column:updated_at;not null"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (dm *DirectMessageChannel) ToDomain() *domain.DMChannel {
	if dm == nil {
		return nil
	}

	var deletedAt *time.Time
	if dm.DeletedAt.Valid {
		deletedAt = &dm.DeletedAt.Time
	}

	return &domain.DMChannel{
		ID:        dm.ID,
		User1ID:   dm.User1ID,
		User2ID:   dm.User2ID,
		RoomID:    dm.RoomID,
		CreatedAt: dm.CreatedAt,
		UpdatedAt: dm.UpdatedAt,
		DeletedAt: deletedAt,
	}
}

func DMChannelFromDomain(dm *domain.DMChannel) *DirectMessageChannel {
	if dm == nil {
		return nil
	}

	deletedAt := gorm.DeletedAt{}
	if dm.DeletedAt != nil {
		deletedAt.Time = *dm.DeletedAt
		deletedAt.Valid = true
	}

	return &DirectMessageChannel{
		ID:        dm.ID,
		User1ID:   dm.User1ID,
		User2ID:   dm.User2ID,
		RoomID:    dm.RoomID,
		CreatedAt: dm.CreatedAt,
		UpdatedAt: dm.UpdatedAt,
		DeletedAt: deletedAt,
	}
}
