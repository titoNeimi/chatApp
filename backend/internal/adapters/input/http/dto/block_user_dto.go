package dto

import "time"

type BlockUserBody struct {
	UserID string `json:"user_id" validate:"required,uuid"`
}

type BlockedUserResponse struct {
	BlockedUserID string    `json:"blocked_user_id"`
	CreatedAt     time.Time `json:"created_at"`
}