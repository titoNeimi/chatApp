package output

import "chatApp/internal/domain"

type RoomRepository interface {
	Create(room domain.Room) (domain.Room, error)
	Update(room domain.Room) (domain.Room, error)
	GetByID(roomID string) (domain.Room, error)
	SoftDelete(roomID string) error
}
