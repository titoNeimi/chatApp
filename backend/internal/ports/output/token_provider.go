package output

import (
	"chatApp/internal/domain"
	"time"
)

type TokenProvider interface {
	GenerateAccessToken(user *domain.User) (token string, err error)
	GenerateRefreshToken(user *domain.User) (token string, tokenID string, expiresAt time.Time, err error)
	ValidateAccessToken(token string) (*domain.AccessTokenClaims, error)
	ValidateRefreshToken(token string) (*domain.RefreshTokenClaims, error)
}
