package models

import (
	"chatApp/internal/domain"
	"time"
)

type RefreshToken struct {
	ID        string     `gorm:"type:uuid;primaryKey;not null"`
	UserID    string     `gorm:"type:uuid;not null;index"`
	User      User       `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE"`
	TokenHash string     `gorm:"column:token_hash;not null;index"`
	ExpiresAt time.Time  `gorm:"column:expires_at;not null;index"`
	RevokedAt *time.Time `gorm:"column:revoked_at;index"`
	CreatedAt time.Time  `gorm:"column:created_at;not null"`
	UpdatedAt time.Time  `gorm:"column:updated_at;not null"`
}

func (RefreshToken) TableName() string {
	return "refresh_tokens"
}

func RefreshTokenFromDomain(refreshSession *domain.RefreshSession) *RefreshToken {
	if refreshSession == nil {
		return nil
	}

	return &RefreshToken{
		ID:        refreshSession.ID,
		UserID:    refreshSession.UserID,
		TokenHash: refreshSession.TokenHash,
		ExpiresAt: refreshSession.ExpiresAt,
		RevokedAt: refreshSession.RevokedAt,
		CreatedAt: refreshSession.CreatedAt,
		UpdatedAt: refreshSession.UpdatedAt,
	}
}

func (r *RefreshToken) ToDomain() *domain.RefreshSession {
	if r == nil {
		return nil
	}

	return &domain.RefreshSession{
		ID:        r.ID,
		UserID:    r.UserID,
		TokenHash: r.TokenHash,
		ExpiresAt: r.ExpiresAt,
		RevokedAt: r.RevokedAt,
		CreatedAt: r.CreatedAt,
		UpdatedAt: r.UpdatedAt,
	}
}
