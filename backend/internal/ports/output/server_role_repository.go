package output

import "chatApp/internal/domain"

type ServerRoleRepository interface {
	CreateRole(role domain.ServerRole) (domain.ServerRole, error)
	GetRoleByID(roleID string) (domain.ServerRole, error)
	ListRolesByServer(serverID string) ([]domain.ServerRole, error)
	UpdateRole(roleID string, updates map[string]interface{}) (domain.ServerRole, error)
	DeleteRole(roleID string) error
	AssignRoleToUser(serverID, userID, roleID string) error
	RevokeRoleFromUser(serverID, userID, roleID string) error
	ListRolesForUser(serverID, userID string) ([]domain.ServerRole, error)
	ListUsersWithRoles(serverID string) ([]domain.UserWithRoles, error)
}
