package main

import (
	handler "chatApp/internal/adapters/input/http"
	"chatApp/internal/infrastructure/config"
	"chatApp/internal/infrastructure/db"
	"log/slog"
	"os"

	"github.com/labstack/echo/v5"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	config.LoadEnv()
	db := db.ConnectDB()
	e := echo.New()
	handler.SetUpRouter(e, db)
}
