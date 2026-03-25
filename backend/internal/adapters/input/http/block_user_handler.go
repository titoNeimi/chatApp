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

type blockUserHandler struct {
	blockService input.BlockUserService
}

func newBlockUserHandler(blockService input.BlockUserService) *blockUserHandler {
	return &blockUserHandler{blockService: blockService}
}

func buildBlockedUserResponse(b *domain.BlockedUser) *dto.BlockedUserResponse {
	if b == nil {
		return nil
	}
	return &dto.BlockedUserResponse{
		BlockedUserID: b.BlockedUserID,
		CreatedAt:     b.CreatedAt,
	}
}

func (h *blockUserHandler) Block(c *echo.Context) error {
	var body dto.BlockUserBody

	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	b, err := h.blockService.Block(userID, body.UserID)
	if err != nil {
		switch err {
		case domain.ErrCannotBlockYourself:
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		case domain.ErrAlreadyBlocked:
			return echo.NewHTTPError(http.StatusConflict, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusCreated, buildBlockedUserResponse(b))
}

func (h *blockUserHandler) Unblock(c *echo.Context) error {
	blockedID := c.Param("userID")
	if err := validation.IsValidID(blockedID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	if err := h.blockService.Unblock(userID, blockedID); err != nil {
		switch err {
		case domain.ErrNotBlocked:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *blockUserHandler) ListBlocked(c *echo.Context) error {
	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	blocked, err := h.blockService.ListBlockedUsers(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	out := make([]dto.BlockedUserResponse, 0, len(blocked))
	for _, b := range blocked {
		out = append(out, *buildBlockedUserResponse(&b))
	}

	return c.JSON(http.StatusOK, out)
}
