package domain

type RoomMember struct {
	UserID   string
	Username string
	Roles    []ServerRole
}

type MyRoomMembership struct {
	UserID            string
	LastReadMessageID *string
}