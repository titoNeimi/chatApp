package websockets

type Hub struct {
	clients         map[*Client]bool
	broadcast       chan []byte
	register        chan *Client
	unregister      chan *Client
	broadcastExcept chan broadcastMessage
}

type broadcastMessage struct {
	sender *Client
	data   []byte
}

func newHub() *Hub {
	return &Hub{
		broadcast:       make(chan []byte),
		register:        make(chan *Client),
		unregister:      make(chan *Client),
		clients:         make(map[*Client]bool),
		broadcastExcept: make(chan broadcastMessage),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
					//send message
				default:
					delete(h.clients, client)
					close(client.send)
				}
			}
		case msg := <-h.broadcastExcept:
			for client := range h.clients {
				if client == msg.sender {
					continue
				}
				select {
				case client.send <- msg.data:
				default:
					delete(h.clients, client)
					close(client.send)
				}
			}
		}

	}
}
