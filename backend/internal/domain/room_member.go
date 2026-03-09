package domain

type RoomMember struct {
	UserID   string
	Username string
}

type MyRoomMembership struct {
	UserID            string
	LastReadMessageID *string
}