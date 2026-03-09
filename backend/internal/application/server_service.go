package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
)

type serverService struct {
	serverRepo output.ServerRepository
	roomRepo   output.RoomRepository
}

func NewServerService(serverRepo output.ServerRepository, roomRepo output.RoomRepository) *serverService {
	return &serverService{serverRepo: serverRepo, roomRepo: roomRepo}
}

func (s *serverService) GetAll() ([]domain.Server, error) {
	return s.serverRepo.GetAll()
}

func (s *serverService) ListByUserID(userID string) ([]domain.Server, error) {
	return s.serverRepo.ListByUserID(userID)
}

func (s *serverService) Create(server domain.Server, userID string) (domain.Server, error) {
	server, err := s.serverRepo.Create(server)
	if err != nil {
		return domain.Server{}, err
	}

	err = s.serverRepo.AddUserToServer(server.ID, userID)
	return server, err
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

func (s *serverService) JoinServer(serverID, userID string) error {
	if _, err := s.serverRepo.GetServerByID(serverID); err != nil {
		return err
	}
	if err := s.serverRepo.AddUserToServer(serverID, userID); err != nil {
		return err
	}
	publicRooms, _ := s.serverRepo.ListPublicRoomsByServer(serverID)
	for _, room := range publicRooms {
		_ = s.roomRepo.AddUsersToRoom(room.ID, []string{userID})
	}
	return nil
}
