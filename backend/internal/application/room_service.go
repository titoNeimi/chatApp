package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
)

type RoomService struct {
	RoomRepo   output.RoomRepository
	ServerRepo output.ServerRepository
}

func NewRoomService(roomRepo output.RoomRepository, serverRepo output.ServerRepository) *RoomService {
	return &RoomService{
		RoomRepo:   roomRepo,
		ServerRepo: serverRepo,
	}
}

func (s *RoomService) Create(room domain.Room) (domain.Room, error) {
	return s.RoomRepo.Create(room)
}
func (s *RoomService) Update(roomID string, updates map[string]interface{}) (domain.Room, error) {
	return s.RoomRepo.Update(roomID, updates)
}
func (s *RoomService) GetByID(roomID string) (domain.Room, error) {

	return s.RoomRepo.GetByID(roomID)

}
func (s *RoomService) SoftDelete(roomID string) error {
	return s.RoomRepo.SoftDelete(roomID)
}
func (s *RoomService) CreateForServer(room domain.Room) (domain.Room, error) {
	if room.ServerID == nil {
		return domain.Room{}, domain.ErrServerNotFound
	}
	if _, err := s.ServerRepo.GetServerByID(*room.ServerID); err != nil {
		return domain.Room{}, err
	}
	return s.RoomRepo.Create(room)
}
func (s *RoomService) UpdateInServer(serverID, roomID string, updates map[string]interface{}) (domain.Room, error) {
	if _, err := s.ServerRepo.GetServerByID(serverID); err != nil {
		return domain.Room{}, err
	}

	room, err := s.RoomRepo.GetByID(roomID)
	if err != nil {
		return domain.Room{}, err
	}
	if room.ServerID == nil || *room.ServerID != serverID {
		return domain.Room{}, domain.ErrRoomNotFound
	}

	return s.RoomRepo.Update(roomID, updates)
}
func (s *RoomService) SoftDeleteInServer(roomID, serverID string) error {
	if _, err := s.ServerRepo.GetServerByID(serverID); err != nil {
		return err
	}

	room, err := s.RoomRepo.GetByID(roomID)
	if err != nil {
		return err
	}
	if room.ServerID == nil || *room.ServerID != serverID {
		return domain.ErrRoomNotFound
	}

	return s.RoomRepo.SoftDelete(roomID)

}
func (s *RoomService) ListByServer(serverID string) ([]domain.Room, error) {
	if _, err := s.ServerRepo.GetServerByID(serverID); err != nil {
		return nil, err
	}

	servers, err := s.RoomRepo.ListByServer(serverID)

	if err != nil {
		return nil, err
	}

	return servers, nil
}
