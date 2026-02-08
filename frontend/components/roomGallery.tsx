'use client'

import { Room } from "@/types/room";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function RoomGallery(params: {rooms: Room[] | null, selectedRoomID: string | null, serverID: string}) { 
  const [collapsed, setCollapsed] = useState(false);

  const {rooms, selectedRoomID, serverID} = params

  return ( 
    <aside 
      data-collapsed={collapsed} 
      className={`group relative flex shrink-0 flex-col gap-4 rounded-3xl bg-surfaceNavy shadow-[0_18px_45px_var(--color-panelShadow)] backdrop-blur transition-[width] duration-300 ${ 
        collapsed ? "w-20 px-3 py-5" : "w-[320px] px-5 py-6" 
      }`} 
    > 
      <div className="flex items-center gap-2 justify-between w-full min-h-7">  
        <h2 className="mt-0 mb-0 overflow-hidden whitespace-nowrap text-xl font-semibold text-textHigh transition-opacity duration-300 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:opacity-0"> 
          Rooms gallery 
        </h2>  
        <span className="overflow-hidden whitespace-nowrap rounded-full bg-deepNavy px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-electricPurple transition-opacity duration-300 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:opacity-0">  
          12 Online  
        </span>  
        <button  
          type="button"  
          className="shrink-0 rounded-full p-1 text-textMed transition hover:bg-deepNavy hover:text-textHigh"  
          aria-label={collapsed ? "Abrir sidebar" : "Cerrar sidebar"}  
          onClick={() => setCollapsed((prev) => !prev)}  
        >  
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}  
        </button>  
      </div> 

      {rooms && rooms.map((room) => ( 
        <RoomButton key={room.id} selected={selectedRoomID == room.id} room={room} serverID={serverID}/> 
      ))}

      {!rooms && (<div>
        <h2 className={`text-textMed ${collapsed ? "hidden" : ""}`}>No rooms available</h2>
      </div>)}
    </aside> 
  ); 
} 

function RoomButton(params: { selected: boolean; room: Room, serverID: string}) { 
  const { selected, room, serverID } = params; 
  return ( 
    <Link href={`/${serverID}/${room.id}`} 
      title={room.name}
      className={`flex h-32 w-full flex-col gap-2 rounded-2xl p-4 text-left transition duration-200 ${ 
        selected 
          ? "bg-deepNavy shadow-[0_12px_24px_var(--color-purpleGlow)]" 
          : "bg-deepNavy hover:-translate-y-0.5 hover:shadow-[0_12px_24px_var(--color-panelShadow)]" 
      } cursor-pointer group-data-[collapsed=true]:items-center group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:gap-0`} 
    > 
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surfaceNavy text-electricPurple shadow-sm"> 
        <Calendar className="h-5 w-5" /> 
      </div> 
      <div className="flex flex-col gap-1 min-w-0 transition-opacity duration-300 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:h-0 group-data-[collapsed=true]:opacity-0">
        <h2 className="line-clamp-1 overflow-hidden text-ellipsis text-base font-semibold text-textHigh">{room.name}</h2> 
        {room.description && ( 
          <p className="line-clamp-2 overflow-hidden text-ellipsis text-xs leading-relaxed italic text-textMed">{room.description}</p> 
        )} 
      </div>
    </Link> 
  )
}
