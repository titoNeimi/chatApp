package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/ports/input"
	"net/http"

	"github.com/labstack/echo/v5"
)

type MessageHandler struct {
	messageService input.MessageService
}

func newMessageHandler(messageService input.MessageService) *MessageHandler {
	return &MessageHandler{messageService: messageService}
}

func (h *MessageHandler) Create(c *echo.Context) error {
	var data dto.MessageCreateRequest

	if err := c.Bind(&data); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&data); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	message, err := h.messageService.Create(input.CreateMessageInput{
		Content:          data.Content,
		UserID:           data.UserID, //todo: Hacer que venga desde el auth y no del body
		ReplyToMessageID: data.ReplyToMessageID,
		RoomID:           data.RoomID, //todo: Chequear que sea un roomID valido
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, message)
}

func (h *MessageHandler) SoftDelete(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Not implemented")
}
func (h *MessageHandler) UpdateContent(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Not implemented")
}
func (h *MessageHandler) ListByRoomID(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Not implemented")
}
func (h *MessageHandler) ListByUserID(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Not implemented")
}
func (h *MessageHandler) GetByID(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Not implemented")
}
