package domain

import "time"

type ServerBan struct {
	ID       string
	ServerID string
	UserID   string
	BannedBy string
	Reason   *string
	BannedAt time.Time
}
