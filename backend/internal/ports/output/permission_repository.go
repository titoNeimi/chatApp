package output

import "chatApp/internal/domain"

type PermissionRepository interface {
	UpsertOverride(override domain.RoomPermissionOverride) (domain.RoomPermissionOverride, error)
	DeleteOverride(overrideID string) error
	ListOverridesByRoom(roomID string) ([]domain.RoomPermissionOverride, error)
	GetUserOverrideForRoom(roomID, userID string) (*domain.RoomPermissionOverride, error)
	GetRoleOverridesForRoom(roomID string, roleIDs []string) ([]domain.RoomPermissionOverride, error)
}
