'use client'

import { Hash, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { use } from "react";

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

  // TODO: fetch GET /api/servers/${serverID} → display real server name instead of serverID
  // TODO: fetch GET /api/servers/${serverID}/members → pass count to Members StatCard
  // TODO: fetch GET /api/servers/${serverID}/rooms → pass count to Rooms StatCard
  // TODO: fetch GET /api/servers/${serverID}/roles → pass count to Roles StatCard
  // TODO: conditionally show Settings link only if user has permissions (fetch my-permissions)

  return (
    <div className="flex w-full flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-electricPurple">Server</p>
        <h1 className="text-3xl font-bold text-textHigh">{serverID}</h1>
        <p className="text-sm text-textMed">Select a room from the sidebar to start chatting.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Members" value={0} />
        <StatCard icon={<Hash className="h-5 w-5" />} label="Rooms" value={0} />
        <StatCard icon={<Shield className="h-5 w-5" />} label="Roles" value={0} />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/${serverID}/settings`}
          className="inline-flex items-center gap-2 rounded-xl border border-softBorder px-4 py-2.5 text-sm font-semibold text-textMed transition hover:border-electricPurple/50 hover:text-textHigh"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
