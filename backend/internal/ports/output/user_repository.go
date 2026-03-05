package output

import (
	"chatApp/internal/domain"
	"context"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	FindByUsername(ctx context.Context, username string) (*domain.User, error)
	FindByID(ctx context.Context, id string) (*domain.User, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	GetAll(ctx context.Context) ([]domain.User, error)
	ChangeRole(ctx context.Context, id, newRole string) error
	Delete(ctx context.Context, id string) error
	Update(ctx context.Context, id string, updates map[string]interface{}) (*domain.User, error)
}
