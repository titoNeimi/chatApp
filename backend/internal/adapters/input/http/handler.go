package handler

import (
	"chatApp/internal/adapters/input/http/middleware"
	"chatApp/internal/adapters/input/websockets"
	jwtAdapter "chatApp/internal/adapters/output/jwt"
	"chatApp/internal/adapters/output/postgres"
	"chatApp/internal/application"
	"chatApp/internal/domain"
	"chatApp/internal/infrastructure/config"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
	echoMiddleware "github.com/labstack/echo/v5/middleware"
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
	e.Use(echoMiddleware.Recover())
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
	roleRepo := postgres.NewServerRoleRepo(db)
	permissionRepo := postgres.NewPermissionRepo(db)
	banRepo := postgres.NewServerBanRepo(db)
	invitationRepo := postgres.NewInvitationRepo(db)

	authConfig, err := config.LoadAuthConfigFromEnv()
	if err != nil {
		slog.Error("failed to load auth config", "error", err)
		return
	}
	tokenProvider := jwtAdapter.NewTokenProvider(authConfig)
	wsRegistry := websockets.NewHubRegistry()

	authService := application.NewAuthService(userRepo, refreshTokenRepo, tokenProvider)
	userService := application.NewUserService(userRepo)
	messageService := application.NewMessageService(messageRepo, roomRepo)
	serverService := application.NewServerService(serverRepo, roomRepo)
	roomService := application.NewRoomService(roomRepo, serverRepo, userRepo)
	roleService := application.NewServerRoleService(roleRepo, banRepo, serverRepo)
	permissionService := application.NewPermissionService(permissionRepo, roleRepo, banRepo)
	invitationService := application.NewInvitationService(invitationRepo, serverRepo)

	authMiddleware := middleware.RequireAuth(authService)
	adminOnly := middleware.RequireRoles(domain.RoleAdmin)
	userOrAdmin := middleware.RequireRoles(domain.RoleUser, domain.RoleAdmin)

	AuthHandler := NewAuthHandler(authService, userService)
	UserHandler := newUserHandler(userService)
	messageHandler := newMessageHandler(messageService, roomService, wsRegistry)
	serverHandler := NewServerHandler(serverService)
	roomHandler := NewRoomHandler(roomService)
	roleHandler := NewServerRoleHandler(roleService)
	permHandler := NewPermissionHandler(permissionService)
	invitationHandler := NewInvitationHandler(invitationService, serverService)
	wsHandler := websockets.NewWSHandler(wsRegistry, authService, roomService)

	e.GET("/ws/room/:roomID", wsHandler.HandleRoom)

	users := e.Group("/users", authMiddleware)
	{
		users.GET("", UserHandler.GetAll, adminOnly)
		users.GET("/:userID/servers", serverHandler.ListByUserID, middleware.RequireSelfOrAdmin("userID"))
		users.GET("/:userID", UserHandler.GetByID, middleware.RequireSelfOrAdmin("userID"))
		users.PUT("/:userID", UserHandler.Update, middleware.RequireSelfOrAdmin("userID"))
		users.DELETE("/:userID", UserHandler.Delete, middleware.RequireSelfOrAdmin("userID"))
		users.PATCH("/:userID/role", UserHandler.ChangeRole, adminOnly)
	}

	server := e.Group("/server", authMiddleware)
	{
		server.GET("", serverHandler.GetAll)
		server.POST("", serverHandler.Create, userOrAdmin)
		server.GET("/:serverID", serverHandler.GetServerByID, userOrAdmin)
		server.PUT("/:serverID", serverHandler.Update, adminOnly)
		server.DELETE("/:serverID", serverHandler.SoftDelete, adminOnly)
		server.POST("/:serverID/join", serverHandler.JoinServer, userOrAdmin)
		server.GET("/:serverID/stats", serverHandler.GetStats)

		room := server.Group("/:serverID/room")
		{
			room.POST("", roomHandler.CreateForServer, adminOnly)
			room.GET("", roomHandler.ListByServer, userOrAdmin)
			room.PUT("/:roomID", roomHandler.UpdateInServer, adminOnly)
			room.DELETE("/:roomID", roomHandler.SoftDeleteInServer, adminOnly)

			overrides := room.Group("/:roomID/overrides", middleware.RequireServerMember(serverRepo))
			{
				overrides.GET("", permHandler.ListOverrides)
				overrides.POST("", permHandler.UpsertOverride, middleware.RequireServerPermission(permissionService, domain.PermManageMembers))
				overrides.DELETE("/:overrideID", permHandler.DeleteOverride, middleware.RequireServerPermission(permissionService, domain.PermManageMembers))
			}
		}

		roles := server.Group("/:serverID/roles", middleware.RequireServerMember(serverRepo))
		{
			roles.GET("", roleHandler.ListRoles)
			roles.POST("", roleHandler.CreateRole, middleware.RequireServerPermission(permissionService, domain.PermManageMembers))
			roles.GET("/:roleID", roleHandler.GetRole)
			roles.PUT("/:roleID", roleHandler.UpdateRole, middleware.RequireServerPermission(permissionService, domain.PermManageMembers))
			roles.DELETE("/:roleID", roleHandler.DeleteRole, middleware.RequireServerPermission(permissionService, domain.PermManageMembers))
			roles.POST("/assign", roleHandler.AssignRole, middleware.RequireServerPermission(permissionService, domain.PermManageMembers))
			roles.DELETE("/revoke", roleHandler.RevokeRole, middleware.RequireServerPermission(permissionService, domain.PermManageMembers))
		}

		server.GET("/:serverID/my-permissions", permHandler.GetMyPermissions, middleware.RequireServerMember(serverRepo))

		members := server.Group("/:serverID/members", middleware.RequireServerMember(serverRepo))
		{
			members.GET("", roleHandler.ListUsersWithRoles)
		}

		bans := server.Group("/:serverID/bans", middleware.RequireServerPermission(permissionService, domain.PermManageMembers))
		{
			bans.GET("", roleHandler.ListBans)
			bans.POST("", roleHandler.BanUser)
			bans.DELETE("/:userID", roleHandler.UnbanUser)
		}

		invitations := server.Group("/:serverID/invitations", middleware.RequireServerMember(serverRepo))
		{
			invitations.GET("", invitationHandler.ListByServer)
			invitations.POST("", invitationHandler.Create, middleware.RequireServerPermission(permissionService, domain.PermManageMembers))
			invitations.DELETE("/:invitationID", invitationHandler.Delete, middleware.RequireServerPermission(permissionService, domain.PermManageMembers))
		}

		server.GET("/admin", serverHandler.GetAllForAdmin, adminOnly)
	}

	e.GET("/invitations/:code", invitationHandler.Preview, authMiddleware)
	e.POST("/invitations/:code/use", invitationHandler.Use, authMiddleware)

	room := e.Group("/room", authMiddleware)
	{
		room.POST("", roomHandler.Create, userOrAdmin)
		room.GET("/:roomID", roomHandler.GetByID, userOrAdmin)
		room.PUT("/:roomID", roomHandler.Update, userOrAdmin)
		room.POST("/:roomID/users/:userID", roomHandler.AddUserToRoom, middleware.RequireSelfOrAdmin("userID"))
		room.DELETE("/:roomID/users/:userID", roomHandler.RemoveUserFromRoom, middleware.RequireSelfOrAdmin("userID"))

		room.GET("/:roomID/users", roomHandler.ListMembersByRoom, userOrAdmin)
		room.GET("/:roomID/me", roomHandler.GetMyMembership)
		room.PUT("/:roomID/read", roomHandler.UpdateLastRead)
	}

	message := e.Group("/message", authMiddleware)
	{
		message.POST("", messageHandler.Create, userOrAdmin)

		message.PUT("/:messageID", messageHandler.UpdateContent, userOrAdmin)
		message.GET("/:messageID", messageHandler.GetByID, userOrAdmin)
		message.DELETE("/:messageID", messageHandler.SoftDelete, userOrAdmin)

		message.GET("/room/:roomID", messageHandler.ListByRoomID, userOrAdmin)
		message.GET("/user/:userID", messageHandler.ListByUserID, middleware.RequireSelfOrAdmin("userID"))
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
		slog.Error("failed to start server", "error", err)
	}
}
