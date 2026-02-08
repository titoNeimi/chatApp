'use client'

import { RoomGallery } from "@/components/roomGallery";
import { Room } from "@/types/room";
import { Server } from "@/types/server";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/topbar";


type RouteParams = {
  serverID?: string | string[];
  roomID?: string | string[];
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const params = useParams<RouteParams>();
  const serverID = useMemo(() => {
    const value = params?.serverID;
    return Array.isArray(value) ? value[0] : value ?? "";
  }, [params]);

  const roomID = useMemo(() => {
    const value = params?.roomID;
    if (!value) return null;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true)
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [servers, setServers] = useState<Server[] | null>(null)

  useEffect(() => {
    const fetchUserServers = async () => {
      try {
        const result = await fetch('/api/users/me/servers', { cache: 'no-store' })
        if (result.status === 401) {
          router.push('/login')
          return
        }
        if (!result.ok) {
          setServers([])
          return
        }

        const data: Server[] = await result.json()
        setServers(data)
      } catch (error) {
        console.error(error)
        setServers([])
      }
    }

    fetchUserServers()
  }, [router])
  
  useEffect(() => {
    setLoading(true)
    const fetchRoomFromServer = async () => {
      try {
        if (!serverID) return
        const result = await fetch(`/api/servers/${serverID}/rooms`, { cache: 'no-store' })
        if (result.status === 401) {
          router.push('/login')
          return
        }
        if (!result.ok) {
          setRooms([])
          return
        }
        const rooms: Room[] = await result.json()
        if (!rooms[0]) return
        setRooms(rooms)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error")
      } finally{
        setLoading(false)
      }
    }
    fetchRoomFromServer()
  }, [router, serverID])
  
  if (loading) {
    return (
      <>
        <Topbar servers={servers} />
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(1200px_circle_at_top_left,var(--color-purpleGlow)_0%,transparent_40%),linear-gradient(180deg,var(--color-deepNavy)_0%,var(--color-surfaceNavy)_100%)]">
          <p className="text-textMed">Loading...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Topbar servers={servers} />
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(1200px_circle_at_top_left,var(--color-purpleGlow)_0%,transparent_40%),linear-gradient(180deg,var(--color-deepNavy)_0%,var(--color-surfaceNavy)_100%)]">
          <p className="text-red-500">{error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar servers={servers} />
      <div className="flex flex-1 gap-6 overflow-hidden bg-[radial-gradient(1200px_circle_at_top_left,var(--color-purpleGlow)_0%,transparent_40%),linear-gradient(180deg,var(--color-deepNavy)_0%,var(--color-surfaceNavy)_100%)] px-5 py-6 transition-colors">
        <RoomGallery rooms={rooms} serverID={serverID} selectedRoomID={roomID}/> 
        {children}
      </div>
    </>
  );
}
