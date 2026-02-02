package handler

import (
	"chatApp/internal/ports/input"
	"net/http"

	"github.com/labstack/echo/v5"
)

type UserHandler struct {
	userService input.UserService
}

func newUserHandler(userService input.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) Delete(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusNotImplemented, "not implemented")
}
func (h *UserHandler) Update(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusNotImplemented, "not implemented")
}
func (h *UserHandler) ChangeRole(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusNotImplemented, "not implemented")
}
func (h *UserHandler) GetAll(c *echo.Context) error {
	users, err := h.userService.GetAll(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, users)
}
func (h *UserHandler) GetByID(c *echo.Context) error {
	return echo.NewHTTPError(http.StatusNotImplemented, "not implemented")
}
