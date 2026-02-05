package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"

	"gorm.io/gorm"
)

type RoomRepo struct {
	db *gorm.DB
}

func NewRoomRepo(db *gorm.DB) *RoomRepo {
	return &RoomRepo{db: db}
}

func (r *RoomRepo) Create(room domain.Room) (domain.Room, error) {
	model := models.RoomFromDomain(&room)
	if model == nil {
		return domain.Room{}, nil
	}
	if err := r.db.Omit("ID").Create(model).Error; err != nil {
		return domain.Room{}, err
	}
	created := model.ToDomain()
	if created == nil {
		return domain.Room{}, nil
	}
	return *created, nil
}
func (r *RoomRepo) Update(roomID string, updates map[string]interface{}) (domain.Room, error) {
	if len(updates) == 0 {
		return r.GetByID(roomID)
	}

	if err := r.db.Model(&models.Room{}).Where("id = ?", roomID).Updates(updates).Error; err != nil {
		return domain.Room{}, err
	}

	return r.GetByID(roomID)
}
func (r *RoomRepo) GetByID(roomID string) (domain.Room, error) {
	var model models.Room

	if err := r.db.First(&model, "id = ?", roomID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Room{}, domain.ErrRoomNotFound
		}
		return domain.Room{}, err
	}

	return *model.ToDomain(), nil

}
func (r *RoomRepo) SoftDelete(roomID string) error {
	panic("not implemented")
}
