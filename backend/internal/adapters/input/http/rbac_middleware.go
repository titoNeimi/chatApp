package handler

import (
	"chatApp/internal/domain"
	"net/http"
	"slices"

	"github.com/labstack/echo/v5"
)

func RequireRoles(allowedRoles ...string) echo.MiddlewareFunc {
	allowed := append([]string(nil), allowedRoles...)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			role, err := GetAuthenticatedUserRole(c)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
			}

			if !slices.Contains(allowed, role) {
				return echo.NewHTTPError(http.StatusForbidden, "forbidden")
			}

			return next(c)
		}
	}
}

func RequireSelfOrAdmin(paramName string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			authUserID, err := GetAuthenticatedUserID(c)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
			}

			role, err := GetAuthenticatedUserRole(c)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
			}

			targetUserID := c.Param(paramName)
			if authUserID != targetUserID && role != domain.RoleAdmin {
				return echo.NewHTTPError(http.StatusForbidden, "forbidden")
			}

			return next(c)
		}
	}
}

func GetAuthenticatedUserRole(c *echo.Context) (string, error) {
	role, ok := c.Get(AuthContextUserRoleKey).(string)
	if !ok || role == "" {
		return "", domain.ErrInvalidToken
	}
	return role, nil
}
