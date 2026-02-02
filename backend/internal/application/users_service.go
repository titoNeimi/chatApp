package application

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"context"
)

type UserService struct {
	userRepo output.UserRepository
}

func NewUserService(userRepo output.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) Delete(ctx context.Context, id string) error {
	panic("not implemented")
}
func (s *UserService) Update(ctx context.Context, id string, updates dto.UpdateUserRequest) (*domain.User, error) {
	panic("not implemented")
}
func (s *UserService) ChangeRole(ctx context.Context, id, newRole string) error {
	panic("not implemented")
}
func (s *UserService) GetAll(ctx context.Context) ([]domain.User, error) {
	users, err := s.userRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return users, nil
}
func (s *UserService) GetByID(ctx context.Context, id string) (*domain.User, error) {
	panic("not implemented")
}
