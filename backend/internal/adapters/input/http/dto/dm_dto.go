package dto

import "time"

type DMCreateRequest struct {
	TargetUserID string `json:"target_user_id" validate:"required,uuid"`
}

type DMChannelResponse struct {
	ID        string     `json:"id"`
	User1ID   string     `json:"user1_id"`
	User2ID   string     `json:"user2_id"`
	RoomID    string     `json:"room_id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

type DMChannelListResponse struct {
	Channels []DMChannelResponse `json:"channels"`
}
