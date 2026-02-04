package dto

import "time"

type ServerCreateRequest struct {
	Name        string  `json:"name" validate:"required,min=3"`
	Description *string `json:"description,omitempty"`
}

type ServerUpdateRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=3"`
	Description *string `json:"description,omitempty"`
}

type ServerCreateResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	RoomIDs     []string   `json:"room_ids,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type ServerUpdateResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	RoomIDs     []string   `json:"room_ids,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type ServerResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	RoomIDs     []string   `json:"room_ids,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}
