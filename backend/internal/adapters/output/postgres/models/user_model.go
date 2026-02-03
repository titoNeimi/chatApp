package models

import (
	"chatApp/internal/domain"
	"time"
)

type User struct {
	ID           string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	Username     string `gorm:"not null"`
	Email        string    `gorm:"uniqueIndex;not null"`
	PasswordHash string    `gorm:"column:password_hash;not null"`
	Role         string    `gorm:"default:user;check:role IN ('user','admin');not null"`
	CreatedAt    time.Time `gorm:"column:created_at;not null"`
	UpdatedAt    time.Time `gorm:"column:updated_at;not null"`
}

func (User) TableName() string {
	return "users"
}

func UserFromDomain(user *domain.User) *User {
	if user == nil {
		return nil
	}
	return &User{
		ID:           user.ID,
		Username:     user.Username,
		Email:        user.Email,
		PasswordHash: user.Password_hash,
		Role:         user.Role,
		CreatedAt:    user.CreatedAt,
		UpdatedAt:    user.UpdatedAt,
	}
}

func (u *User) ToDomain() *domain.User {
	if u == nil {
		return nil
	}
	return &domain.User{
		ID:            u.ID,
		Username:      u.Username,
		Email:         u.Email,
		Password_hash: u.PasswordHash,
		Role:          u.Role,
		CreatedAt:     u.CreatedAt,
		UpdatedAt:     u.UpdatedAt,
	}
}
