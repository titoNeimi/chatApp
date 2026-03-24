package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	cryptopkg "chatApp/pkg/crypto"
	"context"
)

type UserService struct {
	userRepo output.UserRepository
}

func NewUserService(userRepo output.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) Delete(ctx context.Context, id string) error {
	return s.userRepo.Delete(ctx, id)
}

func (s *UserService) Update(ctx context.Context, id string, updates map[string]interface{}) (*domain.User, error) {
	if len(updates) == 0 {
		return nil, domain.ErrNoFieldsToUpdate
	}

	currentUser, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	processedUpdates := make(map[string]interface{})
	for field, value := range updates {
		switch field {
		case "email":
			email, ok := value.(string)
			if !ok || email == "" {
				return nil, domain.ErrInvalidEmail
			}
			if email == currentUser.Email {
				continue
			}
			existingUser, err := s.userRepo.FindByEmail(ctx, email)
			if err != nil && err != domain.ErrUserNotFound {
				return nil, err
			}
			if existingUser != nil && existingUser.ID != id {
				return nil, domain.ErrDuplicateEmail
			}
			processedUpdates["email"] = email
		case "username":
			username, ok := value.(string)
			if !ok || username == "" {
				return nil, domain.ErrInvalidUsername
			}
			if username == currentUser.Username {
				continue
			}
			existingUser, err := s.userRepo.FindByUsername(ctx, username)
			if err != nil && err != domain.ErrUserNotFound {
				return nil, err
			}
			if existingUser != nil && existingUser.ID != id {
				return nil, domain.ErrDuplicateUsername
			}
			processedUpdates["username"] = username
		case "password":
			password, ok := value.(string)
			if !ok || len(password) < 8 {
				return nil, domain.ErrWeakPassword
			}
			hashedPassword, err := cryptopkg.HashPassword(password)
			if err != nil {
				return nil, err
			}
			processedUpdates["password_hash"] = hashedPassword
		}
	}

	if len(processedUpdates) == 0 {
		return nil, domain.ErrNoFieldsToUpdate
	}

	return s.userRepo.Update(ctx, id, processedUpdates)
}

func (s *UserService) ChangeRole(ctx context.Context, id, newRole string) error {
	if !domain.IsValidRole(newRole) {
		return domain.ErrInvalidRole
	}
	return s.userRepo.ChangeRole(ctx, id, newRole)
}

func (s *UserService) GetAll(ctx context.Context) ([]domain.User, error) {
	users, err := s.userRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (s *UserService) GetByID(ctx context.Context, id string) (*domain.User, error) {
	return s.userRepo.FindByID(ctx, id)
}

func (s *UserService) SearchByUsername(query string, currentUserID string) ([]domain.User, error) {
	const LIMIT = 10
	return s.userRepo.SearchByUsername(query, currentUserID, LIMIT)
}
