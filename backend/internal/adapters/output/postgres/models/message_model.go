package models

import (
	"chatApp/internal/domain"
	"time"

	"gorm.io/gorm"
)

type Message struct {
	ID               string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;not null"`
	Content          string `gorm:"not null"`
	UserID           string         `gorm:"type:uuid;index;not null"`
	User             User           `gorm:"foreignKey:UserID;references:ID"`
	ReplyToMessageID *string        `gorm:"type:uuid;column:reply_to_message_id;index"`
	ReplyTo          *Message       `gorm:"foreignKey:ReplyToMessageID;references:ID"`
	RoomID           string         `gorm:"type:uuid;index;not null"`
	Room             Room           `gorm:"foreignKey:RoomID;references:ID"`
	CreatedAt        time.Time      `gorm:"column:created_at;not null"`
	UpdatedAt        time.Time      `gorm:"column:updated_at;not null"`
	DeletedAt        gorm.DeletedAt `gorm:"index"`
}

func (Message) TableName() string {
	return "messages"
}

func MessageFromDomain(message *domain.Message) *Message {
	if message == nil {
		return nil
	}
	model := &Message{
		ID:               message.ID,
		Content:          message.Content,
		UserID:           message.UserID,
		ReplyToMessageID: message.ReplyToMessageID,
		RoomID:           message.RoomID,
		CreatedAt:        message.CreatedAt,
		UpdatedAt:        message.UpdatedAt,
	}
	if message.DeletedAt != nil {
		model.DeletedAt = gorm.DeletedAt{Time: *message.DeletedAt, Valid: true}
	}
	return model
}

func (m *Message) ToDomain() *domain.Message {
	if m == nil {
		return nil
	}
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deleted := m.DeletedAt.Time
		deletedAt = &deleted
	}
	return &domain.Message{
		ID:               m.ID,
		Content:          m.Content,
		UserID:           m.UserID,
		ReplyToMessageID: m.ReplyToMessageID,
		RoomID:           m.RoomID,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
		DeletedAt:        deletedAt,
	}
}
