package dto

import "time"

// --- Server Role ---

type CreateRoleRequest struct {
	Name              string `json:"name" validate:"required,min=1"`
	CanDeleteMessages bool   `json:"can_delete_messages"`
	CanMuteMembers    bool   `json:"can_mute_members"`
	CanManageMembers  bool   `json:"can_manage_members"`
	CanManageRooms    bool   `json:"can_manage_rooms"`
	CanSendMessages   bool   `json:"can_send_messages"`
	DisplaySeparately bool   `json:"display_separately"`
}

type UpdateRoleRequest struct {
	Name              *string `json:"name,omitempty" validate:"omitempty,min=1"`
	CanDeleteMessages *bool   `json:"can_delete_messages,omitempty"`
	CanMuteMembers    *bool   `json:"can_mute_members,omitempty"`
	CanManageMembers  *bool   `json:"can_manage_members,omitempty"`
	CanManageRooms    *bool   `json:"can_manage_rooms,omitempty"`
	CanSendMessages   *bool   `json:"can_send_messages,omitempty"`
	DisplaySeparately *bool   `json:"display_separately,omitempty"`
}

type RoleResponse struct {
	ID                string    `json:"id"`
	ServerID          string    `json:"server_id"`
	Name              string    `json:"name"`
	CanDeleteMessages bool      `json:"can_delete_messages"`
	CanMuteMembers    bool      `json:"can_mute_members"`
	CanManageMembers  bool      `json:"can_manage_members"`
	CanManageRooms    bool      `json:"can_manage_rooms"`
	CanSendMessages   bool      `json:"can_send_messages"`
	DisplaySeparately bool      `json:"display_separately"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// --- Role Assignment ---

type AssignRoleRequest struct {
	UserID string `json:"user_id" validate:"required"`
	RoleID string `json:"role_id" validate:"required"`
}

// --- Ban ---

type BanUserRequest struct {
	UserID string  `json:"user_id" validate:"required"`
	Reason *string `json:"reason,omitempty"`
}

type BanResponse struct {
	ID       string    `json:"id"`
	ServerID string    `json:"server_id"`
	UserID   string    `json:"user_id"`
	BannedBy string    `json:"banned_by"`
	Reason   *string   `json:"reason,omitempty"`
	BannedAt time.Time `json:"banned_at"`
}

// --- Effective Permissions ---

type EffectivePermissionsResponse struct {
	CanDeleteMessages bool `json:"can_delete_messages"`
	CanMuteMembers    bool `json:"can_mute_members"`
	CanManageMembers  bool `json:"can_manage_members"`
	CanManageRooms    bool `json:"can_manage_rooms"`
	CanSendMessages   bool `json:"can_send_messages"`
}

// --- Room Permission Override ---

type UpsertOverrideRequest struct {
	RoleID            *string `json:"role_id,omitempty"`
	UserID            *string `json:"user_id,omitempty"`
	CanDeleteMessages *bool   `json:"can_delete_messages,omitempty"`
	CanMuteMembers    *bool   `json:"can_mute_members,omitempty"`
	CanManageMembers  *bool   `json:"can_manage_members,omitempty"`
	CanManageRooms    *bool   `json:"can_manage_rooms,omitempty"`
	CanSendMessages   *bool   `json:"can_send_messages,omitempty"`
}

type OverrideResponse struct {
	ID                string    `json:"id"`
	RoomID            string    `json:"room_id"`
	RoleID            *string   `json:"role_id,omitempty"`
	UserID            *string   `json:"user_id,omitempty"`
	CanDeleteMessages *bool     `json:"can_delete_messages,omitempty"`
	CanMuteMembers    *bool     `json:"can_mute_members,omitempty"`
	CanManageMembers  *bool     `json:"can_manage_members,omitempty"`
	CanManageRooms    *bool     `json:"can_manage_rooms,omitempty"`
	CanSendMessages   *bool     `json:"can_send_messages,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}
