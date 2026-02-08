import { Server } from "@/types/server";

export async function listUserServers(): Promise<Server[]> {
  try {
    const result = await fetch(`/api/users/me/servers`, {
      cache: "no-store",
    });

    if (!result.ok) {
      return [];
    }

    const data: Server[] = await result.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
