package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"chatApp/pkg/crypto"
	"context"
)

type AuthService struct {
	userRepo output.UserRepository
}

func NewAuthService(userRepo output.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(ctx context.Context, email, username, password string) (*domain.User, error) {
	hashedPassword, err := crypto.HashPassword(password)
	if err != nil {
		return nil, err
	}
	user := domain.User{
		Username:      username,
		Email:         email,
		Password_hash: hashedPassword,
	}
	err = s.userRepo.Create(ctx, &user)
	return &user, err
}

func (s *AuthService) Login(ctx context.Context, email, hashPassword string) (string, string, error) {
	return "", "", nil
}
