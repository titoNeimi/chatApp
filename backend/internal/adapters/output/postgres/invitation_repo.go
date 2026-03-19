package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"

	"gorm.io/gorm"
)

type InvitationRepo struct {
	db *gorm.DB
}

func NewInvitationRepo(db *gorm.DB) *InvitationRepo {
	return &InvitationRepo{db: db}
}

func (r *InvitationRepo) Create(invitation domain.Invitation) (domain.Invitation, error) {
	invitationData := models.InvitationFromDomain(&invitation)

	err := r.db.Create(&invitationData).Error
	if err != nil {
		return domain.Invitation{}, err
	}

	return *invitationData.ToDomain(), nil
}

func (r *InvitationRepo) Delete(invitationID string) error {
	result := r.db.Delete(&models.Invitation{}, "id = ?", invitationID)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return domain.ErrInvitationNotFound
	}

	return nil
}

func (r *InvitationRepo) GetByID(invitationID string) (domain.Invitation, error) {
	var invitation models.Invitation

	err := r.db.First(&invitation, "id = ?", invitationID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Invitation{}, domain.ErrInvitationNotFound
		}
		return domain.Invitation{}, err
	}

	return *invitation.ToDomain(), nil
}

func (r *InvitationRepo) GetByCode(code string) (domain.Invitation, error) {
	var invitation models.Invitation

	err := r.db.First(&invitation, "code = ?", code).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return domain.Invitation{}, domain.ErrInvitationNotFound
		}
		return domain.Invitation{}, err
	}

	return *invitation.ToDomain(), nil
}

func (r *InvitationRepo) ListByServer(serverID string) ([]domain.Invitation, error) {
	var invitations []models.Invitation

	err := r.db.Find(&invitations, "server_id = ?", serverID).Error
	if err != nil {
		return nil, err
	}

	out := make([]domain.Invitation, 0, len(invitations))
	for _, i := range invitations {
		out = append(out, *i.ToDomain())
	}

	return out, nil
}

func (r *InvitationRepo) IncrementUses(invitationID string) error {
	result := r.db.Model(&models.Invitation{}).
		Where("id = ?", invitationID).
		UpdateColumn("uses", gorm.Expr("uses + 1"))
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrInvitationNotFound
	}
	return nil
}
