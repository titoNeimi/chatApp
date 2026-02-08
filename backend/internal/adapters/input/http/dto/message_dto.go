package dto

import "time"

type MessageCreateRequest struct {
	Content          string  `json:"content" validate:"required,min=1,max=240"`
	ReplyToMessageID *string `json:"reply_to_message_id,omitempty"`
	RoomID           string  `json:"room_id" validate:"required"`
}

type MessageCreateResponse struct {
	ID               string     `json:"id"`
	Content          string     `json:"content"`
	UserID           string     `json:"user_id"`
	ReplyToMessageID *string    `json:"reply_to_message_id,omitempty"`
	RoomID           string     `json:"room_id"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	DeletedAt        *time.Time `json:"deleted_at,omitempty"`
}

type UpdateContentRequest struct {
	Content string `json:"content" validate:"required,min=1,max=240"`
}

type MessageResponse struct {
	ID               string     `json:"id"`
	Content          string     `json:"content"`
	UserID           string     `json:"user_id"`
	ReplyToMessageID *string    `json:"reply_to_message_id,omitempty"`
	RoomID           string     `json:"room_id"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	DeletedAt        *time.Time `json:"deleted_at,omitempty"`
}

type MessageListResponse struct {
	Messages []MessageResponse `json:"messages"`
}
