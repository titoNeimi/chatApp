package models

import (
	"chatApp/internal/domain"
	"time"
)

type RoomPermissionOverrides struct {
	ID                string       `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	RoomID            string       `gorm:"type:uuid;not null;index"`
	Room              Room         `gorm:"foreignKey:RoomID;references:ID"`
	RoleID            *string      `gorm:"type:uuid;index;check:chk_role_or_user,role_id IS NOT NULL OR user_id IS NOT NULL"`
	Role              *ServerRoles `gorm:"foreignKey:RoleID;references:ID"`
	UserID            *string      `gorm:"type:uuid;index"`
	User              *User        `gorm:"foreignKey:UserID;references:ID"`
	CanDeleteMessages *bool
	CanMuteMembers    *bool
	CanManageMembers  *bool
	CanManageRooms    *bool
	CreatedAt         time.Time `gorm:"column:created_at;not null"`
	UpdatedAt         time.Time `gorm:"column:updated_at;not null"`
}

func (RoomPermissionOverrides) TableName() string {
	return "room_permission_overrides"
}

func RoomPermissionOverrideFromDomain(o *domain.RoomPermissionOverride) *RoomPermissionOverrides {
	if o == nil {
		return nil
	}
	return &RoomPermissionOverrides{
		ID:                o.ID,
		RoomID:            o.RoomID,
		RoleID:            o.RoleID,
		UserID:            o.UserID,
		CanDeleteMessages: o.CanDeleteMessages,
		CanMuteMembers:    o.CanMuteMembers,
		CanManageMembers:  o.CanManageMembers,
		CanManageRooms:    o.CanManageRooms,
		CreatedAt:         o.CreatedAt,
		UpdatedAt:         o.UpdatedAt,
	}
}

func (m *RoomPermissionOverrides) ToDomain() *domain.RoomPermissionOverride {
	if m == nil {
		return nil
	}
	return &domain.RoomPermissionOverride{
		ID:                m.ID,
		RoomID:            m.RoomID,
		RoleID:            m.RoleID,
		UserID:            m.UserID,
		CanDeleteMessages: m.CanDeleteMessages,
		CanMuteMembers:    m.CanMuteMembers,
		CanManageMembers:  m.CanManageMembers,
		CanManageRooms:    m.CanManageRooms,
		CreatedAt:         m.CreatedAt,
		UpdatedAt:         m.UpdatedAt,
	}
}
