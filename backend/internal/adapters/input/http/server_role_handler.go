package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/adapters/input/http/middleware"
	"chatApp/internal/adapters/input/http/validation"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
)

type serverRoleHandler struct {
	roleService input.ServerRoleService
}

func NewServerRoleHandler(roleService input.ServerRoleService) *serverRoleHandler {
	return &serverRoleHandler{roleService: roleService}
}

func roleToResponse(r domain.ServerRole) dto.RoleResponse {
	return dto.RoleResponse{
		ID:                r.ID,
		ServerID:          r.ServerID,
		Name:              r.Name,
		CanDeleteMessages: r.CanDeleteMessages,
		CanMuteMembers:    r.CanMuteMembers,
		CanManageMembers:  r.CanManageMembers,
		CanManageRooms:    r.CanManageRooms,
		CanSendMessages:   r.CanSendMessages,
		DisplaySeparately: r.DisplaySeparately,
		CreatedAt:         r.CreatedAt,
		UpdatedAt:         r.UpdatedAt,
	}
}

func (h *serverRoleHandler) CreateRole(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var body dto.CreateRoleRequest
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(&body); err != nil {
		return err
	}

	perms := domain.ServerRole{
		CanDeleteMessages: body.CanDeleteMessages,
		CanMuteMembers:    body.CanMuteMembers,
		CanManageMembers:  body.CanManageMembers,
		CanManageRooms:    body.CanManageRooms,
		CanSendMessages:   body.CanSendMessages,
		DisplaySeparately: body.DisplaySeparately,
	}

	role, err := h.roleService.CreateRole(serverID, body.Name, perms)
	if err != nil {
		if errors.Is(err, domain.ErrServerRoleAlreadyExists) {
			return echo.NewHTTPError(http.StatusConflict, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	return c.JSON(http.StatusCreated, roleToResponse(role))
}

func (h *serverRoleHandler) GetRole(c *echo.Context) error {
	roleID := c.Param("roleID")
	if err := validation.IsValidID(roleID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	role, err := h.roleService.GetRole(roleID)
	if err != nil {
		if errors.Is(err, domain.ErrServerRoleNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	return c.JSON(http.StatusOK, roleToResponse(role))
}

func (h *serverRoleHandler) ListRoles(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	roles, err := h.roleService.ListRoles(serverID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	out := make([]dto.RoleResponse, 0, len(roles))
	for _, role := range roles {
		out = append(out, roleToResponse(role))
	}

	return c.JSON(http.StatusOK, out)
}

func (h *serverRoleHandler) UpdateRole(c *echo.Context) error {
	roleID := c.Param("roleID")
	if err := validation.IsValidID(roleID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var updates dto.UpdateRoleRequest

	if err := c.Bind(&updates); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&updates); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	newRole, err := h.roleService.UpdateRole(roleID, buildUpdatesFromDTO(updates))
	if err != nil {
		if errors.Is(err, domain.ErrServerRoleNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	return c.JSON(http.StatusOK, roleToResponse(newRole))
}

func (h *serverRoleHandler) DeleteRole(c *echo.Context) error {
	roleID := c.Param("roleID")
	if err := validation.IsValidID(roleID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.roleService.DeleteRole(roleID); err != nil {
		if errors.Is(err, domain.ErrServerRoleNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *serverRoleHandler) AssignRole(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var requestData dto.AssignRoleRequest
	if err := c.Bind(&requestData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(&requestData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	err := h.roleService.AssignRole(serverID, requestData.UserID, requestData.RoleID)
	if err != nil {
		if errors.Is(err, domain.ErrServerRoleNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *serverRoleHandler) RevokeRole(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var revokeRequestData dto.AssignRoleRequest

	if err := c.Bind(&revokeRequestData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(&revokeRequestData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	err := h.roleService.RevokeRole(serverID, revokeRequestData.UserID, revokeRequestData.RoleID)
	if err != nil {
		if errors.Is(err, domain.ErrServerRoleNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *serverRoleHandler) ListUsersWithRoles(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	users, err := h.roleService.ListUsersWithRoles(serverID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	type userResponse struct {
		UserID   string           `json:"user_id"`
		Username string           `json:"username"`
		Roles    []dto.RoleResponse `json:"roles"`
	}

	out := make([]userResponse, 0, len(users))
	for _, u := range users {
		roles := make([]dto.RoleResponse, 0, len(u.Roles))
		for _, r := range u.Roles {
			roles = append(roles, roleToResponse(r))
		}
		out = append(out, userResponse{UserID: u.UserID, Username: u.Username, Roles: roles})
	}

	return c.JSON(http.StatusOK, out)
}

func (h *serverRoleHandler) BanUser(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	actorID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	var body dto.BanUserRequest
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	ban, err := h.roleService.BanUser(serverID, body.UserID, actorID, body.Reason)
	if err != nil {
		if errors.Is(err, domain.ErrUserAlreadyBanned) {
			return echo.NewHTTPError(http.StatusConflict, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	return c.JSON(http.StatusCreated, dto.BanResponse{
		ID:       ban.ID,
		ServerID: ban.ServerID,
		UserID:   ban.UserID,
		BannedBy: ban.BannedBy,
		Reason:   ban.Reason,
		BannedAt: ban.BannedAt,
	})
}

func (h *serverRoleHandler) UnbanUser(c *echo.Context) error {
	serverID := c.Param("serverID")
	userID := c.Param("userID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := validation.IsValidID(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.roleService.UnbanUser(serverID, userID); err != nil {
		if errors.Is(err, domain.ErrServerBanNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *serverRoleHandler) ListBans(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	bans, err := h.roleService.ListBans(serverID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	out := make([]dto.BanResponse, 0, len(bans))
	for _, ban := range bans {
		out = append(out, dto.BanResponse{
			ID:       ban.ID,
			ServerID: ban.ServerID,
			UserID:   ban.UserID,
			BannedBy: ban.BannedBy,
			Reason:   ban.Reason,
			BannedAt: ban.BannedAt,
		})
	}

	return c.JSON(http.StatusOK, out)
}
