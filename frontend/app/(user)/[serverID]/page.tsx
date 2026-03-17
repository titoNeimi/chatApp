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
};

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surfaceNavy p-5 shadow-[0_8px_24px_var(--color-panelShadow)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-deepNavy text-electricPurple">
        {icon}
      </div>
      <p className="text-2xl font-bold text-textHigh">{value}</p>
      <p className="text-sm text-textMed">{label}</p>
    </div>
  );
}

export default function ServerPage({ params }: { params: Promise<{ serverID: string }> }) {
  const { serverID } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const { server, rooms, permissions } = useServer();
  const isAppAdmin = user?.role === "admin";
  const canManageServer = isAppAdmin || permissions?.can_manage_members || permissions?.can_manage_rooms;

  const [memberCount, setMemberCount] = useState<number>(0);
  const [roleCount, setRoleCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Change fetches so they return the count instead of the whole array, to reduce bandwidth and loading times

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const [membersRes, rolesRes] = await Promise.all([
          fetch(`/api/servers/${serverID}/members`, { cache: 'no-store' }),
          fetch(`/api/servers/${serverID}/roles`, { cache: 'no-store' }),
        ]);

        if (membersRes.status === 401 || rolesRes.status === 401) {
          router.push('/login');
          return;
        }

        if (membersRes.ok) setMemberCount((await membersRes.json()).length);
        if (rolesRes.ok) setRoleCount((await rolesRes.json()).length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [serverID, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-textMed">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-electricPurple">Server</p>
        <h1 className="text-3xl font-bold text-textHigh">{server?.name}</h1>
        <p className="text-sm text-textMed">Select a room from the sidebar to start chatting.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Members" value={memberCount} />
        <StatCard icon={<Hash className="h-5 w-5" />} label="Rooms" value={rooms.length} />
        <StatCard icon={<Shield className="h-5 w-5" />} label="Roles" value={roleCount} />
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
