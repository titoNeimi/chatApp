package output

import "chatApp/internal/domain"

type ServerRepository interface {
	GetAll() ([]domain.Server, error)
	Create(server domain.Server) (domain.Server, error)
	Update(serverID string, updates map[string]interface{}) (domain.Server, error)
	SoftDelete(serverID string) error
	GetServerByID(serverId string) (domain.Server, error)
}
