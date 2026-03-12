package middleware

import (
	"log/slog"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func RequestLogger() echo.MiddlewareFunc {
	return middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogMethod:   true,
		LogURI:      true,
		LogStatus:   true,
		LogLatency:  true,
		LogRemoteIP: true,
		LogValuesFunc: func(c *echo.Context, v middleware.RequestLoggerValues) error {
			slog.Info("request",
				"method",  v.Method,
				"uri",     v.URI,
				"status",  v.Status,
				"latency", v.Latency.Round(time.Millisecond),
				"ip",      v.RemoteIP,
			)
			return nil
		},
	})
}
