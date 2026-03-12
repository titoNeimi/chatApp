package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"

	"gorm.io/gorm"
)

type ServerBanRepo struct {
	db *gorm.DB
}

func NewServerBanRepo(db *gorm.DB) *ServerBanRepo {
	return &ServerBanRepo{db: db}
}

func (r *ServerBanRepo) BanUser(ban domain.ServerBan) (domain.ServerBan, error) {
	banModel := models.ServerBanFromDomain(&ban)
	result := r.db.Create(&banModel)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
			return domain.ServerBan{}, domain.ErrUserAlreadyBanned
		}
		return domain.ServerBan{}, result.Error
	}
	return *banModel.ToDomain(), nil
}

func (r *ServerBanRepo) UnbanUser(serverID, userID string) error {
	result := r.db.Delete(&models.ServerBan{}, "server_id = ? AND user_id = ?", serverID, userID)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return domain.ErrServerBanNotFound
	}

	return nil
}

func (r *ServerBanRepo) GetBan(serverID, userID string) (*domain.ServerBan, error) {
	var serverBan models.ServerBan

	err := r.db.First(&serverBan, "server_id = ? AND user_id = ?", serverID, userID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrServerBanNotFound
		}
		return nil, err
	}
	return serverBan.ToDomain(), nil
}

func (r *ServerBanRepo) ListBansByServer(serverID string) ([]domain.ServerBan, error) {
	var rows []models.ServerBan

	if err := r.db.Find(&rows, "server_id = ?", serverID).Error; err != nil {
		return nil, err
	}

	out := make([]domain.ServerBan, 0, len(rows))
	for _, ban := range rows {
		out = append(out, *ban.ToDomain())
	}
	return out, nil
}
func (r *ServerBanRepo) IsUserBanned(serverID, userID string) (bool, error) {
	var count int64
	err := r.db.Model(&models.ServerBan{}).
		Where("server_id = ? AND user_id = ?", serverID, userID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
