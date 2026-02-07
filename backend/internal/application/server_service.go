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

func (s *serverService) GetAll() ([]domain.Server, error) {
	return s.serverRepo.GetAll()
}

func (s *serverService) ListByUserID(userID string) ([]domain.Server, error) {
	return s.serverRepo.ListByUserID(userID)
}

func (s *serverService) Create(server domain.Server) (domain.Server, error) {
	return s.serverRepo.Create(server)
}
func (s *serverService) Update(serverID string, updates map[string]interface{}) (domain.Server, error) {
	return s.serverRepo.Update(serverID, updates)
}
func (s *serverService) SoftDelete(serverID string) error {
	//Todo: Make soft delete to Rooms, Message
	return s.serverRepo.SoftDelete(serverID)
}
func (s *serverService) GetServerByID(serverId string) (domain.Server, error) {
	return s.serverRepo.GetServerByID(serverId)
}
