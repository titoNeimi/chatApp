package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"

	"gorm.io/gorm"
)

type BlockUserRepo struct {
	db *gorm.DB
}

func NewBlockUserRepo(db *gorm.DB) *BlockUserRepo {
	return &BlockUserRepo{db: db}
}

func (r *BlockUserRepo) Block(blockerID, blockedID string) (*domain.BlockedUser, error) {

	blockedUser := models.BlockedUser{
		BlockerID:     blockerID,
		BlockedUserID: blockedID,
	}

	err := r.db.Create(&blockedUser).Error
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, domain.ErrAlreadyBlocked
		}
		return nil, err
	}

	return blockedUser.ToDomain(), nil
}

func (r *BlockUserRepo) Unblock(blockerID, blockedID string) error {
	result := r.db.Delete(&models.BlockedUser{}, "blocker_id = ? AND blocked_user_id = ?", blockerID, blockedID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrNotBlocked
	}
	return nil
}

func (r *BlockUserRepo) IsBlocked(blockerID, blockedID string) (bool, error) {
	var count int64

	err := r.db.Model(&models.BlockedUser{}).
		Where("blocker_id = ? AND blocked_user_id = ? AND deleted_at IS NULL", blockerID, blockedID).
		Count(&count).Error

	if err != nil {
		return false, err
	}

	if count >= 1 {
		return true, nil
	}

	return false, nil
}

func (r *BlockUserRepo) ListBlockedUsers(blockerID string) ([]domain.BlockedUser, error) {
	var blockedUsers []models.BlockedUser

	err := r.db.Find(&blockedUsers, "blocker_id = ? AND deleted_at IS NULL", blockerID).Error
	if err != nil {
		return nil, err
	}

	out := make([]domain.BlockedUser, 0, len(blockedUsers))
	for _, b := range blockedUsers {
		out = append(out, *b.ToDomain())
	}
	return out, nil
}
