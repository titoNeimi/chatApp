package input

import "chatApp/internal/domain"

type ServerService interface {
	GetAll() ([]domain.Server, error)
	ListByUserID(userID string) ([]domain.Server, error)
	Create(server domain.Server, userID string) (domain.Server, error)
	Update(serverID string, updates map[string]interface{}) (domain.Server, error)
	SoftDelete(serverID string) error
	GetServerByID(serverId string) (domain.Server, error)
	JoinServer(serverID, userID string) error
	GetServerStats(serverID string) (domain.ServerStats, error)
}
