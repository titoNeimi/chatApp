package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type serverRepo struct {
	db *gorm.DB
}

func NewServerRepo(db *gorm.DB) *serverRepo {
	return &serverRepo{db: db}
}

func (r *serverRepo) GetAll() ([]domain.Server, error) {

	var model []models.Server

	if err := r.db.Preload("Rooms").Find(&model, "is_private = false").Error; err != nil {
		return nil, err
	}

	servers := make([]domain.Server, 0, len(model))
	for i := range model {
		server := model[i].ToDomain()
		if server != nil {
			servers = append(servers, *server)
		}
	}

	return servers, nil
}

func (r *serverRepo) ListByUserID(userID string) ([]domain.Server, error) {
	var model []models.Server

	if err := r.db.
		Model(&models.Server{}).
		Preload("Rooms").
		Joins("JOIN server_users ON server_users.server_id = servers.id").
		Where("server_users.user_id = ?", userID).
		Find(&model).Error; err != nil {
		return nil, err
	}

	servers := make([]domain.Server, 0, len(model))
	for i := range model {
		server := model[i].ToDomain()
		if server != nil {
			servers = append(servers, *server)
		}
	}

	return servers, nil
}

func (r *serverRepo) Create(server domain.Server) (domain.Server, error) {
	model := models.ServerFromDomain(&server)
	if model == nil {
		return domain.Server{}, nil
	}
	if err := r.db.Omit("ID").Create(model).Error; err != nil {
		return domain.Server{}, err
	}
	created := model.ToDomain()
	if created == nil {
		return domain.Server{}, nil
	}
	return *created, nil
}
func (r *serverRepo) Update(serverID string, updates map[string]interface{}) (domain.Server, error) {
	if len(updates) == 0 {
		return r.GetServerByID(serverID)
	}

	if err := r.db.Model(&models.Server{}).Where("id = ?", serverID).Updates(updates).Error; err != nil {
		return domain.Server{}, err
	}

	return r.GetServerByID(serverID)
}
func (r *serverRepo) SoftDelete(serverID string) error {
	result := r.db.Delete(&models.Server{}, "id = ?", serverID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrServerNotFound
	}
	return nil
}

func (r *serverRepo) GetServerByID(serverId string) (domain.Server, error) {
	var model models.Server

	if err := r.db.Preload("Rooms").First(&model, "id = ?", serverId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Server{}, domain.ErrServerNotFound
		}
		return domain.Server{}, err
	}

	created := model.ToDomain()
	if created == nil {
		return domain.Server{}, nil
	}
	return *created, nil
}

func (r *serverRepo) ListUsersByServer(serverID string) ([]domain.User, error) {
	var users []models.User

	err := r.db.Model(&models.User{}).
		Joins("JOIN server_users ON server_users.user_id = users.id").
		Where("server_users.server_id = ?", serverID).
		Find(&users).Error
	if err != nil {
		return nil, err
	}

	result := make([]domain.User, 0, len(users))
	for i := range users {
		if u := users[i].ToDomain(); u != nil {
			result = append(result, *u)
		}
	}
	return result, nil
}

func (r *serverRepo) ListPublicRoomsByServer(serverID string) ([]domain.Room, error) {
	var rooms []models.Room

	err := r.db.Where("server_id = ? AND is_private = false", serverID).Find(&rooms).Error
	if err != nil {
		return nil, err
	}

	result := make([]domain.Room, 0, len(rooms))
	for i := range rooms {
		if room := rooms[i].ToDomain(); room != nil {
			result = append(result, *room)
		}
	}
	return result, nil
}

func (r *serverRepo) AddUserToServer(serverID, userID string) error {
	return r.db.Clauses(clause.OnConflict{DoNothing: true}).
		Create(&models.ServerUsers{ServerID: serverID, UserID: userID}).Error
}

func (r *serverRepo) IsUserMember(serverID, userID string) (bool, error) {
	var count int64
	err := r.db.Model(&models.ServerUsers{}).
		Where("server_id = ? AND user_id = ?", serverID, userID).
		Count(&count).Error
	return count > 0, err
}

