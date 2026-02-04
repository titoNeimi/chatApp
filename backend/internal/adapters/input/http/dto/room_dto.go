package dto

import "time"

type RoomCreateRequest struct {
	Name        string  `json:"name" validate:"required,min=3"`
	Description *string `json:"description,omitempty"`
}

type RoomUpdateRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=3"`
	Description *string `json:"description,omitempty"`
}

type RoomCreateResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	Type        string     `json:"type"`
	ServerID    *string    `json:"server_id,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type RoomUpdateResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	Type        string     `json:"type"`
	ServerID    *string    `json:"server_id,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type RoomResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	Type        string     `json:"type"`
	ServerID    *string    `json:"server_id,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type RoomListResponse struct {
	Rooms []RoomResponse `json:"rooms"`
}
