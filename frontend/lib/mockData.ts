import { Room } from "@/types/room";
import { Server } from "@/types/server";

export type ChatMockUser = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarTone: string;
};

export type ChatMockMessage = {
  id: string;
  userID: string;
  content: string;
  timeUTC: string;
  type: "text" | "attachment";
  fileName?: string;
};

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

export const ServerMocks: Server[] = [
  {
    id: "server1",
    name: "El server de Joa",
    description: "El mejor server que vas a ver nunca",
    room_ids: [],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: "server2",
    name: "Server de mierda",
    description: "El mejor server que vas a ver nunca",
    room_ids: [],
    created_at: new Date(),
    updated_at: new Date()
  }
]

export const mockedUsers: Record<string, ChatMockUser> = {
  "user-sarah": {
    id: "user-sarah",
    name: "Sarah",
    handle: "Sarah.dev",
    initials: "S",
    avatarTone: "bg-orange-500",
  },
  "user-kris": {
    id: "user-kris",
    name: "Kris99",
    handle: "Kris99",
    initials: "K",
    avatarTone: "bg-violet-600",
  },
};

export const mockedMessages: ChatMockMessage[] = [
  {
    id: "msg-001",
    userID: "user-sarah",
    content:
      "Has anyone noticed the new protocol optimization? The response times in the sub-grids are incredibly low today.",
    timeUTC: "14:05 UTC",
    type: "text",
  },
  {
    id: "msg-002",
    userID: "user-kris",
    content:
      "Yes! I just finished the staging tests. We saw a 40% reduction in peak latency. The architectural shift to the hub-spoke model is really paying off.",
    timeUTC: "14:08 UTC",
    type: "text",
  },
  {
    id: "msg-003",
    userID: "user-kris",
    content: "metrics_v2.png",
    timeUTC: "14:10 UTC",
    type: "attachment",
    fileName: "metrics_v2.png",
  },
  {
    id: "msg-004",
    userID: "user-sarah",
    content:
      "Incredible work. Can we port this logic to the legacy nodes or is it restricted to the new core?",
    timeUTC: "14:14 UTC",
    type: "text",
  },
];
