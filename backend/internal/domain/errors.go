package domain

import "errors"

var (
	ErrDuplicateEmail         = errors.New("email already exists")
	ErrInvalidEmail           = errors.New("invalid email format")
	ErrWeakPassword           = errors.New("password too weak")
	ErrUserNotFound           = errors.New("user not found")
	ErrInvalidCredentials     = errors.New("invalid credentials")
	ErrInvalidRole            = errors.New("invalid role")
	ErrInvalidID              = errors.New("invalid id")
	ErrServerNotFound         = errors.New("server not found")
	ErrRoomNotFound           = errors.New("room not found")
	ErrMessageNotFound        = errors.New("message not found")
	ErrRoomMembershipNotFound = errors.New("room membership not found")
)
