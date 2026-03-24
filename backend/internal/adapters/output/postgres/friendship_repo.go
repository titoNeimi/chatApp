package postgres

import (
	"chatApp/internal/adapters/output/postgres/models"
	"chatApp/internal/domain"
	"errors"
	"time"

	"gorm.io/gorm"
)

type friendshipRepo struct {
	db *gorm.DB
}

func NewFriendshipRepo(db *gorm.DB) *friendshipRepo {
	return &friendshipRepo{db: db}
}

func (r *friendshipRepo) Create(requesterID, addresseeID string) (*domain.Friendship, error) {
	friendship := models.Friendship{
		RequesterID: requesterID,
		AddresseeID: addresseeID,
		Status:      domain.FriendshipPending,
	}

	if err := r.db.Create(&friendship).Error; err != nil {
		return nil, err
	}

	return friendship.ToDomain(), nil
}

func (r *friendshipRepo) GetByID(id string) (*domain.Friendship, error) {
	var friendship models.Friendship

	result := r.db.First(&friendship, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, domain.ErrFriendshipNotFound
		}
		return nil, result.Error
	}

	return friendship.ToDomain(), nil
}

func (r *friendshipRepo) GetBetween(userA, userB string) (*domain.Friendship, error) {
	var friendship models.Friendship
	result := r.db.Where(
		"(requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
		userA, userB, userB, userA,
	).First(&friendship)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, domain.ErrFriendshipNotFound
		}
		return nil, result.Error
	}

	return friendship.ToDomain(), nil
}

func (r *friendshipRepo) UpdateStatus(id, status string) error {
	result := r.db.Model(&models.Friendship{}).Where("id = ?", id).Update("status", status)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrFriendshipNotFound
	}
	return nil
}

func (r *friendshipRepo) Delete(id string) error {
	result := r.db.Delete(&models.Friendship{}, "id = ?", id)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return domain.ErrFriendshipNotFound
	}

	return nil
}

type friendRow struct {
	FriendshipID string    `gorm:"column:friendship_id"`
	Since        time.Time `gorm:"column:since"`
	UserID       string    `gorm:"column:user_id"`
	Username     string    `gorm:"column:username"`
	Email        string    `gorm:"column:email"`
	Role         string    `gorm:"column:role"`
}

func (r *friendshipRepo) ListFriends(userID string) ([]domain.FriendEntry, error) {
	var rows []friendRow
	err := r.db.Raw(`
		SELECT f.id AS friendship_id, f.created_at AS since,
		       u.id AS user_id, u.username, u.email, u.role
		FROM friendships f
		JOIN users u ON u.id = CASE
		    WHEN f.requester_id = ? THEN f.addressee_id
		    ELSE f.requester_id
		END
		WHERE (f.requester_id = ? OR f.addressee_id = ?)
		  AND f.status = 'accepted'
	`, userID, userID, userID).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	entries := make([]domain.FriendEntry, 0, len(rows))
	for _, row := range rows {
		entries = append(entries, domain.FriendEntry{
			FriendshipID: row.FriendshipID,
			Friend: domain.User{
				ID:       row.UserID,
				Username: row.Username,
				Email:    row.Email,
				Role:     row.Role,
			},
			Since: row.Since,
		})
	}
	return entries, nil
}

func (r *friendshipRepo) ListPendingIncoming(userID string) ([]domain.PendingRequest, error) {
	var rows []friendRow
	err := r.db.Raw(`
		SELECT f.id AS friendship_id, f.created_at AS since,
		       u.id AS user_id, u.username, u.email, u.role
		FROM friendships f
		JOIN users u ON u.id = f.requester_id
		WHERE f.addressee_id = ?
		  AND f.status = 'pending'
	`, userID).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	requests := make([]domain.PendingRequest, 0, len(rows))
	for _, row := range rows {
		requests = append(requests, domain.PendingRequest{
			FriendshipID: row.FriendshipID,
			FromUser: domain.User{
				ID:       row.UserID,
				Username: row.Username,
				Email:    row.Email,
				Role:     row.Role,
			},
			SentAt: row.Since,
		})
	}
	return requests, nil
}
