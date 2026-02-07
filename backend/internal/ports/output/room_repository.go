package output

import "chatApp/internal/domain"

type RoomRepository interface {
	Create(room domain.Room) (domain.Room, error)
	Update(roomID string, updates map[string]interface{}) (domain.Room, error)
	GetByID(roomID string) (domain.Room, error)
	SoftDelete(roomID string) error
	ListByServer(serverID string) ([]domain.Room, error)
	AddUserToRoom(roomID, userID string) error
	RemoveUserFromRoom(roomID, userID string) error
}
