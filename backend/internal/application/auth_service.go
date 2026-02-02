package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"chatApp/pkg/crypto"
	"context"
	"fmt"
)

type AuthService struct {
	userRepo output.UserRepository
}

func NewAuthService(userRepo output.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(ctx context.Context, email, username, password string) (*domain.User, error) {

	exist, err := s.userRepo.ExistsByEmail(ctx, email)

	if err != nil {
		return nil, err
	}

	if exist {
		return nil, domain.ErrDuplicateEmail
	}

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
	user, err := s.userRepo.FindByEmail(ctx, email)

	if err != nil {
		fmt.Println(err)
		return "", "", err
	}

	if isValidPassword := crypto.ValidatePassword(hashPassword, user.Password_hash); !isValidPassword {
		return "", "", domain.ErrInvalidCredentials
	}

	return "", "", nil

}
