package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"

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
func (r *RoomRepo) Update(room domain.Room) (domain.Room, error) {
	panic("not implemented")
}
func (r *RoomRepo) GetByID(roomID string) (domain.Room, error) {
	panic("not implemented")
}
func (r *RoomRepo) SoftDelete(roomID string) error {
	panic("not implemented")
}
