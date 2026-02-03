package models

import (
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
