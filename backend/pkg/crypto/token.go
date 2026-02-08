package crypto

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
)

func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func ValidateTokenHash(token, tokenHash string) bool {
	computedHash := HashToken(token)
	return subtle.ConstantTimeCompare([]byte(computedHash), []byte(tokenHash)) == 1
}
