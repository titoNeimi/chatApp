'use client'

import { RoomGallery } from "@/components/roomGallery";
import { ServerProvider, useServer } from "@/context/serverContext";
import { useParams } from "next/navigation";
import { useMemo } from "react";

type RouteParams = {
  serverID?: string | string[];
  roomID?: string | string[];
};

function ServerLayout({ children }: { children: React.ReactNode }) {
  const { rooms, loading, error } = useServer()
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

  return (
    <div className="flex flex-1 gap-6 overflow-hidden transition-colors">
      <RoomGallery rooms={rooms} serverID={serverID} selectedRoomID={roomID} />
      {children}
    </div>
  )
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const params = useParams<RouteParams>();
  const serverID = useMemo(() => {
    const value = params?.serverID;
    return Array.isArray(value) ? value[0] : value ?? "";
  }, [params]);

  return (
    <ServerProvider serverID={serverID}>
      <ServerLayout>{children}</ServerLayout>
    </ServerProvider>
  );
}
