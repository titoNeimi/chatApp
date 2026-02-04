package input

import "chatApp/internal/domain"

type RoomService interface {
	Create(room domain.Room) (domain.Room, error)
	CreateForServer(room domain.Room) (domain.Room, error)
	Update(room domain.Room) (domain.Room, error)
	UpdateInServer(room domain.Room, serverID, roomID string) (domain.Room, error)
	GetByID(roomID string) (domain.Room, error)
	SoftDelete(roomID string) error
	SoftDeleteInServer(roomID, serverID string) error
	ListByServer(serverID string) ([]domain.Room, error)
}
