package input

import (
	"chatApp/internal/domain"
	"context"
)

type UserStatusService interface {
	SetStatus(ctx context.Context, userID string, status domain.UserStatusType) error
	GetStatus(ctx context.Context, userID string) (*domain.UserStatus, error)
	GetStatusBatch(ctx context.Context, userIDs []string) ([]domain.UserStatus, error)
}
