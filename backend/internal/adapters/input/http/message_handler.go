package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/adapters/input/http/middleware"
	"chatApp/internal/adapters/input/http/validation"
	"chatApp/internal/adapters/input/websockets"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v5"
)

type MessageHandler struct {
	messageService    input.MessageService
	roomService       input.RoomService
	permissionService input.PermissionService
	wsRegistry        *websockets.HubRegistry
}

func newMessageHandler(messageService input.MessageService, roomService input.RoomService, permissionService input.PermissionService, wsRegistry *websockets.HubRegistry) *MessageHandler {
	return &MessageHandler{
		messageService:    messageService,
		roomService:       roomService,
		permissionService: permissionService,
		wsRegistry:        wsRegistry,
	}
}

func (h *MessageHandler) Create(c *echo.Context) error {
	var data dto.MessageCreateRequest

	if err := c.Bind(&data); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&data); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := validation.IsValidID(data.RoomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	room, err := h.roomService.GetByID(data.RoomID)
	if err != nil {
		switch err {
		case domain.ErrRoomNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
	}

	userRole, err := middleware.GetAuthenticatedUserRole(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
	}

	if room.IsReadOnly && userRole != domain.RoleAdmin && room.ServerID != nil {
		perms, err := h.permissionService.ResolvePermissions(*room.ServerID, room.ID, userID)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
		}
		if !perms.CanSendMessages {
			return echo.NewHTTPError(http.StatusForbidden, "this room is read-only")
		}
	}

	message, err := h.messageService.Create(input.CreateMessageInput{
		Content:          data.Content,
		UserID:           userID,
		ReplyToMessageID: data.ReplyToMessageID,
		RoomID:           data.RoomID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	payload, err := json.Marshal(websockets.Event{
		Type:    websockets.EventMessageNew,
		Payload: message,
	})
	if err == nil {
		h.wsRegistry.Broadcast(message.RoomID, payload)
	}

	return c.JSON(http.StatusCreated, message)
}

func (h *MessageHandler) SoftDelete(c *echo.Context) error {
	messageID := c.Param("messageID")
	if err := validation.IsValidID(messageID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
	}

	role, err := middleware.GetAuthenticatedUserRole(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
	}

	message, err := h.messageService.GetByID(messageID)
	if err != nil {
		if errors.Is(err, domain.ErrMessageNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	if message.UserID != userID && role != domain.RoleAdmin {
		return echo.NewHTTPError(http.StatusForbidden, domain.ErrForbidden.Error())
	}

	if err := h.messageService.SoftDelete(messageID); err != nil {
		if errors.Is(err, domain.ErrMessageNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	if payload, err := json.Marshal(websockets.Event{
		Type:    websockets.EventMessageDelete,
		Payload: struct{ ID string }{ID: message.ID},
	}); err == nil {
		h.wsRegistry.Broadcast(message.RoomID, payload)
	}

	return c.JSON(http.StatusOK, fmt.Sprintf("message with the id = %s has been softDeleted", messageID))
}
func (h *MessageHandler) UpdateContent(c *echo.Context) error {
	messageID := c.Param("messageID")
	if err := validation.IsValidID(messageID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
	}

	var newContent dto.UpdateContentRequest

	if err := c.Bind(&newContent); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&newContent); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	message, err := h.messageService.GetByID(messageID)
	if err != nil {
		if errors.Is(err, domain.ErrMessageNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	if message.UserID != userID {
		return echo.NewHTTPError(http.StatusForbidden, domain.ErrForbidden.Error())
	}

	if err := h.messageService.UpdateContent(messageID, newContent.Content); err != nil {
		if errors.Is(err, domain.ErrMessageNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	if payload, err := json.Marshal(websockets.Event{
		Type: websockets.EventMessageUpdate,
		Payload: struct{ID string; Content string}{ID: messageID, Content: newContent.Content},
	}); err == nil {
		h.wsRegistry.Broadcast(message.RoomID, payload)
	}

	return c.JSON(http.StatusOK, fmt.Sprintf("message with the id = %s content has been updated", messageID))
}
func (h *MessageHandler) ListByRoomID(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	limit := 50
	if s := c.QueryParam("limit"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}

	var before *time.Time
	if s := c.QueryParam("before"); s != "" {
		if t, err := time.Parse(time.RFC3339Nano, s); err == nil {
			before = &t
		}
	}

	messages, hasMore, err := h.messageService.ListByRoomID(roomID, limit, before)
	if err != nil {
		if errors.Is(err, domain.ErrRoomNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	msgResponses := make([]dto.MessageResponse, 0, len(messages))
	for _, m := range messages {
		msgResponses = append(msgResponses, dto.MessageResponse{
			ID:               m.ID,
			Content:          m.Content,
			UserID:           m.UserID,
			ReplyToMessageID: m.ReplyToMessageID,
			RoomID:           m.RoomID,
			CreatedAt:        m.CreatedAt,
			UpdatedAt:        m.UpdatedAt,
			DeletedAt:        m.DeletedAt,
		})
	}

	var nextCursor *string
	if hasMore && len(messages) > 0 {
		cursor := messages[0].CreatedAt.Format(time.RFC3339Nano)
		nextCursor = &cursor
	}

	return c.JSON(http.StatusOK, dto.MessageListResponse{
		Messages:   msgResponses,
		HasMore:    hasMore,
		NextCursor: nextCursor,
	})
}
func (h *MessageHandler) ListByUserID(c *echo.Context) error {
	userID := c.Param("userID")
	if err := validation.IsValidID(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	messages, err := h.messageService.ListByUserID(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	msgResponses := make([]dto.MessageResponse, 0, len(messages))
	for _, m := range messages {
		msgResponses = append(msgResponses, dto.MessageResponse{
			ID:               m.ID,
			Content:          m.Content,
			UserID:           m.UserID,
			ReplyToMessageID: m.ReplyToMessageID,
			RoomID:           m.RoomID,
			CreatedAt:        m.CreatedAt,
			UpdatedAt:        m.UpdatedAt,
			DeletedAt:        m.DeletedAt,
		})
	}

	return c.JSON(http.StatusOK, msgResponses)
}
func (h *MessageHandler) GetByID(c *echo.Context) error {
	messageID := c.Param("messageID")
	if err := validation.IsValidID(messageID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	message, err := h.messageService.GetByID(messageID)

	if err != nil {
		if errors.Is(err, domain.ErrMessageNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, message)
}
