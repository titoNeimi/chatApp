'use client'
import { listServerRooms } from "@/actions/room";
import { Room } from "@/types/room";
import { useEffect, useState } from "react";


export default function ServerPage({params}: {params: Promise<{ serverID: string }>}) {
  const [serverID, setServerID] = useState<string>("")
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true)
  const [rooms, setRooms] = useState<Room[] | null>(null)

  useEffect(() => {
    const initializeServerID = async () => {
      try {
        const { serverID } = await params
        setServerID(serverID)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error")
      }
    }
    initializeServerID()
  }, [params])

  useEffect(() => {
    setLoading(true)
    const fetchRoomFromServer = async () => {
      try {
        if (!serverID) return
        const rooms = await listServerRooms(serverID)
        if (!rooms[0]) return
        setRooms(rooms)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error")
      } finally{
        setLoading(false)
      }
    }
    fetchRoomFromServer()
  }, [serverID])


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }
  return (
    <div className="flex w-full flex-col justify-center overflow-hidden"> 
      <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30 backdrop-blur"> 
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Dashboard</p> 
        <h1 className="mt-3 text-3xl font-semibold text-white">Dashboard</h1> 
        <p className="mt-3 text-sm leading-relaxed text-slate-400"> 
          Welcome to your dashboard! Here you can manage your account and settings. 
        </p> 
      </div> 
    </div> 
  )
}