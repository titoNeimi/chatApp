package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
)

type serverService struct {
	serverRepo output.ServerRepository
}

func NewServerService(serverRepo output.ServerRepository) *serverService {
	return &serverService{serverRepo: serverRepo}
}

func (s *serverService) Create(server domain.Server) (domain.Server, error) {
	return s.serverRepo.Create(server)
}
func (s *serverService) Update(server domain.Server, serverID string) (domain.Server, error) {
	panic("not implemented")
}
func (s *serverService) SoftDelete(serverID string) error {
	panic("not implemented")
}
func (s *serverService) GetServerByID(serverId string) (domain.Server, error) {
	panic("not implemented")
}
