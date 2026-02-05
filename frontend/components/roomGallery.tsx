'use client'

import { Room } from "@/types/room";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function RoomGallery(params: {rooms?: Room[], selectedRoomID: string | null, handleSelectedRoom: (roomID: string) => void}) { 
  const [collapsed, setCollapsed] = useState(false);

  const {rooms, selectedRoomID, handleSelectedRoom} = params

  return ( 
    <aside 
      data-collapsed={collapsed} 
      className={`group relative flex shrink-0 flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur transition-[width] duration-300 ${ 
        collapsed ? "w-20 px-3 py-5" : "w-[320px] px-5 py-6" 
      }`} 
    > 
      <div className="flex items-center gap-2 justify-between w-full min-h-7">  
        <h2 className="mt-0 text-xl font-semibold text-white mb-0 whitespace-nowrap overflow-hidden transition-opacity duration-300 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:opacity-0"> 
          Rooms gallery 
        </h2>  
        <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-200 whitespace-nowrap overflow-hidden transition-opacity duration-300 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:opacity-0">  
          12 Online  
        </span>  
        <button  
          type="button"  
          className="rounded-full border border-white/10 p-1 text-slate-300 transition hover:border-purple-400/40 hover:text-white shrink-0"  
          aria-label={collapsed ? "Abrir sidebar" : "Cerrar sidebar"}  
          onClick={() => setCollapsed((prev) => !prev)}  
        >  
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}  
        </button>  
      </div> 

      {rooms && rooms.map((room) => ( 
        <RoomButton key={room.id} selected={selectedRoomID == room.id} room={room} handleSelectedRoom={handleSelectedRoom}/> 
      ))}

      {!rooms && (<div>
        <h2>No rooms available</h2>
      </div>)}
    </aside> 
  ); 
} 

function RoomButton(params: { selected: boolean; room: Room, handleSelectedRoom: (roomID: string) => void}) { 
  const { selected, room, handleSelectedRoom } = params; 
  return ( 
    <div 
      title={room.name}
      className={`flex h-32 w-full flex-col gap-2 rounded-2xl border p-4 text-left transition duration-200 ${ 
        selected 
          ? "border-purple-400/40 bg-purple-500/10 shadow-lg shadow-purple-500/20" 
          : "border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-purple-400/40 hover:bg-white/10 hover:shadow-lg hover:shadow-black/40" 
      } cursor-pointer group-data-[collapsed=true]:items-center group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:gap-0`} 
      onClick={() => handleSelectedRoom(room.id)}
    > 
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-purple-200 shadow-md shadow-purple-500/20 shrink-0"> 
        <Calendar className="h-5 w-5" /> 
      </div> 
      <div className="flex flex-col gap-1 min-w-0 transition-opacity duration-300 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:h-0 group-data-[collapsed=true]:opacity-0">
        <h2 className="text-base font-semibold text-white overflow-hidden text-ellipsis line-clamp-1">{room.name}</h2> 
        {room.description && ( 
          <p className="text-xs leading-relaxed italic text-slate-400 overflow-hidden text-ellipsis line-clamp-2">{room.description}</p> 
        )} 
      </div>
    </div> 
  ); 
}