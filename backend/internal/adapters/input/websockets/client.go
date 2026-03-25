package websockets

import (
	"encoding/json"

	"github.com/gorilla/websocket"
)

type Client struct {
	hub *Hub
	// The websocket connection.
	conn *websocket.Conn
	// Buffered channel of outbound messages.
	send   chan []byte
	userID string
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, content, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var event Event
		if err := json.Unmarshal(content, &event); err != nil {
			continue
		}

		switch event.Type {
		case EventTypingStart, EventTypingEnd:
			out, err := json.Marshal(Event{
				Type:    event.Type,
				Payload: map[string]string{"userID": c.userID},
			})
			if err != nil {
				continue
			}
			c.hub.broadcastExcept <- broadcastMessage{sender: c, data: out}
		}
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for message := range c.send {
		err := c.conn.WriteMessage(websocket.TextMessage, message)
		if err != nil{
			break
		}
	}
}
