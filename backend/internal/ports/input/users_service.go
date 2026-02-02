package input

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/domain"
	"context"
)

type UserService interface {
	Delete(ctx context.Context, id string) error
	Update(ctx context.Context, id string, updates dto.UpdateUserRequest) (*domain.User, error)
	ChangeRole(ctx context.Context, id, newRole string) error
	GetAll(ctx context.Context) ([]domain.User, error)
	GetByID(ctx context.Context, id string) (*domain.User, error)
}
