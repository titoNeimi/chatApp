package input

import "chatApp/internal/domain"

type FriendService interface {
	SendRequest(requesterID, addresseeID string) (*domain.Friendship, error)
	AcceptRequest(friendshipID, addresseeID string) error
	DeclineRequest(friendshipID, addresseeID string) error
	RemoveFriend(userID, friendshipID string) error
	ListFriends(userID string) ([]domain.FriendEntry, error)
	ListPendingIncoming(userID string) ([]domain.PendingRequest, error)
}
