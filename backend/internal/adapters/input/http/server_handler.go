package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"net/http"

	"github.com/labstack/echo/v5"
)

type serverHandler struct {
	serverService input.ServerService
}

func NewServerHandler(serverService input.ServerService) *serverHandler {
	return &serverHandler{serverService: serverService}
}

func (h *serverHandler) Create(c *echo.Context) error {
	var serverData dto.ServerCreateRequest

	err := c.Bind(&serverData)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	err = c.Validate(&serverData)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	server := domain.Server{
		Name:        serverData.Name,
		Description: serverData.Description,
	}

	server, err = h.serverService.Create(server)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, server)
}
func (h *serverHandler) Update(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Not implemented")
}
func (h *serverHandler) SoftDelete(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Not implemented")
}
func (h *serverHandler) GetServerByID(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusInternalServerError, "Not implemented")
}
