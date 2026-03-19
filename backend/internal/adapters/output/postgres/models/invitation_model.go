package models

import (
	"chatApp/internal/domain"
	"time"

	"gorm.io/gorm"
)

type Invitation struct {
	ID        string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	ServerID  string `gorm:"type:uuid;index"`
	Server    Server `gorm:"foreignKey:ServerID;references:ID"`
	Code      string `gorm:"not null;index"`
	CreatedBy string `gorm:"type:uuid;index;not null"`
	MaxUses   *int
	Uses      int
	ExpiresAt *time.Time
	CreatedAt time.Time      `gorm:"column:created_at;not null"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (i *Invitation) ToDomain() *domain.Invitation {
	if i == nil {
		return nil
	}
	return &domain.Invitation{
		ID:        i.ID,
		ServerID:  i.ServerID,
		Code:      i.Code,
		CreatedBy: i.CreatedBy,
		MaxUses:   i.MaxUses,
		Uses:      i.Uses,
		ExpiresAt: i.ExpiresAt,
		CreatedAt: i.CreatedAt,
	}
}

func InvitationFromDomain(d *domain.Invitation) *Invitation {
	if d == nil {
		return nil
	}
	return &Invitation{
		ID:        d.ID,
		ServerID:  d.ServerID,
		Code:      d.Code,
		CreatedBy: d.CreatedBy,
		MaxUses:   d.MaxUses,
		Uses:      d.Uses,
		ExpiresAt: d.ExpiresAt,
		CreatedAt: d.CreatedAt,
	}
}
