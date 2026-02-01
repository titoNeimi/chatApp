package handler

import (
	"fmt"
	"net/http"
	"os"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func GetallUsers(c *echo.Context) error{
	fmt.Println("Get all users")
	c.JSON(http.StatusOK, "Get all users")
	return nil
}


func SetUpRouter(e *echo.Echo) {
	e.Use(middleware.RequestLogger())
	e.GET("/", func(c *echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	
	users := e.Group("/users")
	{
		users.GET("", GetallUsers)
	}

	if err := e.Start(fmt.Sprintf(":%s", os.Getenv("SERVER_PORT"))); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}
