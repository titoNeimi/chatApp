package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	cryptopkg "chatApp/pkg/crypto"
	"context"
	"time"
)

type AuthService struct {
	userRepo         output.UserRepository
	refreshTokenRepo output.RefreshTokenRepository
	tokenProvider    output.TokenProvider
}

func NewAuthService(
	userRepo output.UserRepository,
	refreshTokenRepo output.RefreshTokenRepository,
	tokenProvider output.TokenProvider,
) *AuthService {
	return &AuthService{
		userRepo:         userRepo,
		refreshTokenRepo: refreshTokenRepo,
		tokenProvider:    tokenProvider,
	}
}

func (s *AuthService) Register(ctx context.Context, email, username, password string) (*domain.User, error) {

	exist, err := s.userRepo.ExistsByEmail(ctx, email)

	if err != nil {
		return nil, err
	}

	if exist {
		return nil, domain.ErrDuplicateEmail
	}

	hashedPassword, err := cryptopkg.HashPassword(password)
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

func (s *AuthService) Login(ctx context.Context, email, password string) (string, string, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)

	if err != nil {
		if err == domain.ErrUserNotFound {
			return "", "", domain.ErrInvalidCredentials
		}
		return "", "", err
	}

	if isValidPassword := cryptopkg.ValidatePassword(password, user.Password_hash); !isValidPassword {
		return "", "", domain.ErrInvalidCredentials
	}

	accessToken, err := s.tokenProvider.GenerateAccessToken(user)
	if err != nil {
		return "", "", err
	}

	refreshToken, refreshTokenID, refreshExpiresAt, err := s.tokenProvider.GenerateRefreshToken(user)
	if err != nil {
		return "", "", err
	}

	refreshSession := &domain.RefreshSession{
		ID:        refreshTokenID,
		UserID:    user.ID,
		TokenHash: cryptopkg.HashToken(refreshToken),
		ExpiresAt: refreshExpiresAt,
	}
	if err := s.refreshTokenRepo.Create(ctx, refreshSession); err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (string, string, error) {
	refreshClaims, err := s.tokenProvider.ValidateRefreshToken(refreshToken)
	if err != nil {
		if err == domain.ErrExpiredToken {
			return "", "", domain.ErrRefreshTokenExpired
		}
		return "", "", err
	}

	refreshSession, err := s.refreshTokenRepo.FindByID(ctx, refreshClaims.TokenID)
	if err != nil {
		return "", "", err
	}

	if refreshSession.RevokedAt != nil {
		return "", "", domain.ErrRefreshTokenRevoked
	}
	if refreshSession.UserID != refreshClaims.UserID {
		return "", "", domain.ErrInvalidToken
	}
	if time.Now().UTC().After(refreshSession.ExpiresAt) {
		return "", "", domain.ErrRefreshTokenExpired
	}
	if !cryptopkg.ValidateTokenHash(refreshToken, refreshSession.TokenHash) {
		return "", "", domain.ErrInvalidToken
	}

	user, err := s.userRepo.FindByID(ctx, refreshClaims.UserID)
	if err != nil {
		return "", "", err
	}

	newAccessToken, err := s.tokenProvider.GenerateAccessToken(user)
	if err != nil {
		return "", "", err
	}

	newRefreshToken, newRefreshTokenID, newRefreshExpiresAt, err := s.tokenProvider.GenerateRefreshToken(user)
	if err != nil {
		return "", "", err
	}

	newRefreshSession := &domain.RefreshSession{
		ID:        newRefreshTokenID,
		UserID:    user.ID,
		TokenHash: cryptopkg.HashToken(newRefreshToken),
		ExpiresAt: newRefreshExpiresAt,
	}
	if err := s.refreshTokenRepo.Rotate(ctx, refreshClaims.TokenID, newRefreshSession); err != nil {
		return "", "", err
	}

	return newAccessToken, newRefreshToken, nil
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	refreshClaims, err := s.tokenProvider.ValidateRefreshToken(refreshToken)
	if err != nil {
		if err == domain.ErrExpiredToken {
			return nil
		}
		return err
	}

	refreshSession, err := s.refreshTokenRepo.FindByID(ctx, refreshClaims.TokenID)
	if err != nil {
		if err == domain.ErrRefreshTokenNotFound {
			return nil
		}
		return err
	}

	if !cryptopkg.ValidateTokenHash(refreshToken, refreshSession.TokenHash) {
		return domain.ErrInvalidToken
	}

	err = s.refreshTokenRepo.RevokeByID(ctx, refreshClaims.TokenID)
	if err == domain.ErrRefreshTokenNotFound || err == domain.ErrRefreshTokenRevoked {
		return nil
	}
	return err

}

func (s *AuthService) ValidateAccessToken(ctx context.Context, accessToken string) (*domain.AccessTokenClaims, error) {
	claims, err := s.tokenProvider.ValidateAccessToken(accessToken)
	if err != nil {
		return nil, err
	}

	if _, err := s.userRepo.FindByID(ctx, claims.UserID); err != nil {
		if err == domain.ErrUserNotFound {
			return nil, domain.ErrInvalidToken
		}
		return nil, err
	}

	return claims, nil
}
