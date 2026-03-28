package domain

import "time"

type UserStatusType string

const (
	UserStatusOnline    UserStatusType = "online"
	UserStatusAway      UserStatusType = "away"
	UserStatusInvisible UserStatusType = "invisible"
)

func IsValidUserStatus(s UserStatusType) bool {
	return s == UserStatusOnline || s == UserStatusAway || s == UserStatusInvisible
}

type UserStatus struct {
	UserID    string
	Status    UserStatusType
	UpdatedAt time.Time
}
