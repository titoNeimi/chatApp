package models

type ServerUsers struct {
	ServerID string `gorm:"type:uuid;not null;primaryKey"`
	Server   Server `gorm:"foreignKey:ServerID;references:ID"`
	UserID   string `gorm:"type:uuid;not null;primaryKey"`
	User     User   `gorm:"foreignKey:UserID;references:ID"`
}

func (ServerUsers) TableName() string {
	return "server_users"
}