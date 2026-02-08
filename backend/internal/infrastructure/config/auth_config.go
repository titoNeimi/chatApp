package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"
)

type AuthConfig struct {
	AccessSecret  string
	RefreshSecret string
	AccessTTL     time.Duration
	RefreshTTL    time.Duration
	Issuer        string
}

func LoadAuthConfigFromEnv() (AuthConfig, error) {
	legacySecret := os.Getenv("JWT_SECRET")
	accessSecret := os.Getenv("JWT_ACCESS_SECRET")
	refreshSecret := os.Getenv("JWT_REFRESH_SECRET")

	if accessSecret == "" {
		accessSecret = legacySecret
	}
	if refreshSecret == "" {
		refreshSecret = legacySecret
	}
	if accessSecret == "" || refreshSecret == "" {
		return AuthConfig{}, errors.New("missing JWT secrets")
	}

	accessTTL, err := loadIntEnv("JWT_ACCESS_TTL_MIN", 15)
	if err != nil {
		return AuthConfig{}, fmt.Errorf("invalid JWT_ACCESS_TTL_MIN: %w", err)
	}

	refreshTTL, err := loadIntEnv("JWT_REFRESH_TTL_HOURS", 168)
	if err != nil {
		return AuthConfig{}, fmt.Errorf("invalid JWT_REFRESH_TTL_HOURS: %w", err)
	}

	issuer := os.Getenv("JWT_ISSUER")
	if issuer == "" {
		issuer = "chatApp"
	}

	return AuthConfig{
		AccessSecret:  accessSecret,
		RefreshSecret: refreshSecret,
		AccessTTL:     time.Duration(accessTTL) * time.Minute,
		RefreshTTL:    time.Duration(refreshTTL) * time.Hour,
		Issuer:        issuer,
	}, nil
}

func loadIntEnv(key string, fallback int) (int, error) {
	rawValue := os.Getenv(key)
	if rawValue == "" {
		return fallback, nil
	}

	parsedValue, err := strconv.Atoi(rawValue)
	if err != nil {
		return 0, err
	}
	if parsedValue <= 0 {
		return 0, errors.New("value must be positive")
	}

	return parsedValue, nil
}
