package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type RoomUsers struct {
	ID                string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	RoomID            string         `gorm:"type:uuid;not null;index;uniqueIndex:idx_room_user"`
	Room              Room           `gorm:"foreignKey:RoomID;references:ID"`
	UserID            string         `gorm:"type:uuid;not null;index;uniqueIndex:idx_room_user"`
	User              User           `gorm:"foreignKey:UserID;references:ID"`
	LastReadMessageID *string        `gorm:"type:uuid;column:last_read_message_id;index"`
	LastReadMessage   *Message       `gorm:"foreignKey:LastReadMessageID;references:ID"`
	IsMuted           bool           `gorm:"column:is_muted;default:false;not null"`
	Permissions       datatypes.JSON `gorm:"type:jsonb;default:'{}';not null"`
	CreatedAt         time.Time      `gorm:"column:created_at;not null"`
	UpdatedAt         time.Time      `gorm:"column:updated_at;not null"`
	DeletedAt         gorm.DeletedAt `gorm:"index"`
}

func (RoomUsers) TableName() string {
	return "room_users"
}
