package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"errors"
)

type friendService struct {
	friendRepo output.FriendshipRepository
	blockRepo  output.BlockUserRepository
}

func NewFriendService(friendRepo output.FriendshipRepository, blockRepo output.BlockUserRepository) *friendService {
	return &friendService{friendRepo: friendRepo, blockRepo: blockRepo}
}

func (s *friendService) SendRequest(requesterID, addresseeID string) (*domain.Friendship, error) {
	if requesterID == addresseeID {
		return nil, domain.ErrCannotFriendYourself
	}

	_, err := s.friendRepo.GetBetween(requesterID, addresseeID)
	if err == nil {
		return nil, domain.ErrAlreadyFriends
	}
	if !errors.Is(err, domain.ErrFriendshipNotFound) {
		return nil, err
	}

	isBlocked, err := s.blockRepo.IsBlocked(requesterID, addresseeID)
	if err != nil {
		return nil, err
	}
	if isBlocked {
		return nil, domain.ErrUserIsBlocked
	}
	amBlocked, err := s.blockRepo.IsBlocked(addresseeID, requesterID)
	if err != nil {
		return nil, err
	}
	if amBlocked {
		return nil, domain.ErrCannotSendFriendRequest
	}

	return s.friendRepo.Create(requesterID, addresseeID)
}
func (s *friendService) AcceptRequest(friendshipID, addresseeID string) error {
	f, err := s.friendRepo.GetByID(friendshipID)
	if err != nil {
		return err
	}

	if f.AddresseeID != addresseeID {
		return domain.ErrNotYourFriendRequest
	}

	if f.Status != domain.FriendshipPending {
		return domain.ErrAlreadyFriends
	}

	return s.friendRepo.UpdateStatus(friendshipID, domain.FriendshipAccepted)
}
func (s *friendService) DeclineRequest(friendshipID, addresseeID string) error {
	f, err := s.friendRepo.GetByID(friendshipID)
	if err != nil {
		return err
	}

	if f.AddresseeID != addresseeID {
		return domain.ErrNotYourFriendRequest
	}

	if f.Status != domain.FriendshipPending {
		return domain.ErrAlreadyFriends
	}

	return s.friendRepo.Delete(friendshipID)
}

// Also you can cancell the friend request
func (s *friendService) RemoveFriend(userID, friendshipID string) error {
	f, err := s.friendRepo.GetByID(friendshipID)
	if err != nil {
		return err
	}

	if f.AddresseeID != userID && f.RequesterID != userID {
		return domain.ErrNotYourFriend
	}

	return s.friendRepo.Delete(f.ID)
}

func (s *friendService) ListFriends(userID string) ([]domain.FriendEntry, error) {
	return s.friendRepo.ListFriends(userID)
}

func (s *friendService) ListPendingIncoming(userID string) ([]domain.PendingRequest, error) {
	return s.friendRepo.ListPendingIncoming(userID)
}
