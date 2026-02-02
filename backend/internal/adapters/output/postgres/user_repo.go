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

func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	query := `SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)`
	var exists bool
	if err := r.db.QueryRowContext(ctx, query, email).Scan(&exists); err != nil {
		return false, err
	}
	return exists, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	query := `
		SELECT id, username, email, password_hash, role, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var user domain.User

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password_hash,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return &user, nil
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
	query := `
		SELECT id, username, email, password_hash, role, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	var user domain.User
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password_hash,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrUserNotFound
		}
		fmt.Println(err)
		return nil, err
	}
	return &user, nil
}
func (r *UserRepository) GetAll(ctx context.Context) ([]domain.User, error) {
	query := `
		SELECT id, username, email, password_hash, role, created_at, updated_at
		FROM users
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		fmt.Println(err.Error())
		return nil, err
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		var user domain.User
		if err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.Password_hash,
			&user.Role,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			fmt.Println(err.Error())
			return nil, err
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		fmt.Println(err.Error())
		return nil, err
	}

	return users, nil
}
