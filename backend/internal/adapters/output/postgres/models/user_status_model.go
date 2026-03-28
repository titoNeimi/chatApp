package models

import (
	"chatApp/internal/domain"
	"time"
)

type UserStatus struct {
	UserID    string    `gorm:"type:uuid;primaryKey;not null"`
	User      User      `gorm:"foreignKey:UserID;references:ID"`
	Status    string    `gorm:"type:varchar(20);check:status IN ('online','away','invisible');not null;default:online"`
	UpdatedAt time.Time `gorm:"column:updated_at;not null"`
}

func (UserStatus) TableName() string {
	return "user_statuses"
}

func UserStatusFromDomain(s *domain.UserStatus) *UserStatus {
	if s == nil {
		return nil
	}
	return &UserStatus{
		UserID:    s.UserID,
		Status:    string(s.Status),
		UpdatedAt: s.UpdatedAt,
	}
}

func (m *UserStatus) ToDomain() *domain.UserStatus {
	if m == nil {
		return nil
	}
	return &domain.UserStatus{
		UserID:    m.UserID,
		Status:    domain.UserStatusType(m.Status),
		UpdatedAt: m.UpdatedAt,
	}
}
