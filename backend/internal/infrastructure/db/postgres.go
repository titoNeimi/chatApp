package db

import (
	"fmt"
	"log/slog"
	"os"

	"chatApp/internal/adapters/output/postgres/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_PORT"),
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_DB"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		slog.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}

	migrations := []struct {
		name  string
		model any
	}{
		{"User", &models.User{}},
		{"Server", &models.Server{}},
		{"Room", &models.Room{}},
		{"Message", &models.Message{}},
		{"RoomUsers", &models.RoomUsers{}},
		{"RefreshToken", &models.RefreshToken{}},
		{"ServerUsers", &models.ServerUsers{}},
		{"ServerRoles", &models.ServerRoles{}},
		{"ServerUserRoles", &models.ServerUserRoles{}},
		{"ServerBan", &models.ServerBan{}},
		{"RoomPermissionOverrides", &models.RoomPermissionOverrides{}},
		{"Invitation", &models.Invitation{}},
		{"DirectMessages", &models.DirectMessageChannel{}},
		{"Friendship", &models.Friendship{}},
	}

	for _, m := range migrations {
		if err := db.AutoMigrate(m.model); err != nil {
			slog.Error("failed to migrate model", "model", m.name, "error", err)
			os.Exit(1)
		}
	}

	sqlDB, err := db.DB()
	if err != nil {
		slog.Error("failed to get sql.DB from gorm", "error", err)
		os.Exit(1)
	}
	if err := sqlDB.Ping(); err != nil {
		slog.Error("database ping failed", "error", err)
		os.Exit(1)
	}

	slog.Info("database connected successfully")
	return db
}
