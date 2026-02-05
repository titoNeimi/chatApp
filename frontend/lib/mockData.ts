import { Room } from "@/types/room";

export const RoomMocks: Room[] = [
  {
    id: "room1",
    name: "Canal general",
    description: "Canal para hablar temas varios",
    server_id: "pepito_server",
    type: "server",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "room2",
    name: "Anuncios",
    description: "Canal para leer los anuncios",
    server_id: "pepito_server",
    type: "server",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "room3",
    name: "Code chat",
    description: "Canal para hablar sobre codigo",
    server_id: "pepito_server",
    type: "server",
    created_at: new Date(),
    updated_at: new Date()
  }
]