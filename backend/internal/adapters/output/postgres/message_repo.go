package postgres

import (
	"chatApp/internal/domain"
	"gorm.io/gorm"
)

type messageRepo struct {
	db *gorm.DB
}

func NewMessageRepo(db *gorm.DB) *messageRepo {
	return &messageRepo{db: db}
}

func (r *messageRepo) Create(message domain.Message) (domain.Message, error) {
	panic("not implemented")
}
func (r *messageRepo) SoftDelete(messageID string) error {
	panic("not implemented")
}
func (r *messageRepo) UpdateContent(messageID, newContent string) error {
	panic("not implemented")
}
func (r *messageRepo) ListByRoomID(roomID string) ([]domain.Message, error) {
	panic("not implemented")
}
func (r *messageRepo) ListByUserID(userID string) ([]domain.Message, error) {
	panic("not implemented")
}
func (r *messageRepo) GetByID(messageID string) (domain.Message, error) {
	panic("not implemented")
}
