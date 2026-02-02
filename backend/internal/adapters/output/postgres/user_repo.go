package postgres

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/output"
	"context"
	"database/sql"
	"fmt"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) output.UserRepository {
	return &UserRepository{db: db}
}

// ExistsByEmail implements [output.UserRepository].
func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	panic("unimplemented")
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	panic("unimplemented")
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, role, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		user.Username,
		user.Email,
		user.Password_hash,
	).Scan(&user.ID, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	return nil, nil
}
