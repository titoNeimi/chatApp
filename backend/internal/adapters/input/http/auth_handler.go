package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
)

type AuthHandler struct {
	authService input.AuthService
	userService input.UserService
}

func NewAuthHandler(authService input.AuthService, userService input.UserService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		userService: userService,
	}
}

func (h *AuthHandler) Register(c *echo.Context) error {
	var req dto.RegisterRequest

	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user, err := h.authService.Register(c.Request().Context(), req.Email, req.Username, req.Password)
	if err != nil {
		switch err {
		case domain.ErrDuplicateEmail:
			return echo.NewHTTPError(http.StatusConflict, "email already exists")
		case domain.ErrWeakPassword:
			return echo.NewHTTPError(http.StatusBadRequest, "password too weak")
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
		}
	}

	resp := dto.RegisterResponse{
		ID:       user.ID,
		Email:    user.Email,
		Username: user.Username,
	}

	return c.JSON(http.StatusCreated, resp)
}

func (h *AuthHandler) Login(c *echo.Context) error {
	var req dto.LoginRequest

	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	accessToken, refreshToken, err := h.authService.Login(c.Request().Context(), req.Email, req.Password)
	if err != nil {
		if err == domain.ErrInvalidCredentials {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	resp := dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	return c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) Refresh(c *echo.Context) error {
	var req dto.RefreshRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	accessToken, refreshToken, err := h.authService.Refresh(c.Request().Context(), req.RefreshToken)
	if err != nil {
		if isAuthTokenError(err) {
			return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	resp := dto.RefreshResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}
	return c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) Logout(c *echo.Context) error {
	var req dto.LogoutRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if err := c.Validate(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.authService.Logout(c.Request().Context(), req.RefreshToken); err != nil {
		if isAuthTokenError(err) {
			return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *AuthHandler) Me(c *echo.Context) error {
	userID, err := GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
	}

	user, err := h.userService.GetByID(c.Request().Context(), userID)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	resp := dto.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Username:  user.Username,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}

	return c.JSON(http.StatusOK, resp)
}

func isAuthTokenError(err error) bool {
	return errors.Is(err, domain.ErrInvalidToken) ||
		errors.Is(err, domain.ErrExpiredToken) ||
		errors.Is(err, domain.ErrRefreshTokenNotFound) ||
		errors.Is(err, domain.ErrRefreshTokenRevoked) ||
		errors.Is(err, domain.ErrRefreshTokenExpired)
}
