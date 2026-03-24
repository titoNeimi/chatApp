package models

import (
	"chatApp/internal/domain"
	"time"
)

type Friendship struct {
	ID          string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	RequesterID string    `gorm:"type:uuid;not null;index"`
	AddresseeID string    `gorm:"type:uuid;not null;index"`
	Status      string    `gorm:"type:varchar(20);not null;default:'pending'"`
	CreatedAt   time.Time `gorm:"column:created_at;not null"`
	UpdatedAt   time.Time `gorm:"column:updated_at;not null"`
}

func FriendshipFromDomain(f *domain.Friendship) *Friendship {
	if f == nil {
		return nil
	}
	return &Friendship{
		ID:          f.ID,
		RequesterID: f.RequesterID,
		AddresseeID: f.AddresseeID,
		Status:      f.Status,
		CreatedAt:   f.CreatedAt,
		UpdatedAt:   f.UpdatedAt,
	}
}
func (m *Friendship) ToDomain() *domain.Friendship {
	if m == nil {
		return nil
	}

	return &domain.Friendship{
		ID:          m.ID,
		RequesterID: m.RequesterID,
		AddresseeID: m.AddresseeID,
		Status:      m.Status,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}
