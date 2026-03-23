package output

import (
	"chatApp/internal/domain"
	"context"
)

type DmChannelRepository interface {
	FindDMChannel(ctx context.Context, user1ID, user2ID string) (*domain.DMChannel, error)
	CreateDMChannel(ctx context.Context, user1ID, user2ID string) (*domain.DMChannel, error)
	ListDMChannelsByUser(ctx context.Context, userID string) ([]domain.DMChannel, error)
}
