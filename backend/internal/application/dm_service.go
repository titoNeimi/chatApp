package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"context"
	"errors"
)

type DMService struct {
	dmRepo output.DmChannelRepository
}

func NewDmService(dmRepo output.DmChannelRepository) *DMService {
	return &DMService{dmRepo: dmRepo}
}

func (s *DMService) FindOrCreateDMChannel(ctx context.Context, requesterID, targetID string) (*domain.DMChannel, error) {
	if requesterID == targetID {
		return nil, domain.ErrDMYourself
	}

	channel, err := s.dmRepo.FindDMChannel(ctx, requesterID, targetID)
	if err == nil {
		return channel, nil
	}

	if !errors.Is(err, domain.ErrDMChannelNotFound) {
		return nil, err
	}

	return s.dmRepo.CreateDMChannel(ctx, requesterID, targetID)
}

func (s *DMService) ListDMChannelsForUser(ctx context.Context, userID string) ([]domain.DMChannel, error) {
	return s.dmRepo.ListDMChannelsByUser(ctx, userID)
}
