package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"

	"gorm.io/gorm"
)

type serverRepo struct {
	db *gorm.DB
}

func NewServerRepo(db *gorm.DB) *serverRepo {
	return &serverRepo{db: db}
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
func (r *serverRepo) Update(server domain.Server, serverID string) (domain.Server, error) {
	panic("not implemented")
}
func (r *serverRepo) SoftDelete(serverID string) error {
	panic("not implemented")
}
func (r *serverRepo) GetServerByID(serverId string) (domain.Server, error) {
	panic("not implemented")
}
