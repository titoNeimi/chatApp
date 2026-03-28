package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type UserStatusRepo struct {
	db *gorm.DB
}

func NewUserStatusRepo(db *gorm.DB) *UserStatusRepo {
	return &UserStatusRepo{db: db}
}

func (r *UserStatusRepo) Upsert(ctx context.Context, status *domain.UserStatus) error {
	// TODO: implement upsert using gorm clause.OnConflict to insert or update on user_id conflict
	model := models.UserStatusFromDomain(status)
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"status", "updated_at"}),
	}).Create(model).Error
}

func (r *UserStatusRepo) FindByUserID(ctx context.Context, userID string) (*domain.UserStatus, error) {
	// TODO: implement find by user_id, return domain.ErrUserNotFound if not found
	_ = ctx
	_ = userID
	return nil, nil
}

func (r *UserStatusRepo) FindByUserIDs(ctx context.Context, userIDs []string) ([]domain.UserStatus, error) {
	// TODO: implement batch find by user_ids using WHERE user_id IN (...)
	_ = ctx
	_ = userIDs
	return nil, nil
}
