package domain

import "errors"

var (
	ErrDuplicateEmail         = errors.New("email already exists")
	ErrInvalidEmail           = errors.New("invalid email format")
	ErrWeakPassword           = errors.New("password too weak")
	ErrUserNotFound           = errors.New("user not found")
	ErrInvalidCredentials     = errors.New("invalid credentials")
	ErrInvalidToken           = errors.New("invalid token")
	ErrExpiredToken           = errors.New("expired token")
	ErrRefreshTokenNotFound   = errors.New("refresh token not found")
	ErrRefreshTokenRevoked    = errors.New("refresh token revoked")
	ErrRefreshTokenExpired    = errors.New("refresh token expired")
	ErrInvalidRole            = errors.New("invalid role")
	ErrInvalidID              = errors.New("invalid id")
	ErrServerNotFound         = errors.New("server not found")
	ErrRoomNotFound           = errors.New("room not found")
	ErrMessageNotFound        = errors.New("message not found")
	ErrRoomMembershipNotFound = errors.New("room membership not found")
)
