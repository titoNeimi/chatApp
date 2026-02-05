package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"

	"gorm.io/gorm"
)

type serverRepo struct {
	db *gorm.DB
}

func NewServerRepo(db *gorm.DB) *serverRepo {
	return &serverRepo{db: db}
}

func (r *serverRepo) GetAll() ([]domain.Server, error) {

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
