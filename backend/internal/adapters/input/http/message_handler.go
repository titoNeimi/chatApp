package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/adapters/input/http/validation"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"errors"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v5"
)

type MessageHandler struct {
	messageService input.MessageService
	roomService    input.RoomService
}

func newMessageHandler(messageService input.MessageService, roomService input.RoomService) *MessageHandler {
	return &MessageHandler{
		messageService: messageService,
		roomService:    roomService,
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
	if _, err := h.roomService.GetByID(data.RoomID); err != nil {
		switch err {
		case domain.ErrRoomNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	message, err := h.messageService.Create(input.CreateMessageInput{
		Content:          data.Content,
		UserID:           data.UserID, //todo: Hacer que venga desde el auth y no del body
		ReplyToMessageID: data.ReplyToMessageID,
		RoomID:           data.RoomID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, message)
}

func (h *MessageHandler) SoftDelete(c *echo.Context) error {
	messageID := c.Param("messageID")
	if err := validation.IsValidID(messageID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.messageService.SoftDelete(messageID); err != nil {
		if errors.Is(err, domain.ErrMessageNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, fmt.Sprintf("message with the id = %s has been softDeleted", messageID))
}
func (h *MessageHandler) UpdateContent(c *echo.Context) error {
	messageID := c.Param("messageID")
	if err := validation.IsValidID(messageID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var newContent dto.UpdateContentRequest

	if err := c.Bind(&newContent); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&newContent); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.messageService.UpdateContent(messageID, newContent.Content); err != nil {
		if errors.Is(err, domain.ErrMessageNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, fmt.Sprintf("message with the id = %s content has been updated", messageID))
}
func (h *MessageHandler) ListByRoomID(c *echo.Context) error {
	roomID := c.Param("roomID")
	if err := validation.IsValidID(roomID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	messages, err := h.messageService.ListByRoomID(roomID)

	if err != nil {
		if errors.Is(err, domain.ErrRoomNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, messages)
}
func (h *MessageHandler) ListByUserID(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Not implemented")
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
