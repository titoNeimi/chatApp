package handler

import (
	"chatApp/internal/adapters/input/http/dto"
	"chatApp/internal/adapters/input/http/middleware"
	"chatApp/internal/adapters/input/http/validation"
	"chatApp/internal/domain"
	"chatApp/internal/ports/input"
	"net/http"

	"github.com/labstack/echo/v5"
)

type friendHandler struct {
	friendService input.FriendService
}

func newFriendHandler(friendService input.FriendService) *friendHandler {
	return &friendHandler{friendService: friendService}
}

func buildFriendResponse(f *domain.Friendship) *dto.FriendRequestResponse {
	if f == nil {
		return nil
	}
	return &dto.FriendRequestResponse{
		ID:          f.ID,
		AddresseeID: f.AddresseeID,
		RequesterID: f.RequesterID,
		Status:      f.Status,
		CreatedAt:   f.CreatedAt,
	}
}

func buildFriendEntryResponse(f *domain.FriendEntry) *dto.FriendEntryResponse {
	if f == nil {
		return nil
	}
	userReponse := dto.UserResponse{
		ID:        f.Friend.ID,
		Username:  f.Friend.Username,
		Email:     f.Friend.Email,
		Role:      f.Friend.Role,
		CreatedAt: f.Friend.CreatedAt,
		UpdatedAt: f.Friend.UpdatedAt,
	}
	return &dto.FriendEntryResponse{
		FriendshipID: f.FriendshipID,
		User:         userReponse,
		Since:        f.Since,
	}
}

func buildPendingResponse(f *domain.PendingRequest) *dto.PendingRequestResponse {
	if f == nil {
		return nil
	}
	userReponse := dto.UserResponse{
		ID:        f.FromUser.ID,
		Username:  f.FromUser.Username,
		Email:     f.FromUser.Email,
		Role:      f.FromUser.Role,
		CreatedAt: f.FromUser.CreatedAt,
		UpdatedAt: f.FromUser.UpdatedAt,
	}
	return &dto.PendingRequestResponse{
		FriendshipID: f.FriendshipID,
		FromUser:     userReponse,
		SentAt:       f.SentAt,
	}
}

func (h *friendHandler) SendRequest(c *echo.Context) error {
	var requestData dto.SendFriendRequestBody

	if err := c.Bind(&requestData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := c.Validate(&requestData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	f, err := h.friendService.SendRequest(userID, requestData.UserID)

	if err != nil {
		switch err {
		case domain.ErrCannotFriendYourself:
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		case domain.ErrAlreadyFriends:
			return echo.NewHTTPError(http.StatusConflict, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusCreated, buildFriendResponse(f))

}

func (h *friendHandler) ListFriends(c *echo.Context) error {
	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	friends, err := h.friendService.ListFriends(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	out := make([]dto.FriendEntryResponse, 0, len(friends))
	for _, f := range friends {
		out = append(out, *buildFriendEntryResponse(&f))
	}

	return c.JSON(http.StatusOK, out)
}

func (h *friendHandler) ListPending(c *echo.Context) error {
	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	pendingList, err := h.friendService.ListPendingIncoming(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	out := make([]dto.PendingRequestResponse, 0, len(pendingList))
	for _, p := range pendingList {
		out = append(out, *buildPendingResponse(&p))
	}

	return c.JSON(http.StatusOK, out)
}

func (h *friendHandler) AcceptRequest(c *echo.Context) error {
	requestID := c.Param("requestID")
	if err := validation.IsValidID(requestID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	if err := h.friendService.AcceptRequest(requestID, userID); err != nil {
		switch err {
		case domain.ErrFriendshipNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		case domain.ErrNotYourFriendRequest:
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		case domain.ErrAlreadyFriends:
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusNoContent, nil)
}

func (h *friendHandler) DeclineRequest(c *echo.Context) error {
	requestID := c.Param("requestID")
	if err := validation.IsValidID(requestID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	if err := h.friendService.DeclineRequest(requestID, userID); err != nil {
		switch err {
		case domain.ErrFriendshipNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		case domain.ErrNotYourFriendRequest:
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		case domain.ErrAlreadyFriends:
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(http.StatusNoContent, nil)
}

func (h *friendHandler) RemoveFriend(c *echo.Context) error {
	friendshipID := c.Param("friendshipID")
	if err := validation.IsValidID(friendshipID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	userID, err := middleware.GetAuthenticatedUserID(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}

	if err := h.friendService.RemoveFriend(userID, friendshipID); err != nil {
		switch err {
		case domain.ErrFriendshipNotFound:
			return echo.NewHTTPError(http.StatusNotFound, err.Error())
		case domain.ErrNotYourFriend:
			return echo.NewHTTPError(http.StatusForbidden, err.Error())
		default:
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
	}

	return c.NoContent(http.StatusNoContent)
}
