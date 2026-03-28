package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"context"
	"time"
)

type UserStatusService struct {
	statusRepo output.UserStatusRepository
}

func NewUserStatusService(statusRepo output.UserStatusRepository) *UserStatusService {
	return &UserStatusService{statusRepo: statusRepo}
}

func (s *UserStatusService) SetStatus(ctx context.Context, userID string, status domain.UserStatusType) error {
	// TODO: validate status, build domain.UserStatus, call statusRepo.Upsert
	// TODO: broadcast presence.update event via WS registry to relevant users (friends, shared room members)
	if !domain.IsValidUserStatus(status) {
		return domain.ErrInvalidStatus
	}
	return s.statusRepo.Upsert(ctx, &domain.UserStatus{
		UserID:    userID,
		Status:    status,
		UpdatedAt: time.Now(),
	})
}

func (s *UserStatusService) GetStatus(ctx context.Context, userID string) (*domain.UserStatus, error) {
	// TODO: if status row doesn't exist yet, return a default "online" status rather than an error
	return s.statusRepo.FindByUserID(ctx, userID)
}

func (s *UserStatusService) GetStatusBatch(ctx context.Context, userIDs []string) ([]domain.UserStatus, error) {
	// TODO: handle empty userIDs slice early
	return s.statusRepo.FindByUserIDs(ctx, userIDs)
}
