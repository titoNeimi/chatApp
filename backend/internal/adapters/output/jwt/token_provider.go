package jwt

import (
	"chatApp/internal/domain"
	"chatApp/internal/infrastructure/config"
	"chatApp/internal/ports/output"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	accessTokenType  = "access"
	refreshTokenType = "refresh"
)

type TokenProvider struct {
	accessSecret  string
	refreshSecret string
	accessTTL     time.Duration
	refreshTTL    time.Duration
	issuer        string
}

type accessTokenClaims struct {
	UserID string `json:"uid"`
	Role   string `json:"role"`
	Type   string `json:"typ"`
	jwt.RegisteredClaims
}

type refreshTokenClaims struct {
	UserID string `json:"uid"`
	Type   string `json:"typ"`
	jwt.RegisteredClaims
}

func NewTokenProvider(authConfig config.AuthConfig) output.TokenProvider {
	return &TokenProvider{
		accessSecret:  authConfig.AccessSecret,
		refreshSecret: authConfig.RefreshSecret,
		accessTTL:     authConfig.AccessTTL,
		refreshTTL:    authConfig.RefreshTTL,
		issuer:        authConfig.Issuer,
	}
}

func (p *TokenProvider) GenerateAccessToken(user *domain.User) (string, error) {
	if user == nil {
		return "", domain.ErrInvalidCredentials
	}

	now := time.Now().UTC()
	expiresAt := now.Add(p.accessTTL)

	claims := accessTokenClaims{
		UserID: user.ID,
		Role:   user.Role,
		Type:   accessTokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			Issuer:    p.issuer,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(p.accessSecret))
}

func (p *TokenProvider) GenerateRefreshToken(user *domain.User) (string, string, time.Time, error) {
	if user == nil {
		return "", "", time.Time{}, domain.ErrInvalidCredentials
	}

	now := time.Now().UTC()
	expiresAt := now.Add(p.refreshTTL)
	tokenID := uuid.NewString()

	claims := refreshTokenClaims{
		UserID: user.ID,
		Type:   refreshTokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			Issuer:    p.issuer,
			ID:        tokenID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(p.refreshSecret))
	if err != nil {
		return "", "", time.Time{}, err
	}

	return signedToken, tokenID, expiresAt, nil
}

func (p *TokenProvider) ValidateAccessToken(token string) (*domain.AccessTokenClaims, error) {
	claims := &accessTokenClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(p.accessSecret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}), jwt.WithIssuer(p.issuer))
	if err != nil {
		return nil, mapJWTError(err)
	}

	if claims.Type != accessTokenType {
		return nil, domain.ErrInvalidToken
	}

	return &domain.AccessTokenClaims{
		UserID:    claims.UserID,
		Role:      claims.Role,
		ExpiresAt: claims.ExpiresAt.Time,
	}, nil
}

func (p *TokenProvider) ValidateRefreshToken(token string) (*domain.RefreshTokenClaims, error) {
	claims := &refreshTokenClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(p.refreshSecret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}), jwt.WithIssuer(p.issuer))
	if err != nil {
		return nil, mapJWTError(err)
	}

	if claims.Type != refreshTokenType || claims.ID == "" {
		return nil, domain.ErrInvalidToken
	}

	return &domain.RefreshTokenClaims{
		UserID:    claims.UserID,
		TokenID:   claims.ID,
		ExpiresAt: claims.ExpiresAt.Time,
	}, nil
}

func mapJWTError(err error) error {
	if errors.Is(err, jwt.ErrTokenExpired) {
		return domain.ErrExpiredToken
	}
	return domain.ErrInvalidToken
}
