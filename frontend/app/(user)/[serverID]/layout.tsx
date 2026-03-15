'use client'

import { RoomGallery } from "@/components/roomGallery";
import { Room } from "@/types/room";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";


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
      <div className="flex flex-1 items-center justify-center">
        <p className="text-textMed">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  // TODO: fetch GET /api/servers/${serverID}/my-permissions → pass canManageRooms prop to RoomGallery

  return (
    <div className="flex flex-1 gap-6 overflow-hidden transition-colors">
      <RoomGallery rooms={rooms} serverID={serverID} selectedRoomID={roomID}/>
      {children}
    </div>
  );
}
