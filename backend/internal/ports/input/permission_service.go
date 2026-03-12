package input

import "chatApp/internal/domain"

type PermissionService interface {
	ResolvePermissions(serverID, roomID, userID string) (domain.EffectivePermissions, error)
	IsUserBanned(serverID, userID string) (bool, error)
	UpsertRoomOverride(override domain.RoomPermissionOverride) (domain.RoomPermissionOverride, error)
	DeleteRoomOverride(overrideID string) error
	ListRoomOverrides(roomID string) ([]domain.RoomPermissionOverride, error)
}
