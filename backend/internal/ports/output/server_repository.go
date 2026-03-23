package output

import "chatApp/internal/domain"

type ServerRepository interface {
	GetAll() ([]domain.Server, error)
	ListByUserID(userID string) ([]domain.Server, error)
	Create(server domain.Server) (domain.Server, error)
	Update(serverID string, updates map[string]any) (domain.Server, error)
	SoftDelete(serverID string) error
	GetServerByID(serverId string) (domain.Server, error)
	ListUsersByServer(serverID string) ([]domain.User, error)
	ListPublicRoomsByServer(serverID string) ([]domain.Room, error)
	AddUserToServer(serverID, userID string) error
	IsUserMember(serverID, userID string) (bool, error)
	RemoveUserFromServer(serverID, userID string) error
	GetServerStats(serverID string) (domain.ServerStats, error)
	GetAllForAdmin() ([]domain.Server, error)
}
