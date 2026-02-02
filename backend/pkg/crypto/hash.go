package crypto

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

const COST = 14

func HashPassword(password string) (hashedPassword string, error error) {
	if password == "" {
		return "", errors.New("invalid password")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), COST)
	if err != nil {
		return "", err
	}

	return string(hash), nil
}

func ValidatePassword(password, hashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))

	if err != nil {
		return false
	}

	return true
}
