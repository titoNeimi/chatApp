package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/adapters/input/http/validation"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
)

type permissionHandler struct {
	permService input.PermissionService
}

func NewPermissionHandler(permService input.PermissionService) *permissionHandler {
	return &permissionHandler{permService: permService}
}

func overrideToResponse(o domain.RoomPermissionOverride) dto.OverrideResponse {
	return dto.OverrideResponse{
		ID:                o.ID,
		RoomID:            o.RoomID,
		RoleID:            o.RoleID,
		UserID:            o.UserID,
		CanDeleteMessages: o.CanDeleteMessages,
		CanMuteMembers:    o.CanMuteMembers,
		CanManageMembers:  o.CanManageMembers,
		CanManageRooms:    o.CanManageRooms,
		CreatedAt:         o.CreatedAt,
		UpdatedAt:         o.UpdatedAt,
	}
}

func (h *permissionHandler) UpsertOverride(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var body dto.UpsertOverrideRequest
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	override := domain.RoomPermissionOverride{
		RoomID:            roomID,
		RoleID:            body.RoleID,
		UserID:            body.UserID,
		CanDeleteMessages: body.CanDeleteMessages,
		CanMuteMembers:    body.CanMuteMembers,
		CanManageMembers:  body.CanManageMembers,
		CanManageRooms:    body.CanManageRooms,
	}

	result, err := h.permService.UpsertRoomOverride(override)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	return c.JSON(http.StatusOK, overrideToResponse(result))
}

func (h *permissionHandler) DeleteOverride(c *echo.Context) error {
	overrideID := c.Param("overrideID")
	if err := validation.IsValidID(overrideID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.permService.DeleteRoomOverride(overrideID); err != nil {
		if errors.Is(err, domain.ErrPermissionOverrideNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *permissionHandler) ListOverrides(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	overrides, err := h.permService.ListRoomOverrides(roomID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	out := make([]dto.OverrideResponse, 0, len(overrides))
	for _, o := range overrides {
		out = append(out, overrideToResponse(o))
	}

	return c.JSON(http.StatusOK, out)
}
