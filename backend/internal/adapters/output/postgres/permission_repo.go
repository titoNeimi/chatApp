package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"

	"gorm.io/gorm"
)

type PermissionRepo struct {
	db *gorm.DB
}

func NewPermissionRepo(db *gorm.DB) *PermissionRepo {
	return &PermissionRepo{db: db}
}

func (r *PermissionRepo) UpsertOverride(override domain.RoomPermissionOverride) (domain.RoomPermissionOverride, error) {
	model := models.RoomPermissionOverrideFromDomain(&override)

	var result *gorm.DB
	if override.ID != "" {
		result = r.db.Save(model)
	} else {
		result = r.db.Omit("ID").Create(model)
	}

	if result.Error != nil {
		return domain.RoomPermissionOverride{}, result.Error
	}

	return *model.ToDomain(), nil
}

func (r *PermissionRepo) DeleteOverride(overrideID string) error {
	result := r.db.Delete(&models.RoomPermissionOverrides{}, "id = ?", overrideID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrPermissionOverrideNotFound
	}
	return nil
}

func (r *PermissionRepo) ListOverridesByRoom(roomID string) ([]domain.RoomPermissionOverride, error) {
	var rows []models.RoomPermissionOverrides
	if err := r.db.Find(&rows, "room_id = ?", roomID).Error; err != nil {
		return nil, err
	}

	out := make([]domain.RoomPermissionOverride, 0, len(rows))
	for _, row := range rows {
		out = append(out, *row.ToDomain())
	}
	return out, nil
}

func (r *PermissionRepo) GetUserOverrideForRoom(roomID, userID string) (*domain.RoomPermissionOverride, error) {
	var row models.RoomPermissionOverrides
	result := r.db.First(&row, "room_id = ? AND user_id = ?", roomID, userID)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return row.ToDomain(), nil
}

func (r *PermissionRepo) GetRoleOverridesForRoom(roomID string, roleIDs []string) ([]domain.RoomPermissionOverride, error) {
	if len(roleIDs) == 0 {
		return nil, nil
	}

	var rows []models.RoomPermissionOverrides
	if err := r.db.Find(&rows, "room_id = ? AND role_id IN ?", roomID, roleIDs).Error; err != nil {
		return nil, err
	}

	out := make([]domain.RoomPermissionOverride, 0, len(rows))
	for _, row := range rows {
		out = append(out, *row.ToDomain())
	}
	return out, nil
}
