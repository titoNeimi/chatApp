package models

import "time"

type ServerRoles struct {
	ID                string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	ServerID          string    `gorm:"type:uuid;not null;index;uniqueIndex:idx_server_role_name"`
	Server            Server    `gorm:"foreignKey:ServerID;references:ID"`
	Name              string    `gorm:"not null;uniqueIndex:idx_server_role_name"`
	CanDeleteMessages bool      `gorm:"default:false;not null"`
	CanMuteMembers    bool      `gorm:"default:false;not null"`
	CanManageMembers  bool      `gorm:"default:false;not null"`
	CreatedAt         time.Time `gorm:"column:created_at;not null"`
	UpdatedAt         time.Time `gorm:"column:updated_at;not null"`
}

func (ServerRoles) TableName() string {
	return "server_roles"
}