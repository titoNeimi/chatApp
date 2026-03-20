package application

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"chatApp/internal/ports/output"
	"crypto/rand"
	"time"
)

type invitationService struct {
	invitationRepo output.InvitationRepository
	serverRepo     output.ServerRepository
}

func NewInvitationService(invitationRepo output.InvitationRepository, serverRepo output.ServerRepository) *invitationService {
	return &invitationService{invitationRepo: invitationRepo, serverRepo: serverRepo}
}

const invitationCodeCharset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateInvitationCode() (string, error) {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	for i := range b {
		b[i] = invitationCodeCharset[b[i]%byte(len(invitationCodeCharset))]
	}
	return string(b), nil
}

func (s *invitationService) Create(cmd input.CreateInvitationInput) (domain.Invitation, error) {
	_, err := s.serverRepo.GetServerByID(cmd.ServerID)
	if err != nil {
		return domain.Invitation{}, domain.ErrServerNotFound
	}
	code, err := generateInvitationCode()
	if err != nil {
		return domain.Invitation{}, err
	}

	i := domain.Invitation{
		Code:      code,
		ServerID:  cmd.ServerID,
		CreatedBy: cmd.CreatedBy,
		MaxUses:   cmd.MaxUses,
		ExpiresAt: cmd.ExpiresAt,
	}

	return s.invitationRepo.Create(i)
}
func (s *invitationService) Delete(invitationID string) error {
	return s.invitationRepo.Delete(invitationID)
}
func (s *invitationService) GetByID(invitationID string) (domain.Invitation, error) {
	return s.invitationRepo.GetByID(invitationID)
}
func (s *invitationService) GetByCode(code string) (domain.Invitation, error) {
	return s.invitationRepo.GetByCode(code)
}
func (s *invitationService) ListByServer(serverID string) ([]domain.Invitation, error) {
	_, err := s.serverRepo.GetServerByID(serverID)
	if err != nil {
		return nil, domain.ErrServerNotFound
	}
	return s.invitationRepo.ListByServer(serverID)
}
func (s *invitationService) Preview(code string) (domain.Invitation, domain.Server, error) {
	i, err := s.invitationRepo.GetByCode(code)
	if err != nil {
		return domain.Invitation{}, domain.Server{}, domain.ErrInvitationNotFound
	}
	srv, err := s.serverRepo.GetServerByID(i.ServerID)
	if err != nil {
		return domain.Invitation{}, domain.Server{}, domain.ErrServerNotFound
	}
	return i, srv, nil
}

func (s *invitationService) Use(code, userID string) (domain.Invitation, error) {
	i, err := s.invitationRepo.GetByCode(code)
	if err != nil {
		return domain.Invitation{}, domain.ErrInvitationNotFound
	}
	if i.ExpiresAt != nil && i.ExpiresAt.Before(time.Now()) {
		return domain.Invitation{}, domain.ErrInvitationExpired
	}
	if i.MaxUses != nil && i.Uses >= *i.MaxUses {
		return domain.Invitation{}, domain.ErrInvitationMaxUsesReached
	}
	isMember, err := s.serverRepo.IsUserMember(i.ServerID, userID)
	if err != nil {
		return domain.Invitation{}, err
	}
	if isMember {
		return domain.Invitation{}, domain.ErrAlreadyMember
	}
	if err := s.invitationRepo.IncrementUses(i.ID); err != nil {
		return domain.Invitation{}, err
	}
	i.Uses = i.Uses + 1
	return i, nil
}
