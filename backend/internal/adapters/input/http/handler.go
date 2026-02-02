package handler

import (
	"chatApp/internal/adapters/output/postgres"
	"chatApp/internal/application"
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return nil
}

func SetUpRouter(e *echo.Echo, db *sql.DB) {
	e.Use(middleware.RequestLogger())

	e.Validator = &CustomValidator{validator: validator.New()}

	e.GET("/", func(c *echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	userRepo := postgres.NewUserRepository(db)

	authService := application.NewAuthService(userRepo)
	userService := application.NewUserService(userRepo)

	AuthHandler := NewAuthHandler(authService)
	UserHandler := newUserHandler(userService)

	users := e.Group("/users")
	{
		users.GET("", UserHandler.GetAll)
		users.GET("/:id", UserHandler.GetByID)
		users.PUT("/:id", UserHandler.Update)
		users.DELETE("/:id", UserHandler.Delete)
		users.PATCH("/:id/role", UserHandler.ChangeRole)
	}

	auth := e.Group("/auth")
	{
		auth.POST("/register", AuthHandler.Register)
		auth.POST("/login", AuthHandler.Login)
	}

	if err := e.Start(fmt.Sprintf(":%s", os.Getenv("SERVER_PORT"))); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
