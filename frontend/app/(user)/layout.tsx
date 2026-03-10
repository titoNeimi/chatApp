'use client'

import { Topbar } from "@/components/topbar";
import { Server } from "@/types/server";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [servers, setServers] = useState<Server[] | null>(null);

  useEffect(() => {
    const fetchUserServers = async () => {
      try {
        const result = await fetch('/api/users/me/servers', { cache: 'no-store' });
        if (result.status === 401) {
          router.push('/login');
          return;
        }
        if (!result.ok) {
          setServers([]);
          return;
        }
        const data: Server[] = await result.json();
        setServers(data);
      } catch (error) {
        console.error(error);
        setServers([]);
      }
    };

    fetchUserServers();
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(1200px_circle_at_top_left,var(--color-purpleGlow)_0%,transparent_40%),linear-gradient(180deg,var(--color-deepNavy)_0%,var(--color-surfaceNavy)_100%)]">
      <Topbar servers={servers} />
      <div className="flex flex-1 flex-col px-5 py-6">
        {children}
      </div>
      {/* FAB: create a server or join via invite */}
      <button
        type="button"
        aria-label="Create or join a server"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-electricPurple text-white shadow-[0_0_24px_var(--color-purpleGlow)] transition hover:opacity-90 active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
