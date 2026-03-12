package middleware

import (
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"chatApp/internal/ports/output"
	"net/http"

	"github.com/labstack/echo/v5"
)

// extractAuth returns userID and role from the JWT context.
func extractAuth(c *echo.Context) (userID, role string, err error) {
	role, err = GetAuthenticatedUserRole(c)
	if err != nil {
		return "", "", err
	}
	userID, err = GetAuthenticatedUserID(c)
	if err != nil {
		return "", "", err
	}
	return userID, role, nil
}

// checkPermission resolves permissions and verifies the user has the required one.
func checkPermission(permService input.PermissionService, serverID, roomID, userID, perm string) error {
	perms, err := permService.ResolvePermissions(serverID, roomID, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}
	if !perms.HasPermission(perm) {
		return echo.NewHTTPError(http.StatusForbidden, "insufficient permissions")
	}
	return nil
}

// RequireServerMember — user must belong to the server
func RequireServerMember(serverRepo output.ServerRepository) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			userID, role, err := extractAuth(c)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
			}
			if role == domain.RoleAdmin {
				return next(c)
			}
			serverID := c.Param("serverID")
			if serverID == "" {
				return echo.NewHTTPError(http.StatusBadRequest, "missing serverID")
			}
			isMember, err := serverRepo.IsUserMember(serverID, userID)
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
			}
			if !isMember {
				return echo.NewHTTPError(http.StatusForbidden, "you are not a member of this server")
			}
			return next(c)
		}
	}
}

// RequireServerPermission — user must have the given permission on the server
func RequireServerPermission(permService input.PermissionService, perm string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			userID, role, err := extractAuth(c)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
			}
			if role == domain.RoleAdmin {
				return next(c)
			}
			serverID := c.Param("serverID")
			if serverID == "" {
				return echo.NewHTTPError(http.StatusBadRequest, "missing serverID")
			}
			if err := checkPermission(permService, serverID, "", userID, perm); err != nil {
				return err
			}
			return next(c)
		}
	}
}

// RequireRoomPermission — user must have the given permission in the room
func RequireRoomPermission(permService input.PermissionService, perm string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			userID, role, err := extractAuth(c)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
			}
			if role == domain.RoleAdmin {
				return next(c)
			}
			serverID := c.Param("serverID")
			roomID := c.Param("roomID")
			if serverID == "" || roomID == "" {
				return echo.NewHTTPError(http.StatusBadRequest, "missing serverID or roomID")
			}
			if err := checkPermission(permService, serverID, roomID, userID, perm); err != nil {
				return err
			}
			return next(c)
		}
	}
}
