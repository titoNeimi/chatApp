package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"chatApp/internal/ports/output"
	"slices"
	"time"
)

type MessageService struct {
	messageRepo output.MessageRepository
	roomRepo    output.RoomRepository
}

func NewMessageService(messageRepo output.MessageRepository, roomRepo output.RoomRepository) *MessageService {
	return &MessageService{messageRepo: messageRepo, roomRepo: roomRepo}
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
	return s.messageRepo.SoftDelete(messageID)
}
func (s *MessageService) UpdateContent(messageID, newContent string) error {
	return s.messageRepo.UpdateContent(messageID, newContent)
}
func (s *MessageService) ListByRoomID(roomID string, limit int, before *time.Time) ([]domain.Message, bool, error) {
	if _, err := s.roomRepo.GetByID(roomID); err != nil {
		return nil, false, err
	}

	messages, err := s.messageRepo.ListByRoomID(roomID, limit+1, before)
	if err != nil {
		return nil, false, err
	}

	hasMore := len(messages) > limit
	if hasMore {
		messages = messages[:limit]
	}

	slices.Reverse(messages)

	return messages, hasMore, nil
}
func (s *MessageService) ListByUserID(userID string) ([]domain.Message, error) {
	return s.messageRepo.ListByUserID(userID)
}
func (s *MessageService) GetByID(messageID string) (domain.Message, error) {
	return s.messageRepo.GetByID(messageID)
}
