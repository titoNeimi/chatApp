package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"context"
	"errors"
	"time"

	"gorm.io/gorm"
)

type RefreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) output.RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

func (r *RefreshTokenRepository) Create(ctx context.Context, refreshSession *domain.RefreshSession) error {
	if refreshSession == nil {
		return nil
	}

	model := models.RefreshTokenFromDomain(refreshSession)
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return err
	}
	*refreshSession = *model.ToDomain()
	return nil
}

func (r *RefreshTokenRepository) FindByID(ctx context.Context, id string) (*domain.RefreshSession, error) {
	var refreshToken models.RefreshToken
	if err := r.db.WithContext(ctx).First(&refreshToken, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrRefreshTokenNotFound
		}
		return nil, err
	}
	return refreshToken.ToDomain(), nil
}

func (r *RefreshTokenRepository) RevokeByID(ctx context.Context, id string) error {
	now := time.Now().UTC()
	result := r.db.WithContext(ctx).
		Model(&models.RefreshToken{}).
		Where("id = ? AND revoked_at IS NULL", id).
		Update("revoked_at", now)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		var refreshToken models.RefreshToken
		err := r.db.WithContext(ctx).First(&refreshToken, "id = ?", id).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.ErrRefreshTokenNotFound
		}
		if err != nil {
			return err
		}
		return domain.ErrRefreshTokenRevoked
	}

	return nil
}

func (r *RefreshTokenRepository) Rotate(ctx context.Context, oldTokenID string, newSession *domain.RefreshSession) error {
	if newSession == nil {
		return nil
	}

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		now := time.Now().UTC()
		revokeResult := tx.Model(&models.RefreshToken{}).
			Where("id = ? AND revoked_at IS NULL", oldTokenID).
			Update("revoked_at", now)
		if revokeResult.Error != nil {
			return revokeResult.Error
		}
		if revokeResult.RowsAffected == 0 {
			var existing models.RefreshToken
			err := tx.First(&existing, "id = ?", oldTokenID).Error
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return domain.ErrRefreshTokenNotFound
			}
			if err != nil {
				return err
			}
			return domain.ErrRefreshTokenRevoked
		}

		model := models.RefreshTokenFromDomain(newSession)
		if err := tx.Create(model).Error; err != nil {
			return err
		}

		*newSession = *model.ToDomain()
		return nil
	})
}
