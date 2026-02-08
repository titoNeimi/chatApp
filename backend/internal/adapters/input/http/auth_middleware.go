package handler

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"errors"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
)

const (
	AuthContextUserIDKey   = "auth_user_id"
	AuthContextUserRoleKey = "auth_user_role"
)

func RequireAuth(authService input.AuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			token, err := extractBearerToken(c.Request().Header.Get(echo.HeaderAuthorization))
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing or invalid authorization header")
			}

			claims, err := authService.ValidateAccessToken(c.Request().Context(), token)
			if err != nil {
				if errors.Is(err, domain.ErrInvalidToken) || errors.Is(err, domain.ErrExpiredToken) {
					return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
				}
				return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
			}

			c.Set(AuthContextUserIDKey, claims.UserID)
			c.Set(AuthContextUserRoleKey, claims.Role)

			return next(c)
		}
	}
}

func GetAuthenticatedUserID(c *echo.Context) (string, error) {
	userID, ok := c.Get(AuthContextUserIDKey).(string)
	if !ok || userID == "" {
		return "", domain.ErrInvalidToken
	}
	return userID, nil
}

func extractBearerToken(headerValue string) (string, error) {
	parts := strings.Fields(headerValue)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || strings.TrimSpace(parts[1]) == "" {
		return "", domain.ErrInvalidToken
	}

	return strings.TrimSpace(parts[1]), nil
}
