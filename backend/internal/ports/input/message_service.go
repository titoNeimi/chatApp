package input

import "chatApp/internal/domain"

type CreateMessageInput struct {
	Content          string
	UserID           string
	ReplyToMessageID *string
	RoomID           string
}

type MessageService interface {
	Create(input CreateMessageInput) (domain.Message, error)
	SoftDelete(messageID string) error
	UpdateContent(messageID, newContent string) error
	ListByRoomID(roomID string) ([]domain.Message, error)
	ListByUserID(userID string) ([]domain.Message, error)
	GetByID(messageID string) (domain.Message, error)
}
