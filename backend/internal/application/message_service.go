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
	blockRepo   output.BlockUserRepository
}

func NewMessageService(messageRepo output.MessageRepository, roomRepo output.RoomRepository, blockRepo output.BlockUserRepository) *MessageService {
	return &MessageService{messageRepo: messageRepo, roomRepo: roomRepo, blockRepo: blockRepo}
}

func (s *MessageService) Create(cmd input.CreateMessageInput) (domain.Message, error) {

	room, err := s.roomRepo.GetByID(cmd.RoomID)
	if err != nil {
		return domain.Message{}, err
	}

	if room.Type == domain.DIRECT_MESSAGE {
		members, err := s.roomRepo.ListMembersByRoom(cmd.RoomID)
		if err != nil {
			return domain.Message{}, err
		}

		var otherMember domain.RoomMember
		for _, member := range members {
			if member.UserID == cmd.UserID {
				continue
			}
			otherMember = member
		}

		isBlocked, err := s.blockRepo.IsBlocked(cmd.UserID, otherMember.UserID)
		if err != nil {
			return domain.Message{}, err
		}
		if isBlocked {
			return domain.Message{}, domain.ErrUserIsBlocked
		}
		amBlocked, err := s.blockRepo.IsBlocked(otherMember.UserID, cmd.UserID)
		if err != nil {
			return domain.Message{}, err
		}
		if amBlocked {
			return domain.Message{}, domain.ErrCannotSendMessage
		}
	}

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
