package models

import (
	"chatApp/internal/domain"
	"time"
)

type BlockedUser struct {
	BlockerID     string     `gorm:"type:uuid;not null;index;primaryKey"`
	BlockedUserID string     `gorm:"type:uuid;not null;index;primaryKey"`
	CreatedAt     time.Time  `gorm:"column:created_at;not null"`
	DeletedAt     *time.Time `gorm:"column:deleted_at;index"`
}

func BlockedUserFromDomain(b *domain.BlockedUser) *BlockedUser {
	if b == nil {
		return nil
	}
	return &BlockedUser{
		BlockerID:     b.BlockerID,
		BlockedUserID: b.BlockedUserID,
		CreatedAt:     b.CreatedAt,
		DeletedAt:     b.DeletedAt,
	}
}

func (m *BlockedUser) ToDomain() *domain.BlockedUser {
	if m == nil {
		return nil
	}
	return &domain.BlockedUser{
		BlockerID:     m.BlockerID,
		BlockedUserID: m.BlockedUserID,
		CreatedAt:     m.CreatedAt,
		DeletedAt:     m.DeletedAt,
	}
}