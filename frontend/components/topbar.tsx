'use client'

import { Server } from "@/types/server";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Topbar(params: { servers: Server[] | null }) {
  const { servers } = params
  const pathname = usePathname()
  const selectedServerID = pathname.split("/")[1]

  return (
    <header className="flex h-16 w-full items-center rounded-b-3xl border-b border-white/10 bg-white/5 px-6 shadow-lg shadow-black/30 backdrop-blur">
      <div className="mr-20 flex gap-2 justify-center content-center">
        <MailCheck />
        <h1 className="text-lg font-semibold text-white align-middle">chatAPP</h1>
      </div>
      <div className="flex gap-4">
        {servers && servers.map((server, i) => (
          <ServerBadges
            key={server.id}
            serverID={server.id}
            serverName={server.name}
            selected={selectedServerID ? selectedServerID === server.id : i === 0}
          />
        ))}
        {servers?.length === 0 && <p className="text-sm text-slate-400">No servers yet</p>}
      </div>
    </header>
  );
}

function ServerBadges(params: { serverName: string, serverID: string, selected: boolean }) {
  const { serverName, serverID, selected } = params

  return (
    <Link href={`/${serverID}`} className={`rounded-2xl p-2 outline-2 outline-gray-400 ${selected ? "bg-electricPurple" : ""} cursor-pointer`}>
      <h3 className="text-center font-semibold">{serverName}</h3>
    </Link>
  )
}
