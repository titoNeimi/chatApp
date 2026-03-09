package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/adapters/input/http/validation"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v5"
)

type RoomHandler struct {
	RoomService input.RoomService
}

func NewRoomHandler(roomService input.RoomService) *RoomHandler {
	return &RoomHandler{RoomService: roomService}
}

func (h *RoomHandler) Create(c *echo.Context) error {
	var roomData dto.RoomCreateRequest
	if err := c.Bind(&roomData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&roomData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	room := domain.Room{
		Type:        domain.DIRECT_MESSAGE,
		Name:        roomData.Name,
		Description: roomData.Description,
	}

	newRoom, err := h.RoomService.Create(room)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, newRoom)
}
func (h *RoomHandler) CreateForServer(c *echo.Context) error {

	serverID := c.Param("serverID")

	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
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
		IsPrivate:   roomData.IsPrivate,
	}

	newRoom, err := h.RoomService.CreateForServer(room)
	if err != nil {
		switch err {
		case domain.ErrServerNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}
	return c.JSON(http.StatusCreated, newRoom)
}
func (h *RoomHandler) Update(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
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
	if err := validation.IsValidID(id); err != nil {
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
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.RoomService.SoftDelete(roomID); err != nil {
		switch err {
		case domain.ErrRoomNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusOK, fmt.Sprintf("roomID= %s has been softDeleted", roomID))
}
func (h *RoomHandler) ListByServer(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	rooms, err := h.RoomService.ListByServer(serverID)

	if err != nil {
		switch err {
		case domain.ErrServerNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	returnData := make([]dto.RoomResponse, 0, len(rooms))
	for _, roomData := range rooms {
		newData := dto.RoomResponse{
			ID:          roomData.ID,
			Description: roomData.Description,
			CreatedAt:   roomData.CreatedAt,
			UpdatedAt:   roomData.UpdatedAt,
			Type:        roomData.Type,
			ServerID:    roomData.ServerID,
			IsPrivate:   roomData.IsPrivate,
			DeletedAt:   &roomData.DeletedAt.Time,
			Name:        roomData.Name,
		}
		returnData = append(returnData, newData)
	}

	return c.JSON(http.StatusOK, returnData)
}
func (h *RoomHandler) UpdateInServer(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
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
		case domain.ErrServerNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		case domain.ErrRoomNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusOK, room)
}
func (h *RoomHandler) SoftDeleteInServer(c *echo.Context) error {
	serverID := c.Param("serverID")
	if err := validation.IsValidID(serverID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	err := h.RoomService.SoftDeleteInServer(roomID, serverID)

	if err != nil {
		switch err {
		case domain.ErrServerNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		case domain.ErrRoomNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}
	return c.JSON(http.StatusOK, fmt.Sprintf("roomID= %s with serverID = %s has been softDeleted", roomID, serverID))
}

func (h *RoomHandler) AddUserToRoom(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Param("userID")
	if err := validation.IsValidID(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.RoomService.AddUserToRoom(roomID, userID); err != nil {
		switch err {
		case domain.ErrRoomNotFound, domain.ErrUserNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusCreated, fmt.Sprintf("userID= %s added to roomID= %s", userID, roomID))
}

func (h *RoomHandler) RemoveUserFromRoom(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID := c.Param("userID")
	if err := validation.IsValidID(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.RoomService.RemoveUserFromRoom(roomID, userID); err != nil {
		switch err {
		case domain.ErrRoomNotFound, domain.ErrUserNotFound, domain.ErrRoomMembershipNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusOK, fmt.Sprintf("userID= %s removed from roomID= %s", userID, roomID))
}

func (h *RoomHandler) ListMembersByRoom(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	roomMembers, err := h.RoomService.ListMembersByRoom(roomID)

	if err != nil {
		switch err {
		case domain.ErrRoomNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusOK, roomMembers)
}

func (h *RoomHandler) GetMyMembership(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := GetAuthenticatedUserID(c)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	userData, err := h.RoomService.GetMyMembership(roomID, userID)
	if err != nil {
		switch err {
		case domain.ErrRoomMembershipNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}
	
	return c.JSON(http.StatusOK, userData)
}

func (h *RoomHandler) UpdateLastRead(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var body dto.UpdateLastReadRequest
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	if err := h.RoomService.UpdateLastRead(roomID, userID, body.MessageID); err != nil {
		switch err {
		case domain.ErrRoomMembershipNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.NoContent(http.StatusNoContent)
}
