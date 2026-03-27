package domain

import "time"

const (
	PermDeleteMessages = "can_delete_messages"
	PermMuteMembers    = "can_mute_members"
	PermManageMembers  = "can_manage_members"
	PermManageRooms    = "can_manage_rooms"
	PermSendMessages   = "can_send_messages"
)

type ServerRole struct {
	ID                string
	ServerID          string
	Name              string
	CanDeleteMessages bool
	CanMuteMembers    bool
	CanManageMembers  bool
	CanManageRooms    bool
	CanSendMessages   bool
	DisplaySeparately bool
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type ServerUserRole struct {
	ServerID string
	UserID   string
	RoleID   string
}

type UserWithRoles struct {
	UserID   string
	Username string
	Roles    []ServerRole
}
