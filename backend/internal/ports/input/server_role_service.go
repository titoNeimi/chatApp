package input

import "chatApp/internal/domain"

type ServerRoleService interface {
	CreateRole(serverID, name string, perms domain.ServerRole) (domain.ServerRole, error)
	GetRole(roleID string) (domain.ServerRole, error)
	ListRoles(serverID string) ([]domain.ServerRole, error)
	UpdateRole(roleID string, updates map[string]interface{}) (domain.ServerRole, error)
	DeleteRole(roleID string) error
	AssignRole(serverID, userID, roleID string) error
	RevokeRole(serverID, userID, roleID string) error
	ListUsersWithRoles(serverID string) ([]domain.UserWithRoles, error)
	BanUser(serverID, targetUserID, actorUserID string, reason *string) (domain.ServerBan, error)
	UnbanUser(serverID, targetUserID string) error
	ListBans(serverID string) ([]domain.ServerBan, error)
}
