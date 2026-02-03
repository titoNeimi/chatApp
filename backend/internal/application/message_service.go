package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
)

type MessageService struct {
	messageRepo output.MessageRepository
}

func NewMessageService(messageRepo output.MessageRepository) *MessageService {
	return &MessageService{messageRepo: messageRepo}
}

func (s *MessageService) Create(message domain.Message) (domain.Message, error) {
	panic("Not implemented")
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
