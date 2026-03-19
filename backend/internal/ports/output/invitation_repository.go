package output

import (
	"chatApp/internal/domain"
)

type InvitationRepository interface {
	Create(invitation domain.Invitation) (domain.Invitation, error)
	Delete(invitationID string) error
	GetByID(invitationID string) (domain.Invitation, error)
	GetByCode(code string) (domain.Invitation, error)
	ListByServer(serverID string) ([]domain.Invitation, error)
	IncrementUses(invitationID string) error
}
