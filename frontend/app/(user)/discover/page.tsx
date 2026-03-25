'use client'

import { Category, CategoryFilter, ServerCard, ServerCardData } from "@/components/serverCards";
import { ServerActionModal } from "@/components/serverActionModal";
import { useUserServers } from "@/context/userServersContext";
import { Flame, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TrendingServer } from "@/types/server";

type ViewMode = "all" | "trending";

export default function DiscoverPage() {
  const { refresh: refreshServers } = useUserServers();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servers, setServers] = useState<ServerCardData[]>([]);
  const [category, setCategory] = useState<Category>("All");
  const [view, setView] = useState<ViewMode>("all");
  const [addServerOpen, setAddServerOpen] = useState(false);

  const router = useRouter()

  const handleJoinServer = async (serverID: string) => {
    try {
      const response = await fetch(`/api/servers/${serverID}/join`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Failed to join server: ${response.statusText}`);
      }
      await refreshServers();
      router.push(`/${serverID}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  useEffect(() => {
    const fetchServers = async () => {
      setLoading(true);
      setError(null);
      try {
        if (view === "trending") {
          const result = await fetch('/api/servers/trending', { cache: 'no-store' })
          if (!result.ok) throw new Error(result.statusText);
          const data: TrendingServer[] = await result.json()
          setServers(data.map((s) => ({
            ...s,
            created_at: new Date(s.created_at),
            updated_at: new Date(s.updated_at),
            memberCount: `${s.member_count}`,
            badge: "trending" as const,
          })))
        } else {
          const result = await fetch('/api/servers/discover', { cache: 'no-store' })
          if (!result.ok) throw new Error(result.statusText);
          const data: ServerCardData[] = await result.json()
          setServers(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, [view]);

  return (
    <section className="flex flex-1 flex-col gap-6 text-textHigh">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">Discover Communities</h2>
          <p className="mt-1 text-textMed">Explore the new digital frontiers</p>
        </div>
        <button
          type="button"
          onClick={() => setView(view === "trending" ? "all" : "trending")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            view === "trending"
              ? "bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.4)]"
              : "border border-softBorder text-textMed hover:border-emerald-500/60 hover:text-textHigh"
          }`}
        >
          <Flame className="h-4 w-4" /> Trending
        </button>
      </div>

      <ServerActionModal open={addServerOpen} onClose={() => setAddServerOpen(false)} onServerCreated={() => {}} />

      <button
        type="button"
        onClick={() => setAddServerOpen(true)}
        className="fixed bottom-8 right-8 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-electricPurple text-white shadow-[0_0_24px_var(--color-purpleGlow)] transition hover:opacity-90 hover:shadow-[0_0_32px_var(--color-purpleGlow)] active:scale-95"
        aria-label="Add server"
      >
        <Plus className="h-6 w-6" />
      </button>

      {view === "all" && <CategoryFilter selected={category} onChange={setCategory} />}

      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-textMed">Loading...</p>
        </div>
      )}
      {error && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      {!loading && !error && servers.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-textMed">No servers found.</p>
        </div>
      )}

      {!loading && !error && servers.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {servers.map((server) => (
            <ServerCard key={server.id} serverData={server} onJoin={handleJoinServer}/>
          ))}
        </div>
      )}
    </section>
  );
}
