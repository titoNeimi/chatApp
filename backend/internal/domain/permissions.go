package domain

type EffectivePermissions struct {
	CanDeleteMessages bool
	CanMuteMembers    bool
	CanManageMembers  bool
	CanManageRooms    bool
}
