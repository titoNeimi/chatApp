package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"context"
)

type RoomService struct {
	RoomRepo   output.RoomRepository
	ServerRepo output.ServerRepository
	UserRepo   output.UserRepository
}

func NewRoomService(roomRepo output.RoomRepository, serverRepo output.ServerRepository, userRepo output.UserRepository) *RoomService {
	return &RoomService{
		RoomRepo:   roomRepo,
		ServerRepo: serverRepo,
		UserRepo:   userRepo,
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
	created, err := s.RoomRepo.Create(room)
	if err != nil {
		return domain.Room{}, err
	}
	if !created.IsPrivate {
		users, _ := s.ServerRepo.ListUsersByServer(*room.ServerID)
		userIDs := make([]string, len(users))
		for i, u := range users {
			userIDs[i] = u.ID
		}
		_ = s.RoomRepo.AddUsersToRoom(created.ID, userIDs)
	}
	return created, nil
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

func (s *RoomService) AddUserToRoom(roomID, userID string) error {
	room, err := s.RoomRepo.GetByID(roomID)
	if err != nil {
		return err
	}

	if _, err := s.UserRepo.FindByID(context.Background(), userID); err != nil {
		return err
	}

	if err := s.RoomRepo.AddUserToRoom(roomID, userID); err != nil {
		return err
	}

	if room.ServerID != nil {
		_ = s.ServerRepo.AddUserToServer(*room.ServerID, userID)
	}

	return nil
}

func (s *RoomService) RemoveUserFromRoom(roomID, userID string) error {
	if _, err := s.RoomRepo.GetByID(roomID); err != nil {
		return err
	}

	if _, err := s.UserRepo.FindByID(context.Background(), userID); err != nil {
		return err
	}

	return s.RoomRepo.RemoveUserFromRoom(roomID, userID)
}

func (s *RoomService) ListMembersByRoom(roomID string) ([]domain.RoomMember, error) {
	if _, err := s.RoomRepo.GetByID(roomID); err != nil {
		return nil, err
	}

	return s.RoomRepo.ListMembersByRoom(roomID)
}
func (s *RoomService) GetMyMembership(roomID, userID string) (domain.MyRoomMembership, error) {
	if _, err := s.RoomRepo.GetByID(roomID); err != nil {
		return domain.MyRoomMembership{}, err
	}

	return s.RoomRepo.GetMyMembership(roomID, userID)
}
func (s *RoomService) UpdateLastRead(roomID, userID, messageID string) error {
	if _, err := s.RoomRepo.GetByID(roomID); err != nil {
		return err
	}

	return s.RoomRepo.UpdateLastRead(roomID, userID, messageID)
}
