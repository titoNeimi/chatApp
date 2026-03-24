package domain

import "time"

const (
	FriendshipPending  = "pending"
	FriendshipAccepted = "accepted"
)

type Friendship struct {
	ID          string
	RequesterID string
	AddresseeID string
	Status      string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type FriendEntry struct {
	FriendshipID string
	Friend       User
	Since        time.Time
}

type PendingRequest struct {
	FriendshipID string
	FromUser     User
	SentAt       time.Time
}
