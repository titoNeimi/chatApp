package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"
	"time"

	"gorm.io/gorm"
)

type messageRepo struct {
	db *gorm.DB
}

func NewMessageRepo(db *gorm.DB) *messageRepo {
	return &messageRepo{db: db}
}

func (r *messageRepo) Create(message domain.Message) (domain.Message, error) {
	model := models.MessageFromDomain(&message)
	if model == nil {
		return domain.Message{}, nil
	}
	if err := r.db.Omit("ID").Create(model).Error; err != nil {
		return domain.Message{}, err
	}
	created := model.ToDomain()
	if created == nil {
		return domain.Message{}, nil
	}
	return *created, nil
}
func (r *messageRepo) SoftDelete(messageID string) error {
	panic("not implemented")
}
func (r *messageRepo) UpdateContent(messageID, newContent string) error {

	result := r.db.Model(&models.Message{}).Where("id = ?", messageID).Updates(map[string]interface{}{
		"content":    newContent,
		"updated_at": time.Now().UTC(),
	})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return domain.ErrMessageNotFound
	}

	return nil
}
func (r *messageRepo) ListByRoomID(roomID string) ([]domain.Message, error) {
	var messages []models.Message

	if err := r.db.Find(&messages, "room_id = ?", roomID).Error; err != nil {
		return nil, err
	}

	messageDomain := make([]domain.Message, 0, len(messages))
	for _, mess := range messages {
		messageDomain = append(messageDomain, *mess.ToDomain())
	}

	return messageDomain, nil
}
func (r *messageRepo) ListByUserID(userID string) ([]domain.Message, error) {
	panic("not implemented")
}
func (r *messageRepo) GetByID(messageID string) (domain.Message, error) {
	var message models.Message

	if err := r.db.First(&message, "id = ?", messageID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Message{}, domain.ErrMessageNotFound
		}
		return domain.Message{}, err
	}
	return *message.ToDomain(), nil
}
