package domain

type EffectivePermissions struct {
	CanDeleteMessages bool
	CanMuteMembers    bool
	CanManageMembers  bool
	CanManageRooms    bool
	CanSendMessages   bool
}

func (p EffectivePermissions) HasPermission(perm string) bool {
	switch perm {
	case PermDeleteMessages:
		return p.CanDeleteMessages
	case PermMuteMembers:
		return p.CanMuteMembers
	case PermManageMembers:
		return p.CanManageMembers
	case PermManageRooms:
		return p.CanManageRooms
	case PermSendMessages:
		return p.CanSendMessages
	default:
		return false
	}
}
