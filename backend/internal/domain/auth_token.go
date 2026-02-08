package domain

import "time"

type AccessTokenClaims struct {
	UserID    string
	Role      string
	ExpiresAt time.Time
}

type RefreshTokenClaims struct {
	UserID    string
	TokenID   string
	ExpiresAt time.Time
}
