'use client'

import { Category, CategoryFilter, ServerCard, ServerCardData } from "@/components/serverCards";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DiscoverPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servers, setServers] = useState<ServerCardData[]>([]);
  const [category, setCategory] = useState<Category>("All");

  const router = useRouter()

  const handleJoinServer = async (serverID: string) => {
    try {
      const response = await fetch(`/api/servers/${serverID}/join`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Failed to join server: ${response.statusText}`);
      }
      router.push(`/${serverID}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const result = await fetch('/api/servers/discover', { cache: 'no-store' })
        const data: ServerCardData[] = await result.json()
        setServers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, []);

  return (
    <section className="flex flex-1 flex-col gap-6 text-textHigh">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">Discover Communities</h2>
          <p className="mt-1 text-textMed">Explore the new digital frontiers</p>
        </div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 rounded-full border border-softBorder px-4 py-2 text-sm font-semibold text-textMed transition hover:border-electricPurple/60 hover:text-textHigh"
        >
          See All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <CategoryFilter selected={category} onChange={setCategory} />

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
