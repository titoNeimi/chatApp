package input

import "chatApp/internal/domain"

type MessageService interface {
	Create(message domain.Message) (domain.Message, error)
	SoftDelete(messageID string) error
	UpdateContent(messageID, newContent string) error
	ListByRoomID(roomID string) ([]domain.Message, error)
	ListByUserID(userID string) ([]domain.Message, error)
	GetByID(messageID string) (domain.Message, error)
}
