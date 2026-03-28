package dto

import "time"

type SetStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=online away invisible"`
}

type UserStatusResponse struct {
	UserID    string    `json:"user_id"`
	Status    string    `json:"status"`
	UpdatedAt time.Time `json:"updated_at"`
}
