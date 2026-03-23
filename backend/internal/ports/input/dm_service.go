package input

import (
	"chatApp/internal/domain"
	"context"
)

type DMService interface {
	FindOrCreateDMChannel(ctx context.Context, requesterID, targetID string) (*domain.DMChannel, error)
	ListDMChannelsForUser(ctx context.Context, userID string) ([]domain.DMChannel, error)
}
