package input

import (
	"chatApp/internal/domain"
	"time"
)

type CreateInvitationInput struct {
	ServerID  string
	CreatedBy string
	MaxUses   *int
	ExpiresAt *time.Time
}

type InvitationService interface {
	Create(cmd CreateInvitationInput) (domain.Invitation, error)
	Delete(invitationID string) error
	GetByID(invitationID string) (domain.Invitation, error)
	GetByCode(code string) (domain.Invitation, error)
	ListByServer(serverID string) ([]domain.Invitation, error)
	Use(code string) (domain.Invitation, error)
}
