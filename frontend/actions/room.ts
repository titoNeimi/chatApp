import { Room } from "@/types/room";

export async function listServerRooms(serverID: string): Promise<Room[]> {
  try {
    const result = await fetch(`/api/servers/${serverID}/rooms`, { cache: "no-store" })

    if (!result.ok) {
      return []
    }

    const data: Room[] = await result.json()
    return data
  } catch (error) {
    console.log(error)
    return []
  }
}
