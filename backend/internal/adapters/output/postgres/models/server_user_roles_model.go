package models

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