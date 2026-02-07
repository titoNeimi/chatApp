'use server'

import { Server } from "@/types/server";

export async function listUserServers(userID: string): Promise<Server[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_APIURL;
    if (!apiUrl) {
      return [];
    }

    const result = await fetch(`${apiUrl}/users/${userID}/servers`, {
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
