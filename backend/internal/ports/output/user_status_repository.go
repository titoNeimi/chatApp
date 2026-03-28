package output

import (
	"chatApp/internal/domain"
	"context"
)

type UserStatusRepository interface {
	Upsert(ctx context.Context, status *domain.UserStatus) error
	FindByUserID(ctx context.Context, userID string) (*domain.UserStatus, error)
	FindByUserIDs(ctx context.Context, userIDs []string) ([]domain.UserStatus, error)
}
