package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
)

type PermissionService struct {
	permissionRepo output.PermissionRepository
	rolesRepo      output.ServerRoleRepository
	banRepo        output.ServerBanRepository
}

func NewPermissionService(permissionRepo output.PermissionRepository, rolesRepo output.ServerRoleRepository, banRepo output.ServerBanRepository) *PermissionService {
	return &PermissionService{permissionRepo: permissionRepo, rolesRepo: rolesRepo, banRepo: banRepo}
}

func (r *PermissionService) ResolvePermissions(serverID, roomID, userID string) (domain.EffectivePermissions, error) {
	//fetch all roles the user has in this server
	userRoles, err := r.rolesRepo.ListRolesForUser(serverID, userID)
	if err != nil {
		return domain.EffectivePermissions{}, err
	}

	//OR all role booleans to form the base permission set
	perms := domain.EffectivePermissions{}
	for _, role := range userRoles {
		perms.CanDeleteMessages = perms.CanDeleteMessages || role.CanDeleteMessages
		perms.CanMuteMembers = perms.CanMuteMembers || role.CanMuteMembers
		perms.CanManageMembers = perms.CanManageMembers || role.CanManageMembers
		perms.CanManageRooms = perms.CanManageRooms || role.CanManageRooms
	}

	//no room context — return server-level permissions as-is
	if roomID == "" {
		return perms, nil
	}

	//collect roleIDs to query room-level role overrides
	roleIDs := make([]string, len(userRoles))
	for i, role := range userRoles {
		roleIDs[i] = role.ID
	}

	//apply role overrides for this room (OR merge, same additive logic)
	if len(roleIDs) > 0 {
		roleOverrides, err := r.permissionRepo.GetRoleOverridesForRoom(roomID, roleIDs)
		if err != nil {
			return domain.EffectivePermissions{}, err
		}
		for _, o := range roleOverrides {
			if o.CanDeleteMessages != nil {
				perms.CanDeleteMessages = perms.CanDeleteMessages || *o.CanDeleteMessages
			}
			if o.CanMuteMembers != nil {
				perms.CanMuteMembers = perms.CanMuteMembers || *o.CanMuteMembers
			}
			if o.CanManageMembers != nil {
				perms.CanManageMembers = perms.CanManageMembers || *o.CanManageMembers
			}
			if o.CanManageRooms != nil {
				perms.CanManageRooms = perms.CanManageRooms || *o.CanManageRooms
			}
		}
	}

	//apply user-specific override for this room (direct assignment, highest priority)
	userOverride, err := r.permissionRepo.GetUserOverrideForRoom(roomID, userID)
	if err != nil {
		return domain.EffectivePermissions{}, err
	}
	if userOverride != nil {
		if userOverride.CanDeleteMessages != nil {
			perms.CanDeleteMessages = *userOverride.CanDeleteMessages
		}
		if userOverride.CanMuteMembers != nil {
			perms.CanMuteMembers = *userOverride.CanMuteMembers
		}
		if userOverride.CanManageMembers != nil {
			perms.CanManageMembers = *userOverride.CanManageMembers
		}
		if userOverride.CanManageRooms != nil {
			perms.CanManageRooms = *userOverride.CanManageRooms
		}
	}

	return perms, nil
}

func (r *PermissionService) IsUserBanned(serverID, userID string) (bool, error) {
	return r.banRepo.IsUserBanned(serverID, userID)
}

func (r *PermissionService) UpsertRoomOverride(override domain.RoomPermissionOverride) (domain.RoomPermissionOverride, error) {
	return r.permissionRepo.UpsertOverride(override)
}

func (r *PermissionService) DeleteRoomOverride(overrideID string) error {
	return r.permissionRepo.DeleteOverride(overrideID)
}

func (r *PermissionService) ListRoomOverrides(roomID string) ([]domain.RoomPermissionOverride, error) {
	return r.permissionRepo.ListOverridesByRoom(roomID)
}
