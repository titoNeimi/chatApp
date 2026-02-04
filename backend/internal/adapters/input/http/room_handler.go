package handler

import (
	"chatApp/internal/adapters/input/http/dto"
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
	return echo.NewHTTPError(http.StatusInternalServerError, "not implemented")
}
func (h *RoomHandler) GetByID(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "not implemented")
}
func (h *RoomHandler) SoftDelete(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "not implemented")
}
func (h *RoomHandler) ListByServer(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "not implemented")
}
func (h *RoomHandler) UpdateInServer(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "not implemented")
}
func (h *RoomHandler) SoftDeleteInServer(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "not implemented")
}
