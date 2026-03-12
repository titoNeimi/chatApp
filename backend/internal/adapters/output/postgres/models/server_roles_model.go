package models

import (
	"chatApp/internal/domain"
	"time"
)

type ServerRoles struct {
	ID                string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	ServerID          string    `gorm:"type:uuid;not null;index;uniqueIndex:idx_server_role_name"`
	Server            Server    `gorm:"foreignKey:ServerID;references:ID"`
	Name              string    `gorm:"not null;uniqueIndex:idx_server_role_name"`
	CanDeleteMessages bool      `gorm:"default:false;not null"`
	CanMuteMembers    bool      `gorm:"default:false;not null"`
	CanManageMembers  bool      `gorm:"default:false;not null"`
	CanManageRooms    bool      `gorm:"default:false;not null"`
	CreatedAt         time.Time `gorm:"column:created_at;not null"`
	UpdatedAt         time.Time `gorm:"column:updated_at;not null"`
}

func (ServerRoles) TableName() string {
	return "server_roles"
}

func ServerRoleFromDomain(r *domain.ServerRole) *ServerRoles {
	if r == nil {
		return nil
	}
	return &ServerRoles{
		ID:                r.ID,
		ServerID:          r.ServerID,
		Name:              r.Name,
		CanDeleteMessages: r.CanDeleteMessages,
		CanMuteMembers:    r.CanMuteMembers,
		CanManageMembers:  r.CanManageMembers,
		CanManageRooms:    r.CanManageRooms,
		CreatedAt:         r.CreatedAt,
		UpdatedAt:         r.UpdatedAt,
	}
}

func (m *ServerRoles) ToDomain() *domain.ServerRole {
	if m == nil {
		return nil
	}
	return &domain.ServerRole{
		ID:                m.ID,
		ServerID:          m.ServerID,
		Name:              m.Name,
		CanDeleteMessages: m.CanDeleteMessages,
		CanMuteMembers:    m.CanMuteMembers,
		CanManageMembers:  m.CanManageMembers,
		CanManageRooms:    m.CanManageRooms,
		CreatedAt:         m.CreatedAt,
		UpdatedAt:         m.UpdatedAt,
	}
}
