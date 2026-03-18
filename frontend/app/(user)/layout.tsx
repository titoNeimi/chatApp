'use client'

import { Topbar } from "@/components/topbar";
import { UserServersProvider } from "@/context/userServersContext";
import { Server } from "@/types/server";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [servers, setServers] = useState<Server[] | null>(null);

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

  useEffect(() => {
    fetchUserServers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const contextValue = useMemo(
    () => ({ servers, refresh: fetchUserServers }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [servers]
  );

  return (
    <UserServersProvider value={contextValue}>
      <div className="flex flex-col min-h-screen bg-[radial-gradient(1200px_circle_at_top_left,var(--color-purpleGlow)_0%,transparent_40%),linear-gradient(180deg,var(--color-deepNavy)_0%,var(--color-surfaceNavy)_100%)]">
        <Topbar />
        <div className="flex flex-1 flex-col px-5 py-6">
          {children}
        </div>
      </div>
    </UserServersProvider>
  );
}
