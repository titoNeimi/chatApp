package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/adapters/input/http/middleware"
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
	userID := c.Param("userID")
	if err := validation.IsValidID(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.userService.Delete(c.Request().Context(), userID); err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, fmt.Sprintf("user with the id = %s has been softDeleted", userID))
}
func (h *UserHandler) Update(c *echo.Context) error {
	userID := c.Param("userID")
	if err := validation.IsValidID(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var updateData dto.UpdateUserRequest
	if err := c.Bind(&updateData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := c.Validate(&updateData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	updates := buildUpdatesFromDTO(updateData)
	if len(updates) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, domain.ErrNoFieldsToUpdate.Error())
	}

	user, err := h.userService.Update(c.Request().Context(), userID, updates)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserNotFound):
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		case errors.Is(err, domain.ErrNoFieldsToUpdate),
			errors.Is(err, domain.ErrInvalidEmail),
			errors.Is(err, domain.ErrInvalidUsername),
			errors.Is(err, domain.ErrWeakPassword):
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		case errors.Is(err, domain.ErrDuplicateEmail),
			errors.Is(err, domain.ErrDuplicateUsername):
			return echo.NewHTTPError(http.StatusConflict, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	response := dto.UpdateUserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Username:  user.Username,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
		Role:      user.Role,
	}
	return c.JSON(http.StatusOK, response)
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
	response := make([]dto.UserResponse, len(users))
	for i, u := range users {
		response[i] = dto.UserResponse{
			ID:        u.ID,
			Email:     u.Email,
			Username:  u.Username,
			Role:      u.Role,
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
		}
	}
	return c.JSON(http.StatusOK, response)
}
func (h *UserHandler) SearchByUsername(c *echo.Context) error {
	q := c.QueryParam("q")
	if len(q) < 2 {
		return echo.NewHTTPError(http.StatusBadRequest, "query must be at least 2 characters")
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	users, err := h.userService.SearchByUsername(q, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	out := make([]dto.UserResponse, 0, len(users))
	for _, u := range users {
		out = append(out, dto.UserResponse{
			ID:        u.ID,
			Username:  u.Username,
			Email:     u.Email,
			Role:      u.Role,
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
		})
	}

	return c.JSON(http.StatusOK, out)
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
