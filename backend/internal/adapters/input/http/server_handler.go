package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	valaidation "chatApp/internal/adapters/input/http/validation"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
)

type serverHandler struct {
	serverService input.ServerService
}

func NewServerHandler(serverService input.ServerService) *serverHandler {
	return &serverHandler{serverService: serverService}
}

func (h *serverHandler) GetAll(c *echo.Context) error {
	servers, err := h.serverService.GetAll()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, buildServerResponseList(servers))
}

func (h *serverHandler) ListByUserID(c *echo.Context) error {
	userID := c.Param("userID")
	if err := valaidation.IsValidID(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	servers, err := h.serverService.ListByUserID(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, buildServerResponseList(servers))
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

	id := c.Param("serverID")
	if err := valaidation.IsValidID(id); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var updatesData dto.ServerUpdateRequest

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

	server, err := h.serverService.Update(id, updates)

	if err != nil {
		switch err {
		case domain.ErrServerNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusOK, server)
}

func (h *serverHandler) SoftDelete(c *echo.Context) error {
	id := c.Param("serverID")
	if err := valaidation.IsValidID(id); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	err := h.serverService.SoftDelete(id)
	if err != nil {
		switch err {
		case domain.ErrServerNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusOK, fmt.Sprintf("server with id = %s softDeleted", id))
}
func (h *serverHandler) GetServerByID(c *echo.Context) error {

	id := c.Param("serverID")
	if err := valaidation.IsValidID(id); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	server, err := h.serverService.GetServerByID(id)

	if err != nil {
		switch err {
		case domain.ErrServerNotFound:
			return echo.NewHTTPError(http.StatusNotFound, "server not found")
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusOK, server)

}

func buildServerResponseList(servers []domain.Server) []dto.ServerResponse {
	serverList := make([]dto.ServerResponse, 0, len(servers))
	for _, serverData := range servers {
		var deletedAt *time.Time
		if serverData.DeletedAt.Valid {
			deletedAt = &serverData.DeletedAt.Time
		}

		serverList = append(serverList, dto.ServerResponse{
			ID:          serverData.ID,
			Name:        serverData.Name,
			Description: serverData.Description,
			RoomIDs:     serverData.RoomIDs,
			CreatedAt:   serverData.CreatedAt,
			UpdatedAt:   serverData.UpdatedAt,
			DeletedAt:   deletedAt,
		})
	}

	return serverList
}
