package domain

import "time"

type RoomPermissionOverride struct {
	ID                string
	RoomID            string
	RoleID            *string
	UserID            *string
	CanDeleteMessages *bool
	CanMuteMembers    *bool
	CanManageMembers  *bool
	CanManageRooms    *bool
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
