package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"errors"
)

type ServerRoleService struct {
	roleRepo   output.ServerRoleRepository
	banRepo    output.ServerBanRepository
	serverRepo output.ServerRepository
}

func NewServerRoleService(
	roleRepo output.ServerRoleRepository,
	banRepo output.ServerBanRepository,
	serverRepo output.ServerRepository,
) *ServerRoleService {
	return &ServerRoleService{roleRepo: roleRepo, banRepo: banRepo, serverRepo: serverRepo}
}

func (s *ServerRoleService) CreateRole(serverID, name string, perms domain.ServerRole) (domain.ServerRole, error) {
	role := domain.ServerRole{
		ServerID:          serverID,
		Name:              name,
		CanDeleteMessages: perms.CanDeleteMessages,
		CanMuteMembers:    perms.CanMuteMembers,
		CanManageMembers:  perms.CanManageMembers,
		CanManageRooms:    perms.CanManageRooms,
	}
	return s.roleRepo.CreateRole(role)
}

func (s *ServerRoleService) GetRole(roleID string) (domain.ServerRole, error) {
	return s.roleRepo.GetRoleByID(roleID)
}

func (s *ServerRoleService) ListRoles(serverID string) ([]domain.ServerRole, error) {
	return s.roleRepo.ListRolesByServer(serverID)
}

func (s *ServerRoleService) UpdateRole(roleID string, updates map[string]interface{}) (domain.ServerRole, error) {
	if len(updates) == 0 {
		return s.roleRepo.GetRoleByID(roleID)
	}
	return s.roleRepo.UpdateRole(roleID, updates)
}

func (s *ServerRoleService) DeleteRole(roleID string) error {
	return s.roleRepo.DeleteRole(roleID)
}

func (s *ServerRoleService) AssignRole(serverID, userID, roleID string) error {
	// Verify the role belongs to this server to prevent cross-server exploit
	role, err := s.roleRepo.GetRoleByID(roleID)
	if err != nil {
		return err
	}
	if role.ServerID != serverID {
		return domain.ErrForbidden
	}
	return s.roleRepo.AssignRoleToUser(serverID, userID, roleID)
}

func (s *ServerRoleService) RevokeRole(serverID, userID, roleID string) error {
	role, err := s.roleRepo.GetRoleByID(roleID)
	if err != nil {
		return err
	}
	if role.ServerID != serverID {
		return domain.ErrForbidden
	}
	return s.roleRepo.RevokeRoleFromUser(serverID, userID, roleID)
}

func (s *ServerRoleService) ListUsersWithRoles(serverID string) ([]domain.UserWithRoles, error) {
	return s.roleRepo.ListUsersWithRoles(serverID)
}

func (s *ServerRoleService) BanUser(serverID, targetUserID, actorUserID string, reason *string) (domain.ServerBan, error) {
	// Prevent self-ban
	if targetUserID == actorUserID {
		return domain.ServerBan{}, domain.ErrForbidden
	}

	ban := domain.ServerBan{
		ServerID: serverID,
		UserID:   targetUserID,
		BannedBy: actorUserID,
		Reason:   reason,
	}

	created, err := s.banRepo.BanUser(ban)
	if err != nil {
		return domain.ServerBan{}, err
	}

	// Remove the user from the server after banning
	removeErr := s.serverRepo.RemoveUserFromServer(serverID, targetUserID)
	if removeErr != nil && !errors.Is(removeErr, domain.ErrServerNotFound) {
		return domain.ServerBan{}, removeErr
	}

	return created, nil
}

func (s *ServerRoleService) UnbanUser(serverID, targetUserID string) error {
	return s.banRepo.UnbanUser(serverID, targetUserID)
}

func (s *ServerRoleService) ListBans(serverID string) ([]domain.ServerBan, error) {
	return s.banRepo.ListBansByServer(serverID)
}
