package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	valaidation "chatApp/internal/adapters/input/http/validation"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
)

type RoomHandler struct {
	RoomService input.RoomService
}

func NewRoomHandler(roomService input.RoomService) *RoomHandler {
	return &RoomHandler{RoomService: roomService}
}

func (h *RoomHandler) Create(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "not implemented")
}
func (h *RoomHandler) CreateForServer(c *echo.Context) error {

	serverID := c.Param("serverID")

	if strings.TrimSpace(serverID) == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "serverID invalido")
	}

	var roomData dto.RoomCreateRequest

	if err := c.Bind(&roomData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&roomData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	room := domain.Room{
		ServerID:    &serverID,
		Type:        domain.SERVER,
		Name:        roomData.Name,
		Description: roomData.Description,
	}

	newRoom, err := h.RoomService.CreateForServer(room)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, newRoom)
}
func (h *RoomHandler) Update(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := valaidation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var updatesData dto.RoomUpdateRequest
	if err := c.Bind(&updatesData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&updatesData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	updates := buildUpdatesFromDTO(updatesData)
	if len(updates) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "no fields to update")
	}

	room, err := h.RoomService.Update(roomID, updates)
	if err != nil {
		switch err {
		case domain.ErrRoomNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusOK, room)
}
func (h *RoomHandler) GetByID(c *echo.Context) error {

	id := c.Param("roomID")
	if err := valaidation.IsValidID(id); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	room, err := h.RoomService.GetByID(id)

	if err != nil {
		switch err {
		case domain.ErrRoomNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusOK, room)
}

func (h *RoomHandler) SoftDelete(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "not implemented")
}
func (h *RoomHandler) ListByServer(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "not implemented")
}
func (h *RoomHandler) UpdateInServer(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := valaidation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	roomID := c.Param("roomID")
	if err := valaidation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var updatesData dto.RoomUpdateRequest
	if err := c.Bind(&updatesData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&updatesData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	updates := buildUpdatesFromDTO(updatesData)
	if len(updates) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "no fields to update")
	}

	room, err := h.RoomService.UpdateInServer(serverID, roomID, updates)
	if err != nil {
		switch err {
		case domain.ErrRoomNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusOK, room)
}
func (h *RoomHandler) SoftDeleteInServer(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "not implemented")
}
