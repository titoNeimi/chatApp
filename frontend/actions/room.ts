'use server'

import { Room } from "@/types/room";

export async function listServerRooms(serverID: string): Promise<Room[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_APIURL
    const result = await fetch(`${apiUrl}/server/${serverID}/room`)

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