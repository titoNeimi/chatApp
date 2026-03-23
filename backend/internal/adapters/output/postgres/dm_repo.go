package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"context"
	"errors"

	"gorm.io/gorm"
)

type DMRepo struct {
	db *gorm.DB
}

func NewDMRepo(db *gorm.DB) *DMRepo {
	return &DMRepo{db: db}
}

func (r *DMRepo) FindDMChannel(ctx context.Context, user1ID, user2ID string) (*domain.DMChannel, error) {
	var channel models.DirectMessageChannel

	err := r.db.WithContext(ctx).First(&channel, "(user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)", user1ID, user2ID).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrDMChannelNotFound
		}
		return nil, err
	}

	return channel.ToDomain(), nil
}

func (r *DMRepo) CreateDMChannel(ctx context.Context, user1ID, user2ID string) (*domain.DMChannel, error) {
	var channel models.DirectMessageChannel

	if user2ID < user1ID {
		user1ID, user2ID = user2ID, user1ID
	}

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		room := models.Room{Type: domain.DIRECT_MESSAGE}
		if err := tx.Create(&room).Error; err != nil {
			return err
		}

		if err := tx.Create(&models.RoomUsers{RoomID: room.ID, UserID: user1ID}).Error; err != nil {
			return err
		}
		if err := tx.Create(&models.RoomUsers{RoomID: room.ID, UserID: user2ID}).Error; err != nil {
			return err
		}

		channel = models.DirectMessageChannel{
			User1ID: user1ID,
			User2ID: user2ID,
			RoomID:  room.ID,
		}
		return tx.Create(&channel).Error
	})
	if err != nil {
		return nil, err
	}

	return channel.ToDomain(), nil
}

func (r *DMRepo) ListDMChannelsByUser(ctx context.Context, userID string) ([]domain.DMChannel, error) {
	var channels []models.DirectMessageChannel

	err := r.db.WithContext(ctx).Find(&channels, "user1_id = $1 OR user2_id = $1", userID).Error
	if err != nil {
		return nil, err
	}

	out := make([]domain.DMChannel, 0, len(channels))
	for _, dm := range channels {
		out = append(out, *dm.ToDomain())
	}

	return out, err
}
