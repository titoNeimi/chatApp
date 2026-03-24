package dto

import "time"

type SendFriendRequestBody struct {
	UserID string `json:"user_id" validate:"required,uuid"`
}

type FriendRequestResponse struct {
	ID          string    `json:"id"`
	RequesterID string    `json:"requester_id"`
	AddresseeID string    `json:"addressee_id"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type FriendEntryResponse struct {
	FriendshipID string       `json:"friendship_id"`
	User         UserResponse `json:"user"`
	Since        time.Time    `json:"since"`
}

type FriendListResponse struct {
	Friends []FriendEntryResponse `json:"friends"`
}

type PendingRequestResponse struct {
	FriendshipID string       `json:"friendship_id"`
	FromUser     UserResponse `json:"from_user"`
	SentAt       time.Time    `json:"sent_at"`
}

type PendingRequestListResponse struct {
	Requests []PendingRequestResponse `json:"requests"`
}