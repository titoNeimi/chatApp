package input

import (
	"chatApp/internal/domain"
	"context"
)

type AuthService interface {
	Register(ctx context.Context, email, username, password string) (*domain.User, error)
	Login(ctx context.Context, email, hashedPassword string) (accesToken, refreshToken string, err error)
}
