package input

import (
	"chatApp/internal/domain"
	"context"
)

type AuthService interface {
	Register(ctx context.Context, email, username, password string) (*domain.User, error)
	Login(ctx context.Context, email, password string) (accesToken, refreshToken string, err error)
	Refresh(ctx context.Context, refreshToken string) (accesToken, newRefreshToken string, err error)
	Logout(ctx context.Context, refreshToken string) error
	ValidateAccessToken(ctx context.Context, accessToken string) (*domain.AccessTokenClaims, error)
}
