package dto

import "time"

type InvitationCreateRequest struct {
	MaxUses   *int       `json:"max_uses,omitempty"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}

type InvitationResponse struct {
	ID        string     `json:"id"`
	ServerID  string     `json:"server_id"`
	CreatedBy string     `json:"created_by"`
	Code      string     `json:"code"`
	MaxUses   *int       `json:"max_uses,omitempty"`
	Uses      int        `json:"uses"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}
