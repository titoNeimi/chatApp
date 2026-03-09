package domain

import "encoding/json"

type RoomMember struct {
	UserID   string
	Username string
}

type MyRoomMembership struct {
	UserID            string
	LastReadMessageID *string
	IsMuted           bool
	Permissions       json.RawMessage
}
