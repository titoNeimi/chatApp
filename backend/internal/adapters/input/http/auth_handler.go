package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"net/http"

	"github.com/labstack/echo/v5"
)

type AuthHandler struct {
	authService input.AuthService
}

func NewAuthHandler(authService input.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
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
