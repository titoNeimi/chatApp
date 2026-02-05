package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
)

type RoomService struct {
	RoomRepo output.RoomRepository
}

func NewRoomService(roomRepo output.RoomRepository) *RoomService {
	return &RoomService{RoomRepo: roomRepo}
}

func (s *RoomService) Create(room domain.Room) (domain.Room, error) {
	panic("not implemented")
}
func (s *RoomService) Update(roomID string, updates map[string]interface{}) (domain.Room, error) {
	return s.RoomRepo.Update(roomID, updates)
}
func (s *RoomService) GetByID(roomID string) (domain.Room, error) {

	return s.RoomRepo.GetByID(roomID)

}
func (s *RoomService) SoftDelete(roomID string) error {
	panic("not implemented")
}
func (s *RoomService) CreateForServer(room domain.Room) (domain.Room, error) {
	//Todo: Chequear que el server exista
	return s.RoomRepo.Create(room)
}
func (s *RoomService) UpdateInServer(serverID, roomID string, updates map[string]interface{}) (domain.Room, error) {
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
	panic("not implemented")
}
func (s *RoomService) ListByServer(serverID string) ([]domain.Room, error) {
	panic("not implemented")
}
