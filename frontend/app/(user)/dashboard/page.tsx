'use client'
import { RoomGallery } from "@/components/roomGallery";
import { RoomMocks } from "@/lib/mockData";
import { useState } from "react";

export default function Dashboard() {
  const [selectedRoomID, setSelectedRoomID] = useState<string | null>(null);
  
  const handleSelectedRoom = (roomID: string) => {
    setSelectedRoomID(roomID)
  }

  return ( 
    <section className="min-h-screen bg-[#0b0f1a] text-slate-100"> 
      <div className="flex min-h-screen gap-10 bg-[radial-gradient(1200px_circle_at_top,#151a2b_0%,#0b0f1a_55%,#090c14_100%)] px-6 py-8"> 
        <RoomGallery rooms={RoomMocks} handleSelectedRoom={handleSelectedRoom} selectedRoomID={selectedRoomID}/> 
        <div className="flex w-full flex-col justify-center"> 
          <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30 backdrop-blur"> 
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Dashboard</p> 
            <h1 className="mt-3 text-3xl font-semibold text-white">{RoomMocks.find(room => room.id == selectedRoomID)?.name ?? "Dashboard"}</h1> 
            <p className="mt-3 text-sm leading-relaxed text-slate-400"> 
              Welcome to your dashboard! Here you can manage your account and settings. 
            </p> 
          </div> 
        </div> 
      </div> 
    </section> 
  ); 
} 
