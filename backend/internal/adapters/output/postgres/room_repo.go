package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type RoomRepo struct {
	db *gorm.DB
}

func NewRoomRepo(db *gorm.DB) *RoomRepo {
	return &RoomRepo{db: db}
}

func (r *RoomRepo) Create(room domain.Room) (domain.Room, error) {
	model := models.RoomFromDomain(&room)
	if model == nil {
		return domain.Room{}, nil
	}
	if err := r.db.Omit("ID").Create(model).Error; err != nil {
		return domain.Room{}, err
	}
	created := model.ToDomain()
	if created == nil {
		return domain.Room{}, nil
	}
	return *created, nil
}
func (r *RoomRepo) Update(roomID string, updates map[string]interface{}) (domain.Room, error) {
	if len(updates) == 0 {
		return r.GetByID(roomID)
	}

	if err := r.db.Model(&models.Room{}).Where("id = ?", roomID).Updates(updates).Error; err != nil {
		return domain.Room{}, err
	}

	return r.GetByID(roomID)
}
func (r *RoomRepo) GetByID(roomID string) (domain.Room, error) {
	var model models.Room

	if err := r.db.First(&model, "id = ?", roomID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Room{}, domain.ErrRoomNotFound
		}
		return domain.Room{}, err
	}

	return *model.ToDomain(), nil

}
func (r *RoomRepo) SoftDelete(roomID string) error {
	result := r.db.Delete(&models.Room{}, "id = ?", roomID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrRoomNotFound
	}
	return nil
}
func (r *RoomRepo) SoftDeleteByServerID(serverID string) error {
	return r.db.Where("server_id = ?", serverID).Delete(&models.Room{}).Error
}

func (r *RoomRepo) ListByServer(serverID string) ([]domain.Room, error) {
	var rooms []models.Room

	if err := r.db.Where("server_id = ?", serverID).Find(&rooms).Error; err != nil {
		return nil, err
	}

	domainRooms := make([]domain.Room, 0, len(rooms))
	for _, room := range rooms {
		domainRoom := room.ToDomain()
		if domainRoom == nil {
			continue
		}
		domainRooms = append(domainRooms, *domainRoom)
	}

	return domainRooms, nil
}

func (r *RoomRepo) AddUserToRoom(roomID, userID string) error {
	var roomUser models.RoomUsers
	err := r.db.Unscoped().
		Where("room_id = ? AND user_id = ?", roomID, userID).
		First(&roomUser).Error

	if err == nil {
		if !roomUser.DeletedAt.Valid {
			return nil
		}

		return r.db.Unscoped().
			Model(&models.RoomUsers{}).
			Where("id = ?", roomUser.ID).
			Updates(map[string]interface{}{
				"deleted_at":           nil,
				"last_read_message_id": nil,
			}).Error
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	newMembership := models.RoomUsers{
		RoomID: roomID,
		UserID: userID,
	}

	return r.db.Create(&newMembership).Error
}

func (r *RoomRepo) RemoveUserFromRoom(roomID, userID string) error {
	result := r.db.
		Where("room_id = ? AND user_id = ?", roomID, userID).
		Delete(&models.RoomUsers{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return domain.ErrRoomMembershipNotFound
	}

	return nil
}

func (r *RoomRepo) ListMembersByRoom(roomID string) ([]domain.RoomMember, error) {
	if _, err := r.GetByID(roomID); err != nil {
		return nil, err
	}

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
		DisplaySeparately bool   `gorm:"column:display_separately"`
	}

	var rows []row
	err := r.db.Raw(`
		SELECT ru.user_id, u.username,
			sr.id AS role_id, sr.name AS role_name, sr.server_id AS role_server_id,
			COALESCE(sr.can_delete_messages, false) AS can_delete_messages,
			COALESCE(sr.can_mute_members, false) AS can_mute_members,
			COALESCE(sr.can_manage_members, false) AS can_manage_members,
			COALESCE(sr.can_manage_rooms, false) AS can_manage_rooms,
			COALESCE(sr.can_send_messages, false) AS can_send_messages,
			COALESCE(sr.display_separately, false) AS display_separately
		FROM room_users ru
		JOIN users u ON u.id = ru.user_id
		JOIN rooms rm ON rm.id = ru.room_id
		LEFT JOIN server_user_roles sur ON sur.user_id = ru.user_id AND sur.server_id = rm.server_id
		LEFT JOIN server_roles sr ON sr.id = sur.role_id
		WHERE ru.room_id = ? AND ru.deleted_at IS NULL
	`, roomID).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	memberMap := make(map[string]*domain.RoomMember)
	memberOrder := make([]string, 0)
	for _, row := range rows {
		if _, exists := memberMap[row.UserID]; !exists {
			memberMap[row.UserID] = &domain.RoomMember{
				UserID:   row.UserID,
				Username: row.Username,
				Roles:    []domain.ServerRole{},
			}
			memberOrder = append(memberOrder, row.UserID)
		}
		if row.RoleID != "" {
			memberMap[row.UserID].Roles = append(memberMap[row.UserID].Roles, domain.ServerRole{
				ID:                row.RoleID,
				ServerID:          row.RoleServerID,
				Name:              row.RoleName,
				CanDeleteMessages: row.CanDeleteMessages,
				CanMuteMembers:    row.CanMuteMembers,
				CanManageMembers:  row.CanManageMembers,
				CanManageRooms:    row.CanManageRooms,
				CanSendMessages:   row.CanSendMessages,
				DisplaySeparately: row.DisplaySeparately,
			})
		}
	}

	out := make([]domain.RoomMember, 0, len(memberOrder))
	for _, uid := range memberOrder {
		out = append(out, *memberMap[uid])
	}
	return out, nil
}

func (r *RoomRepo) UpdateLastRead(roomID, userID, messageID string) error {
	result := r.db.Model(&models.RoomUsers{}).
		Where("room_id = ? AND user_id = ?", roomID, userID).
		UpdateColumn("last_read_message_id", messageID)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrRoomMembershipNotFound
	}
	return nil
}

func (r *RoomRepo) GetMyMembership(roomID, userID string) (domain.MyRoomMembership, error) {
	var roomUser models.RoomUsers

	result := r.db.Where("user_id = ? AND room_id = ?", userID, roomID).First(&roomUser)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return domain.MyRoomMembership{}, domain.ErrRoomMembershipNotFound
		}
		return domain.MyRoomMembership{}, result.Error
	}

	return domain.MyRoomMembership{
		UserID:            roomUser.UserID,
		LastReadMessageID: roomUser.LastReadMessageID,
	}, nil

}

func (r *RoomRepo) AddUsersToRoom(roomID string, userIDs []string) error {
    if len(userIDs) == 0 {
        return nil
    }
    records := make([]models.RoomUsers, len(userIDs))
    for i, uid := range userIDs {
        records[i] = models.RoomUsers{RoomID: roomID, UserID: uid}
    }
    return r.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&records).Error
}
