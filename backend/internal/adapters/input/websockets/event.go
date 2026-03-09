package websockets

type Event struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

const (
	EventMessageNew    = "message.new"
	EventMessageUpdate = "message.update"
	EventMessageDelete = "message.delete"
)