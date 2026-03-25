package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
)

type blockUserService struct {
	blockRepo  output.BlockUserRepository
	friendRepo output.FriendshipRepository
}

func NewBlockUserService(blockRepo output.BlockUserRepository, friendRepo output.FriendshipRepository) *blockUserService {
	return &blockUserService{blockRepo: blockRepo, friendRepo: friendRepo}
}

func (s *blockUserService) Block(blockerID, blockedID string) (*domain.BlockedUser, error) {

	if blockedID == blockerID {
		return nil, domain.ErrCannotBlockYourself
	}

	if isBlocked, err := s.blockRepo.IsBlocked(blockerID, blockedID); err == nil && isBlocked {
		return nil, domain.ErrAlreadyBlocked
	}

	if friendship, err := s.friendRepo.GetBetween(blockedID, blockerID); err == nil {
		if err := s.friendRepo.Delete(friendship.ID); err != nil {
			return nil, err
		}
	}

	return s.blockRepo.Block(blockerID, blockedID)
}

func (s *blockUserService) Unblock(blockerID, blockedID string) error {
	return s.blockRepo.Unblock(blockerID, blockedID)
}

func (s *blockUserService) IsBlocked(blockerID, blockedID string) (bool, error) {
	return s.blockRepo.IsBlocked(blockerID, blockedID)
}

func (s *blockUserService) ListBlockedUsers(blockerID string) ([]domain.BlockedUser, error) {
	return s.blockRepo.ListBlockedUsers(blockerID)
}
