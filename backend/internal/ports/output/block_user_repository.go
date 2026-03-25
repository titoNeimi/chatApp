package output

import "chatApp/internal/domain"

type BlockUserRepository interface {
	Block(blockerID, blockedID string) (*domain.BlockedUser, error)
	Unblock(blockerID, blockedID string) error
	IsBlocked(blockerID, blockedID string) (bool, error)
	ListBlockedUsers(blockerID string) ([]domain.BlockedUser, error)
}