package output

import "chatApp/internal/domain"

type ServerBanRepository interface {
	BanUser(ban domain.ServerBan) (domain.ServerBan, error)
	UnbanUser(serverID, userID string) error
	GetBan(serverID, userID string) (*domain.ServerBan, error)
	ListBansByServer(serverID string) ([]domain.ServerBan, error)
	IsUserBanned(serverID, userID string) (bool, error)
}
