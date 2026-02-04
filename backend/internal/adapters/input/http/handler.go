package handler

import (
	"chatApp/internal/adapters/output/postgres"
	"chatApp/internal/application"
	"fmt"
	"net/http"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"gorm.io/gorm"
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

func SetUpRouter(e *echo.Echo, db *gorm.DB) {
	e.Use(middleware.RequestLogger())

	e.Validator = &CustomValidator{validator: validator.New()}

	e.GET("/", func(c *echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	userRepo := postgres.NewUserRepository(db)
	serverRepo := postgres.NewServerRepo(db)
	roomRepo := postgres.NewRoomRepo(db)

	authService := application.NewAuthService(userRepo)
	userService := application.NewUserService(userRepo)
	serverService := application.NewServerService(serverRepo)
	roomService := application.NewRoomService(roomRepo)

	AuthHandler := NewAuthHandler(authService)
	UserHandler := newUserHandler(userService)
	serverHandler := NewServerHandler(serverService)
	roomHandler := NewRoomHandler(roomService)

	//todo: Terminar los CRUDS de todas las rutas, actualmente solo estan implementados los Create

	users := e.Group("/users")
	{
		users.GET("", UserHandler.GetAll)
		users.GET("/:id", UserHandler.GetByID)
		users.PUT("/:id", UserHandler.Update)
		users.DELETE("/:id", UserHandler.Delete)
		users.PATCH("/:id/role", UserHandler.ChangeRole)
	}

	server := e.Group("/server")
	{
		server.POST("", serverHandler.Create)

		room := server.Group("/:serverID/room")
		{
			room.POST("", roomHandler.CreateForServer)
			room.GET("", roomHandler.ListByServer)
		}
	}

	room := e.Group("/room") //Solo para DirectMessages
	{
		room.POST("", roomHandler.Create)
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
