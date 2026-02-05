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

	userID := c.Param("userID")
	if err := validation.IsValidID(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var requestData dto.ChangeRoleRequest

	if err := c.Bind(&requestData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&requestData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.userService.ChangeRole(c.Request().Context(), userID, requestData.Role); err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, fmt.Sprintf("new role = %s, change with succesfully", requestData.Role))
}
func (h *UserHandler) GetAll(c *echo.Context) error {
	users, err := h.userService.GetAll(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, users)
}
func (h *UserHandler) GetByID(c *echo.Context) error {

	userID := c.Param("userID")
	if err := validation.IsValidID(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user, err := h.userService.GetByID(c.Request().Context(), userID)

	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	responseData := dto.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Username:  user.Username,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
	return c.JSON(http.StatusOK, responseData)
}
