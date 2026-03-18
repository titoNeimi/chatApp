'use client'

import { useServer } from "@/context/serverContext";
import { useUser } from "@/context/userContext";
import { Hash, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  loading?: boolean;
};

function StatCard({ icon, label, value, loading }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surfaceNavy p-5 shadow-[0_8px_24px_var(--color-panelShadow)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-deepNavy text-electricPurple">
        {icon}
      </div>
      {loading
        ? <div className="h-8 w-12 animate-pulse rounded-lg bg-deepNavy" />
        : <p className="text-2xl font-bold text-textHigh">{value}</p>
      }
      <p className="text-sm text-textMed">{label}</p>
    </div>
  );
}

export default function ServerPage({ params }: { params: Promise<{ serverID: string }> }) {
  const { serverID } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const { server, permissions } = useServer();
  const isAppAdmin = user?.role === "admin";
  const canManageServer = isAppAdmin || permissions?.can_manage_members || permissions?.can_manage_rooms;

  const [stats, setStats] = useState({ member_count: 0, room_count: 0, role_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/servers/${serverID}/stats`, { cache: 'no-store' });
        if (res.status === 401) { router.push('/login'); return; }
        if (res.ok) setStats(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [serverID, router]);

  return (
    <div className="flex w-full flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-electricPurple">Server</p>
        <h1 className="text-3xl font-bold text-textHigh">{server?.name}</h1>
        <p className="text-sm text-textMed">Select a room from the sidebar to start chatting.</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Members" value={stats.member_count} loading={loading} />
        <StatCard icon={<Hash className="h-5 w-5" />} label="Rooms" value={stats.room_count} loading={loading} />
        <StatCard icon={<Shield className="h-5 w-5" />} label="Roles" value={stats.role_count} loading={loading} />
      </div>

      {/* Quick actions */}
      {canManageServer && (
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${serverID}/settings`}
            className="inline-flex items-center gap-2 rounded-xl border border-softBorder px-4 py-2.5 text-sm font-semibold text-textMed transition hover:border-electricPurple/50 hover:text-textHigh"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      )}
    </div>
  );
}
