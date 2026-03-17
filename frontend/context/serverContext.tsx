'use client'

import { Room } from "@/types/room"
import { EffectivePermissions } from "@/types/role"
import { Server } from "@/types/server"
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type ServerContextValue = {
  server: Server | null
  rooms: Room[]
  permissions: EffectivePermissions | null
  loading: boolean
  error: string | null
  refreshServer: () => Promise<void>
  refreshRooms: () => Promise<void>
}

const ServerContext = createContext<ServerContextValue | undefined>(undefined)

export function ServerProvider({ serverID, children }: { serverID: string; children: ReactNode }) {
  const router = useRouter()
  const [server, setServer] = useState<Server | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [permissions, setPermissions] = useState<EffectivePermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServer = useCallback(async () => {
    const res = await fetch(`/api/servers/${serverID}`, { cache: 'no-store' })
    if (res.status === 401) { router.push('/login'); return }
    if (res.ok) setServer(await res.json())
  }, [serverID, router])

  const fetchRooms = useCallback(async () => {
    const res = await fetch(`/api/servers/${serverID}/rooms`, { cache: 'no-store' })
    if (res.status === 401) { router.push('/login'); return }
    if (res.ok) setRooms(await res.json())
    else setRooms([])
  }, [serverID, router])

  const fetchPermissions = useCallback(async () => {
    const res = await fetch(`/api/servers/${serverID}/my-permissions`, { cache: 'no-store' })
    if (res.status === 401) { router.push('/login'); return }
    if (res.ok) setPermissions(await res.json())
    else setPermissions(null)
  }, [serverID, router])

  useEffect(() => {
    if (!serverID) return
    setLoading(true)
    setError(null)
    Promise.all([fetchServer(), fetchRooms(), fetchPermissions()])
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"))
      .finally(() => setLoading(false))
  }, [serverID, fetchServer, fetchRooms, fetchPermissions])

  return (
    <ServerContext.Provider value={{ server, rooms, permissions, loading, error, refreshServer: fetchServer, refreshRooms: fetchRooms }}>
      {children}
    </ServerContext.Provider>
  )
}

export function useServer() {
  const ctx = useContext(ServerContext)
  if (!ctx) throw new Error("useServer must be used within a ServerProvider")
  return ctx
}
