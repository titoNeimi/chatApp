package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/adapters/input/http/middleware"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
)

type UserStatusHandler struct {
	statusService input.UserStatusService
}

func newUserStatusHandler(statusService input.UserStatusService) *UserStatusHandler {
	return &UserStatusHandler{statusService: statusService}
}

// SetMyStatus handles PUT /users/me/status
func (h *UserStatusHandler) SetMyStatus(c *echo.Context) error {
	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	var req dto.SetStatusRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.statusService.SetStatus(c.Request().Context(), userID, domain.UserStatusType(req.Status)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

// GetStatus handles GET /users/:userID/status
func (h *UserStatusHandler) GetStatus(c *echo.Context) error {
	// TODO: decide visibility rules — invisible users should appear offline to others (but not to themselves)
	// TODO: combine stored status with in-memory WS connection state for effective status
	userID := c.Param("userID")

	status, err := h.statusService.GetStatus(c.Request().Context(), userID)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, dto.UserStatusResponse{
		UserID:    status.UserID,
		Status:    string(status.Status),
		UpdatedAt: status.UpdatedAt,
	})
}