func (r *serverRepo) RemoveUserFromServer(serverID, userID string) error {
	return r.db.Where("server_id = ? AND user_id = ?", serverID, userID).
		Delete(&models.ServerUsers{}).Error
}

func (r *serverRepo) GetServerStats(serverID string) (domain.ServerStats, error) {
	var memberCount, roomCount, roleCount int64

	if err := r.db.Model(&models.ServerUsers{}).
		Where("server_id = ?", serverID).
		Count(&memberCount).Error; err != nil {
		return domain.ServerStats{}, err
	}

	if err := r.db.Model(&models.Room{}).
		Where("server_id = ? AND deleted_at IS NULL", serverID).
		Count(&roomCount).Error; err != nil {
		return domain.ServerStats{}, err
	}

	if err := r.db.Model(&models.ServerRoles{}).
		Where("server_id = ?", serverID).
		Count(&roleCount).Error; err != nil {
		return domain.ServerStats{}, err
	}

	return domain.ServerStats{
		MemberCount: int(memberCount),
		RoomCount:   int(roomCount),
		RoleCount:   int(roleCount),
	}, nil
}

func (r *serverRepo) GetAllForAdmin() ([]domain.Server, error) {
	var model []models.Server

	if err := r.db.Preload("Rooms").Find(&model).Error; err != nil {
		return nil, err
	}

	servers := make([]domain.Server, 0, len(model))
	for i := range model {
		server := model[i].ToDomain()
		if server != nil {
			servers = append(servers, *server)
		}
	}

	return servers, nil
}

type trendingServerRow struct {
	ID             string     `gorm:"column:id"`
	Name           string     `gorm:"column:name"`
	Description    *string    `gorm:"column:description"`
	IsPrivate      bool       `gorm:"column:is_private"`
	CreatedAt      time.Time  `gorm:"column:created_at"`
	UpdatedAt      time.Time  `gorm:"column:updated_at"`
	MemberCount    int        `gorm:"column:member_count"`
	RecentMessages int        `gorm:"column:recent_messages"`
	ActiveUsers    int        `gorm:"column:active_users"`
	TrendScore     int        `gorm:"column:trend_score"`
}

func (r *serverRepo) GetTrending(limit int) ([]domain.TrendingServer, error) {
	var rows []trendingServerRow

	err := r.db.Raw(`
		SELECT
			s.id,
			s.name,
			s.description,
			s.is_private,
			s.created_at,
			s.updated_at,
			COUNT(DISTINCT su.user_id)                              AS member_count,
			COUNT(DISTINCT m.id)                                    AS recent_messages,
			COUNT(DISTINCT m.user_id)                               AS active_users,
			(COUNT(DISTINCT m.id) * 1 + COUNT(DISTINCT m.user_id) * 3) AS trend_score
		FROM servers s
		LEFT JOIN server_users su ON su.server_id = s.id
		LEFT JOIN rooms r ON r.server_id = s.id AND r.deleted_at IS NULL
		LEFT JOIN messages m ON m.room_id = r.id
			AND m.deleted_at IS NULL
			AND m.created_at >= NOW() - INTERVAL '7 days'
		WHERE s.is_private = FALSE
		  AND s.deleted_at IS NULL
		GROUP BY s.id, s.name, s.description, s.is_private, s.created_at, s.updated_at
		ORDER BY trend_score DESC
		LIMIT ?
	`, limit).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	result := make([]domain.TrendingServer, 0, len(rows))
	for _, row := range rows {
		result = append(result, domain.TrendingServer{
			ID:             row.ID,
			Name:           row.Name,
			Description:    row.Description,
			IsPrivate:      row.IsPrivate,
			CreatedAt:      row.CreatedAt,
			UpdatedAt:      row.UpdatedAt,
			MemberCount:    row.MemberCount,
			RecentMessages: row.RecentMessages,
			ActiveUsers:    row.ActiveUsers,
			TrendScore:     row.TrendScore,
		})
	}
	return result, nil
}
