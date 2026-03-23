package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/adapters/input/http/middleware"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"net/http"

	"github.com/labstack/echo/v5"
)

type dmHandler struct {
	dmService input.DMService
}

func NewDmHandler(dmService input.DMService) *dmHandler {
	return &dmHandler{dmService: dmService}
}

func (h *dmHandler) FindOrCreateDMChannel(c *echo.Context) error {
	var dmRequest dto.DMCreateRequest

	if err := c.Bind(&dmRequest); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&dmRequest); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
	}

	channel, err := h.dmService.FindOrCreateDMChannel(c.Request().Context(), userID, dmRequest.TargetUserID)
	if err != nil {
		switch err {
		case domain.ErrDMYourself:
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusCreated, dto.DMChannelResponse{
		ID:        channel.ID,
		User1ID:   channel.User1ID,
		User2ID:   channel.User2ID,
		RoomID:    channel.RoomID,
		CreatedAt: channel.CreatedAt,
		UpdatedAt: channel.UpdatedAt,
		DeletedAt: channel.DeletedAt,
	})
}

func (h *dmHandler) ListDMChannelsForUser(c *echo.Context) error {
	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
	}

	channels, err := h.dmService.ListDMChannelsForUser(c.Request().Context(), userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	out := make([]dto.DMChannelResponse, 0, len(channels))
	for _, ch := range channels {
		out = append(out, dto.DMChannelResponse{
			ID:        ch.ID,
			User1ID:   ch.User1ID,
			User2ID:   ch.User2ID,
			RoomID:    ch.RoomID,
			CreatedAt: ch.CreatedAt,
			UpdatedAt: ch.UpdatedAt,
			DeletedAt: ch.DeletedAt,
		})
	}

	return c.JSON(http.StatusOK, dto.DMChannelListResponse{Channels: out})
}
