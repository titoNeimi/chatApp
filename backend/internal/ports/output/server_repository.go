package output

import "chatApp/internal/domain"

type ServerRepository interface {
	Create(server domain.Server) (domain.Server, error)
	Update(server domain.Server, serverID string) (domain.Server, error)
	SoftDelete(serverID string) error
	GetServerByID(serverId string) (domain.Server, error)
}
