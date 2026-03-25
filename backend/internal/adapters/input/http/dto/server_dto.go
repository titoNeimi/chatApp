package dto

import "time"

type ServerCreateRequest struct {
	Name        string  `json:"name" validate:"required,min=3"`
	Description *string `json:"description,omitempty"`
	IsPrivate   bool    `json:"is_private"`
}

type ServerUpdateRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=3"`
	Description *string `json:"description,omitempty"`
	IsPrivate   *bool   `json:"is_private,omitempty"`
}

type ServerCreateResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	RoomIDs     []string   `json:"room_ids,omitempty"`
	IsPrivate   bool       `json:"is_private"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type ServerUpdateResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	RoomIDs     []string   `json:"room_ids,omitempty"`
	IsPrivate   bool       `json:"is_private"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type ServerStatsResponse struct {
	MemberCount int `json:"member_count"`
	RoomCount   int `json:"room_count"`
	RoleCount   int `json:"role_count"`
}

type ServerResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	RoomIDs     []string   `json:"room_ids,omitempty"`
	IsPrivate   bool       `json:"is_private"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type TrendingServerResponse struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Description    *string   `json:"description,omitempty"`
	IsPrivate      bool      `json:"is_private"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	MemberCount    int       `json:"member_count"`
	RecentMessages int       `json:"recent_messages"`
	ActiveUsers    int       `json:"active_users"`
	TrendScore     int       `json:"trend_score"`
}
