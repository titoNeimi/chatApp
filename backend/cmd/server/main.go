package main

import (
	handler "chatApp/internal/adapters/input/http"
	"chatApp/internal/infrastructure/config"
	"chatApp/internal/infrastructure/db"
	"github.com/labstack/echo/v5"
	_ "github.com/lib/pq"
)

func main() {
	config.LoadEnv()
	db := db.ConnectDB()
	e := echo.New()
	handler.SetUpRouter(e, db)
}

