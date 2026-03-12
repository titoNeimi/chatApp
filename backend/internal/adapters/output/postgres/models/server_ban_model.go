package models

import (
	"chatApp/internal/domain"
	"time"
)

type ServerBan struct {
	ID       string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	ServerID string    `gorm:"type:uuid;not null;uniqueIndex:idx_server_ban_unique"`
	Server   Server    `gorm:"foreignKey:ServerID;references:ID"`
	UserID   string    `gorm:"type:uuid;not null;uniqueIndex:idx_server_ban_unique"`
	User     User      `gorm:"foreignKey:UserID;references:ID"`
	BannedBy string    `gorm:"type:uuid;not null"`
	Reason   *string
	BannedAt time.Time `gorm:"column:banned_at;not null"`
}

func (ServerBan) TableName() string {
	return "server_bans"
}

func ServerBanFromDomain(b *domain.ServerBan) *ServerBan {
	if b == nil {
		return nil
	}
	return &ServerBan{
		ID:       b.ID,
		ServerID: b.ServerID,
		UserID:   b.UserID,
		BannedBy: b.BannedBy,
		Reason:   b.Reason,
		BannedAt: b.BannedAt,
	}
}

func (m *ServerBan) ToDomain() *domain.ServerBan {
	if m == nil {
		return nil
	}
	return &domain.ServerBan{
		ID:       m.ID,
		ServerID: m.ServerID,
		UserID:   m.UserID,
		BannedBy: m.BannedBy,
		Reason:   m.Reason,
		BannedAt: m.BannedAt,
	}
}
