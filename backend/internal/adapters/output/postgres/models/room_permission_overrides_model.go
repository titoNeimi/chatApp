package models

import "time"

type RoomPermissionOverrides struct {
	ID                string      `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	RoomID            string      `gorm:"type:uuid;not null;index"`
	Room              Room        `gorm:"foreignKey:RoomID;references:ID"`
	RoleID            *string     `gorm:"type:uuid;index;check:chk_role_or_user,role_id IS NOT NULL OR user_id IS NOT NULL"`
	Role              *ServerRoles `gorm:"foreignKey:RoleID;references:ID"`
	UserID            *string     `gorm:"type:uuid;index"`
	User              *User       `gorm:"foreignKey:UserID;references:ID"`
	CanDeleteMessages *bool
	CanMuteMembers    *bool
	CanManageMembers  *bool
	CreatedAt         time.Time `gorm:"column:created_at;not null"`
	UpdatedAt         time.Time `gorm:"column:updated_at;not null"`
}

func (RoomPermissionOverrides) TableName() string {
	return "room_permission_overrides"
}