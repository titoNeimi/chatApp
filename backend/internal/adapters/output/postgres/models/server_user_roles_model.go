package models

import "chatApp/internal/domain"

type ServerUserRoles struct {
	ServerID string      `gorm:"type:uuid;not null;primaryKey"`
	Server   Server      `gorm:"foreignKey:ServerID;references:ID"`
	UserID   string      `gorm:"type:uuid;not null;primaryKey"`
	User     User        `gorm:"foreignKey:UserID;references:ID"`
	RoleID   string      `gorm:"type:uuid;not null;primaryKey"`
	Role     ServerRoles `gorm:"foreignKey:RoleID;references:ID"`
}

func (ServerUserRoles) TableName() string {
	return "server_user_roles"
}

func ServerUserRoleFromDomain(r *domain.ServerUserRole) *ServerUserRoles {
	if r == nil {
		return nil
	}
	return &ServerUserRoles{
		ServerID: r.ServerID,
		UserID:   r.UserID,
		RoleID:   r.RoleID,
	}
}

func (m *ServerUserRoles) ToDomain() *domain.ServerUserRole {
	if m == nil {
		return nil
	}
	return &domain.ServerUserRole{
		ServerID: m.ServerID,
		UserID:   m.UserID,
		RoleID:   m.RoleID,
	}
}