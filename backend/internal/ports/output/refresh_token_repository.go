package output

import (
	"chatApp/internal/domain"
	"context"
)

type RefreshTokenRepository interface {
	Create(ctx context.Context, refreshSession *domain.RefreshSession) error
	FindByID(ctx context.Context, id string) (*domain.RefreshSession, error)
	RevokeByID(ctx context.Context, id string) error
	// TODO: RevokeAllByUserID(ctx context.Context, userID string) error — needed for "sign out from all devices" in settings
	Rotate(ctx context.Context, oldTokenID string, newSession *domain.RefreshSession) error
}
