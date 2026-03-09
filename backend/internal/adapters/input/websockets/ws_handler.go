package websockets

import (
	"chatApp/internal/adapters/input/http/validation"
	"chatApp/internal/ports/input"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v5"
)

type WSHandler struct {
	registry    *HubRegistry
	authService input.AuthService
	roomService input.RoomService
}

func NewWSHandler(registry *HubRegistry, authService input.AuthService, roomService input.RoomService) *WSHandler {
	return &WSHandler{registry: registry, authService: authService, roomService: roomService}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // allow all origins for now
	},
}

func (h *WSHandler) HandleRoom(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if _, err := h.roomService.GetByID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	token := c.QueryParam("token")
	claims, err := h.authService.ValidateAccessToken(c.Request().Context(), token)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
	}

	if _, err := h.roomService.GetMyMembership(roomID, claims.UserID); err != nil {
		return echo.NewHTTPError(http.StatusForbidden, "not a member of this room")
	}

	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	hub := h.registry.GetOrCreate(roomID)

	client := &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: claims.UserID,
	}

	hub.register <- client

	go client.readPump()
	go client.writePump()

	return nil
}
