package output

import "chatApp/internal/domain"

type FriendshipRepository interface {
	Create(RequesterID, AddresseeID string) (*domain.Friendship, error)
	GetByID(id string) (*domain.Friendship, error)
	GetBetween(userA, userB string) (*domain.Friendship, error)
	UpdateStatus(id, status string) error
	Delete(id string) error
	ListFriends(userID string) ([]domain.FriendEntry, error)
	ListPendingIncoming(userID string) ([]domain.PendingRequest, error)
}
