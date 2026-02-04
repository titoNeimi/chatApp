package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"chatApp/internal/ports/output"
	"time"
)

type MessageService struct {
	messageRepo output.MessageRepository
}

func NewMessageService(messageRepo output.MessageRepository) *MessageService {
	return &MessageService{messageRepo: messageRepo}
}

func (s *MessageService) Create(cmd input.CreateMessageInput) (domain.Message, error) {
	now := time.Now().UTC()

	message := domain.Message{
		Content:          cmd.Content,
		UserID:           cmd.UserID,
		ReplyToMessageID: cmd.ReplyToMessageID,
		RoomID:           cmd.RoomID,
		CreatedAt:        now,
		UpdatedAt:        now,
	}

	return s.messageRepo.Create(message)
}
func (s *MessageService) SoftDelete(messageID string) error {
	panic("Not implemented")
}
func (s *MessageService) UpdateContent(messageID, newContent string) error {
	panic("Not implemented")
}
func (s *MessageService) ListByRoomID(roomID string) ([]domain.Message, error) {
	panic("Not implemented")
}
func (s *MessageService) ListByUserID(userID string) ([]domain.Message, error) {
	panic("Not implemented")
}
func (s *MessageService) GetByID(messageID string) (domain.Message, error) {
	panic("Not implemented")
}
