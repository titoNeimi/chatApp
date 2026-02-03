package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"context"
	"errors"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) output.UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}
	return user.ToDomain(), nil
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	if user == nil {
		return nil
	}
	if user.Role == "" {
		user.Role = domain.RoleUser
	}
	if !domain.IsValidRole(user.Role) {
		return domain.ErrInvalidRole
	}
	model := models.UserFromDomain(user)
	if err := r.db.WithContext(ctx).Omit("ID").Create(model).Error; err != nil {
		return err
	}
	*user = *model.ToDomain()
	return nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user models.User
	if err := r.db.WithContext(ctx).First(&user, "email = ?", email).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}
	return user.ToDomain(), nil
}
func (r *UserRepository) GetAll(ctx context.Context) ([]domain.User, error) {
	var users []models.User
	if err := r.db.WithContext(ctx).Find(&users).Error; err != nil {
		return nil, err
	}
	domainUsers := make([]domain.User, 0, len(users))
	for i := range users {
		domainUser := users[i].ToDomain()
		if domainUser != nil {
			domainUsers = append(domainUsers, *domainUser)
		}
	}
	return domainUsers, nil
}
