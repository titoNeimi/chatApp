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

	var members []domain.RoomMember
	if err := r.db.Model(&models.RoomUsers{}).
		Joins("JOIN users ON users.id = room_users.user_id").
		Select("room_users.user_id, users.username").
		Where("room_users.room_id = ? AND room_users.deleted_at IS NULL", roomID).
		Scan(&members).Error; err != nil {
		return nil, err
	}

	return members, nil
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
