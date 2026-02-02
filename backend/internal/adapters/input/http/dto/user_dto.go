package dto

type UpdateUserRequest struct {
	Email    string `json:"email" validate:"email"`
	Username string `json:"username" validate:"min=3"`
	Password string `json:"password" validate:"min=8"`
}

// type UpdateUserResponse struct {
//Complete User
// }
