package handler

import (
	jwtAdapter "chatApp/internal/adapters/output/jwt"
	"chatApp/internal/adapters/output/postgres"
	"chatApp/internal/application"
	"chatApp/internal/domain"
	"chatApp/internal/infrastructure/config"
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
	refreshTokenRepo := postgres.NewRefreshTokenRepository(db)
	messageRepo := postgres.NewMessageRepo(db)
	serverRepo := postgres.NewServerRepo(db)
	roomRepo := postgres.NewRoomRepo(db)

	authConfig, err := config.LoadAuthConfigFromEnv()
	if err != nil {
		e.Logger.Error("failed to load auth config", "error", err)
		return
	}
	tokenProvider := jwtAdapter.NewTokenProvider(authConfig)

	authService := application.NewAuthService(userRepo, refreshTokenRepo, tokenProvider)
	userService := application.NewUserService(userRepo)
	messageService := application.NewMessageService(messageRepo, roomRepo)
	serverService := application.NewServerService(serverRepo)
	roomService := application.NewRoomService(roomRepo, serverRepo, userRepo)

	authMiddleware := RequireAuth(authService)
	adminOnly := RequireRoles(domain.RoleAdmin)
	userOrAdmin := RequireRoles(domain.RoleUser, domain.RoleAdmin)

	AuthHandler := NewAuthHandler(authService, userService)
	UserHandler := newUserHandler(userService)
	messageHandler := newMessageHandler(messageService, roomService)
	serverHandler := NewServerHandler(serverService)
	roomHandler := NewRoomHandler(roomService)

	users := e.Group("/users", authMiddleware)
	{
		users.GET("", UserHandler.GetAll, adminOnly)
		users.GET("/:userID/servers", serverHandler.ListByUserID, RequireSelfOrAdmin("userID"))
		users.GET("/:userID", UserHandler.GetByID, RequireSelfOrAdmin("userID"))
		users.PUT("/:userID", UserHandler.Update, RequireSelfOrAdmin("userID"))
		users.DELETE("/:userID", UserHandler.Delete, RequireSelfOrAdmin("userID"))
		users.PATCH("/:userID/role", UserHandler.ChangeRole, adminOnly)
	}

	server := e.Group("/server", authMiddleware)
	{
		server.GET("", serverHandler.GetAll, userOrAdmin)
		server.POST("", serverHandler.Create, adminOnly)
		server.GET("/:serverID", serverHandler.GetServerByID, userOrAdmin)
		server.PUT("/:serverID", serverHandler.Update, adminOnly)
		server.DELETE("/:serverID", serverHandler.SoftDelete, adminOnly)

		room := server.Group("/:serverID/room")
		{
			room.POST("", roomHandler.CreateForServer, adminOnly)
			room.GET("", roomHandler.ListByServer, userOrAdmin)
			room.PUT("/:roomID", roomHandler.UpdateInServer, adminOnly)
			room.DELETE("/:roomID", roomHandler.SoftDeleteInServer, adminOnly)
		}
	}

	room := e.Group("/room", authMiddleware) //Solo para DirectMessages
	{
		room.POST("", roomHandler.Create, userOrAdmin)
		room.GET("/:roomID", roomHandler.GetByID, userOrAdmin)
		room.PUT("/:roomID", roomHandler.Update, userOrAdmin)
		room.POST("/:roomID/users/:userID", roomHandler.AddUserToRoom, RequireSelfOrAdmin("userID"))
		room.DELETE("/:roomID/users/:userID", roomHandler.RemoveUserFromRoom, RequireSelfOrAdmin("userID"))
	}

	message := e.Group("/message", authMiddleware)
	{
		message.POST("", messageHandler.Create, userOrAdmin)

		message.PUT("/:messageID", messageHandler.UpdateContent, userOrAdmin)
		message.GET("/:messageID", messageHandler.GetByID, userOrAdmin)
		message.DELETE("/:messageID", messageHandler.SoftDelete, userOrAdmin)

		message.GET("/room/:roomID", messageHandler.ListByRoomID, userOrAdmin)
		message.GET("/user/:userID", messageHandler.ListByUserID, RequireSelfOrAdmin("userID"))
	}

	auth := e.Group("/auth")
	{
		auth.POST("/register", AuthHandler.Register)
		auth.POST("/login", AuthHandler.Login)
		auth.POST("/refresh", AuthHandler.Refresh)
		auth.POST("/logout", AuthHandler.Logout)
	}

	authPrivate := e.Group("/auth", authMiddleware)
	{
		authPrivate.GET("/me", AuthHandler.Me, userOrAdmin)
	}

	if err := e.Start(fmt.Sprintf(":%s", os.Getenv("SERVER_PORT"))); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
