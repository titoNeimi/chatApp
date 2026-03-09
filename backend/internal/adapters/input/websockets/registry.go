package websockets

import "sync"

type HubRegistry struct {
	hubs map[string]*Hub
	mu   sync.RWMutex
}

func NewHubRegistry() *HubRegistry {
	return &HubRegistry{
		hubs: make(map[string]*Hub),
	}
}

func (r *HubRegistry) GetOrCreate(roomID string) *Hub {
	r.mu.Lock()
	defer r.mu.Unlock()

	hub, ok := r.hubs[roomID]
	if !ok {
		hub = newHub()
		r.hubs[roomID] = hub
		go hub.run()
	}
	return hub
}

func (r *HubRegistry) Broadcast(roomID string, payload []byte) {
	r.mu.RLock()
	hub, ok := r.hubs[roomID]
	r.mu.RUnlock()

	if ok {
		hub.broadcast <- payload
	}
}
