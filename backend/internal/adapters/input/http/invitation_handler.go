package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/adapters/input/http/middleware"
	"chatApp/internal/adapters/input/http/validation"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"net/http"

	"github.com/labstack/echo/v5"
)

type invitationHandler struct {
	invitationService input.InvitationService
	serverService     input.ServerService
}

func NewInvitationHandler(invitationService input.InvitationService, serverService input.ServerService) *invitationHandler {
	return &invitationHandler{invitationService: invitationService, serverService: serverService}
}

func (h *invitationHandler) Create(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	var body dto.InvitationCreateRequest
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	inv, err := h.invitationService.Create(input.CreateInvitationInput{
		ServerID:  serverID,
		CreatedBy: userID,
		MaxUses:   body.MaxUses,
		ExpiresAt: body.ExpiresAt,
	})
	if err != nil {
		switch err {
		case domain.ErrServerNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusCreated, buildInvitationResponse(inv))
}

func (h *invitationHandler) Delete(c *echo.Context) error {
	invitationID := c.Param("invitationID")
	if err := validation.IsValidID(invitationID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.invitationService.Delete(invitationID); err != nil {
		switch err {
		case domain.ErrInvitationNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *invitationHandler) ListByServer(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	invitations, err := h.invitationService.ListByServer(serverID)
	if err != nil {
		switch err {
		case domain.ErrServerNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	result := make([]dto.InvitationResponse, 0, len(invitations))
	for _, inv := range invitations {
		result = append(result, buildInvitationResponse(inv))
	}
	return c.JSON(http.StatusOK, result)
}

func (h *invitationHandler) Use(c *echo.Context) error {
	code := c.Param("code")

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	inv, err := h.invitationService.Use(code)
	if err != nil {
		switch err {
		case domain.ErrInvitationNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		case domain.ErrInvitationExpired:
			return echo.NewHTTPError(http.StatusGone, err.Error())
		case domain.ErrInvitationMaxUsesReached:
			return echo.NewHTTPError(http.StatusGone, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	if err := h.serverService.JoinServer(inv.ServerID, userID); err != nil {
		switch err {
		case domain.ErrServerNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.NoContent(http.StatusNoContent)
}

func buildInvitationResponse(inv domain.Invitation) dto.InvitationResponse {
	return dto.InvitationResponse{
		ID:        inv.ID,
		ServerID:  inv.ServerID,
		CreatedBy: inv.CreatedBy,
		Code:      inv.Code,
		MaxUses:   inv.MaxUses,
		Uses:      inv.Uses,
		ExpiresAt: inv.ExpiresAt,
		CreatedAt: inv.CreatedAt,
	}
}
