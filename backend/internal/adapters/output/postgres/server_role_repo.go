package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ServerRoleRepo struct {
	db *gorm.DB
}

func NewServerRoleRepo(db *gorm.DB) *ServerRoleRepo {
	return &ServerRoleRepo{db: db}
}

func (r *ServerRoleRepo) CreateRole(role domain.ServerRole) (domain.ServerRole, error) {
	newRole := models.ServerRoles{
		ServerID:          role.ServerID,
		Name:              role.Name,
		CanDeleteMessages: role.CanDeleteMessages,
		CanManageMembers:  role.CanManageMembers,
		CanMuteMembers:    role.CanMuteMembers,
		CanManageRooms:    role.CanManageRooms,
	}

	err := r.db.Create(&newRole).Error
	if err != nil {
		return domain.ServerRole{}, err
	}
	return *newRole.ToDomain(), nil
}

func (r *ServerRoleRepo) GetRoleByID(roleID string) (domain.ServerRole, error) {
	var role models.ServerRoles

	result := r.db.First(&role, "id = ?", roleID)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return domain.ServerRole{}, domain.ErrServerRoleNotFound
		}
		return domain.ServerRole{}, result.Error
	}

	return *role.ToDomain(), nil
}

func (r *ServerRoleRepo) ListRolesByServer(serverID string) ([]domain.ServerRole, error) {
	var roles []models.ServerRoles

	result := r.db.Find(&roles, "server_id = ?", serverID)

	if result.Error != nil {
		return nil, result.Error
	}

	rolesSlice := make([]domain.ServerRole, 0, len(roles))
	for _, role := range roles {
		newRole := role.ToDomain()
		rolesSlice = append(rolesSlice, *newRole)
	}

	return rolesSlice, nil
}
func (r *ServerRoleRepo) UpdateRole(roleID string, updates map[string]any) (domain.ServerRole, error) {
	result := r.db.Model(&models.ServerRoles{}).Where("id = ?", roleID).Updates(updates)
	if result.Error != nil {
		return domain.ServerRole{}, result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ServerRole{}, domain.ErrServerRoleNotFound
	}
	return r.GetRoleByID(roleID)
}
func (r *ServerRoleRepo) DeleteRole(roleID string) error {
	result := r.db.Delete(&models.ServerRoles{}, "id = ?", roleID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrServerRoleNotFound
	}
	return nil
}

func (r *ServerRoleRepo) AssignRoleToUser(serverID, userID, roleID string) error {
	record := models.ServerUserRoles{
		ServerID: serverID,
		UserID:   userID,
		RoleID:   roleID,
	}
	return r.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&record).Error
}

func (r *ServerRoleRepo) RevokeRoleFromUser(serverID, userID, roleID string) error {
	result := r.db.Delete(&models.ServerUserRoles{}, "server_id = ? AND user_id = ? AND role_id = ?", serverID, userID, roleID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrServerRoleNotFound
	}
	return nil
}

func (r *ServerRoleRepo) ListRolesForUser(serverID, userID string) ([]domain.ServerRole, error) {
	var roles []models.ServerRoles
	result := r.db.
		Joins("JOIN server_user_roles sur ON sur.role_id = server_roles.id").
		Where("sur.server_id = ? AND sur.user_id = ?", serverID, userID).
		Find(&roles)

	if result.Error != nil {
		return nil, result.Error
	}

	out := make([]domain.ServerRole, 0, len(roles))
	for _, role := range roles {
		out = append(out, *role.ToDomain())
	}
	return out, nil
}

func (r *ServerRoleRepo) ListUsersWithRoles(serverID string) ([]domain.UserWithRoles, error) {
	type row struct {
		UserID            string `gorm:"column:user_id"`
		Username          string `gorm:"column:username"`
		RoleID            string `gorm:"column:role_id"`
		RoleName          string `gorm:"column:role_name"`
		RoleServerID      string `gorm:"column:role_server_id"`
		CanDeleteMessages bool   `gorm:"column:can_delete_messages"`
		CanMuteMembers    bool   `gorm:"column:can_mute_members"`
		CanManageMembers  bool   `gorm:"column:can_manage_members"`
		CanManageRooms    bool   `gorm:"column:can_manage_rooms"`
		CanSendMessages   bool   `gorm:"column:can_send_messages"`
	}

	var rows []row
	err := r.db.Raw(`
		SELECT su.user_id, u.username,
			sr.id AS role_id, sr.name AS role_name, sr.server_id AS role_server_id,
			COALESCE(sr.can_delete_messages, false) AS can_delete_messages,
      COALESCE(sr.can_mute_members, false) AS can_mute_members,
		  COALESCE(sr.can_manage_members, false) AS can_manage_members,
		  COALESCE(sr.can_manage_rooms, false) AS can_manage_rooms,
		  COALESCE(sr.can_send_messages, false) AS can_send_messages
		FROM server_users su
		JOIN users u ON u.id = su.user_id
		LEFT JOIN server_user_roles sur ON sur.user_id = su.user_id AND sur.server_id = su.server_id
		LEFT JOIN server_roles sr ON sr.id = sur.role_id
		WHERE su.server_id = ?
	`, serverID).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	userMap := make(map[string]*domain.UserWithRoles)
	userOrder := make([]string, 0)
	for _, r := range rows {
		if _, exists := userMap[r.UserID]; !exists {
			userMap[r.UserID] = &domain.UserWithRoles{
				UserID:   r.UserID,
				Username: r.Username,
				Roles:    []domain.ServerRole{},
			}
			userOrder = append(userOrder, r.UserID)
		}
		if r.RoleID != "" {
			userMap[r.UserID].Roles = append(userMap[r.UserID].Roles, domain.ServerRole{
				ID:                r.RoleID,
				ServerID:          r.RoleServerID,
				Name:              r.RoleName,
				CanDeleteMessages: r.CanDeleteMessages,
				CanMuteMembers:    r.CanMuteMembers,
				CanManageMembers:  r.CanManageMembers,
				CanManageRooms:    r.CanManageRooms,
				CanSendMessages:   r.CanSendMessages,
			})
		}
	}

	out := make([]domain.UserWithRoles, 0, len(userOrder))
	for _, uid := range userOrder {
		out = append(out, *userMap[uid])
	}
	return out, nil
}
