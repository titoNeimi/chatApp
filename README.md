# ChatApp

A full-stack, real-time chat platform inspired by Discord. Built with a Go backend and a Next.js frontend, it features server-based communities, multi-channel rooms, real-time WebSocket messaging, and a granular role-based access control system.

---

## Features

- **Real-time messaging** via WebSocket connections (one hub per room)
- **Servers & Rooms** — create communities with multiple text channels
- **Server RBAC** — custom roles per server with granular permissions (`manage_rooms`, `manage_members`, `mute_members`, `delete_messages`)
- **JWT authentication** — short-lived access tokens + long-lived refresh tokens with automatic rotation
- **Server discovery** — browse and join public servers
- **Soft deletes** — messages and servers are soft-deleted, preserving history
- **Admin panel** — global user role management and server oversight
- **Adminer** — bundled web UI for direct database inspection during development

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | Go, Echo v5 |
| Database | PostgreSQL 16 (via Docker) |
| ORM | GORM v1 |
| Auth | JWT (golang-jwt/jwt v5), HTTP-only cookies |
| Real-time | Gorilla WebSocket |
| Infrastructure | Docker Compose |

---

## Architecture

The backend follows **Clean / Hexagonal Architecture**:

```
backend/internal/
├── domain/          # Entities, constants, pure business logic
├── application/     # Services orchestrating domain logic
├── ports/           # Interface contracts (input & output)
└── adapters/
    ├── input/
    │   ├── http/        # Echo handlers, DTOs, middleware, validation
    │   └── websockets/  # Hub, client read/write pumps
    └── output/
        ├── postgres/    # GORM repositories
        └── jwt/         # Token provider
```

The frontend uses **Next.js App Router** with route groups for auth and protected user pages, a custom proxy for token refresh, and React Context for shared state.

---

## Project Structure

```
chatApp/
├── backend/
│   ├── cmd/server/main.go       # Entry point
│   ├── internal/                # Application code (see above)
│   ├── migrations/              # SQL migration files
│   ├── compose.yaml             # Docker Compose (PostgreSQL + Adminer)
│   └── .env.example             # Environment variable template
└── frontend/
    ├── app/
    │   ├── (auth)/              # Login & register pages
    │   └── (user)/              # Protected routes (dashboard, discover, server, room)
    ├── components/              # Reusable UI components
    ├── context/                 # React Context providers
    ├── hooks/                   # Custom React hooks (e.g. useWebSocket)
    ├── lib/                     # Auth utilities, API helpers
    └── types/                   # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- [Go 1.25+](https://go.dev/dl/)
- [Node.js 20+](https://nodejs.org/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)

---

### 1. Start the Database

```bash
cd backend
docker compose up -d
```

This starts **PostgreSQL** on port `5432` and **Adminer** on port `8080`.

---

### 2. Configure the Backend

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=changeme

# Server
SERVER_PORT=3001

# JWT
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
JWT_ACCESS_TTL_MIN=15
JWT_REFRESH_TTL_HOURS=168
JWT_ISSUER=chatApp
```

---

### 3. Run the Backend

```bash
cd backend
go run ./cmd/server/main.go
```

The API will be available at `http://localhost:3001`.

---

### 4. Configure the Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_APIURL=http://localhost:3001
API_URL=http://localhost:3001
```

---

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and receive tokens | No |
| `POST` | `/auth/refresh` | Refresh access token | No |
| `POST` | `/auth/logout` | Revoke refresh token | Yes |
| `GET` | `/auth/me` | Get current user | Yes |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/users` | List all users | Admin |
| `GET` | `/users/:id` | Get user by ID | Self / Admin |
| `PUT` | `/users/:id` | Update user | Self / Admin |
| `DELETE` | `/users/:id` | Delete user | Self / Admin |
| `PATCH` | `/users/:id/role` | Change global role | Admin |
| `GET` | `/users/:id/servers` | List user's servers | Self / Admin |

### Servers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/server` | List all servers | User |
| `POST` | `/server` | Create a server | User |
| `GET` | `/server/:id` | Get server | User |
| `PUT` | `/server/:id` | Update server | Admin |
| `DELETE` | `/server/:id` | Delete server | Admin |
| `POST` | `/server/:id/join` | Join a server | User |

### Rooms

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/server/:id/room` | Create room in server | Admin |
| `GET` | `/server/:id/room` | List rooms in server | User |
| `PUT` | `/server/:id/room/:roomID` | Update room | Admin |
| `DELETE` | `/server/:id/room/:roomID` | Delete room | Admin |
| `GET` | `/room/:id/users` | List room members | User |
| `POST` | `/room/:id/users/:userID` | Add member to room | User |
| `DELETE` | `/room/:id/users/:userID` | Remove member | User / Self |

### Messages

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/message` | Send a message | User |
| `GET` | `/message/room/:roomID` | Get messages in room | User |
| `PUT` | `/message/:id` | Edit message | Owner |
| `DELETE` | `/message/:id` | Delete message | Owner |

### WebSocket

```
WS /ws/room/:roomID?token=<accessToken>
```

Connects to a room's real-time hub. Emits and receives JSON message payloads.

---

## Permissions

Server-level roles support the following granular permissions:

| Permission | Description |
|---|---|
| `can_manage_rooms` | Create, edit, and delete rooms |
| `can_manage_members` | Add or remove server members |
| `can_mute_members` | Mute members in rooms |
| `can_delete_messages` | Delete any message in the server |

---

## Database Management

Adminer is available at `http://localhost:8080` during development.

- **System:** PostgreSQL
- **Server:** `db`
- **Username / Password / Database:** as configured in `.env`

---

## Scripts

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

### Backend

```bash
go run ./cmd/server/main.go   # Run the server
go build ./...                 # Build all packages
go test ./...                  # Run tests
docker compose up -d           # Start infrastructure
docker compose down            # Stop infrastructure
```

---

## License

MIT
