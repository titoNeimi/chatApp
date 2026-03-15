'use client'

import { useUser } from "@/context/userContext";
import { Server } from "@/types/server";
import { User } from "@/types/user";
import { Globe, Shield, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Tab = "overview" | "users" | "servers";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "servers", label: "Servers" },
];

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!isLoading && user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== "admin") return null;

  return (
    <section className="flex h-[calc(100dvh-8.5rem)] min-h-120 w-full flex-col overflow-hidden rounded-2xl bg-surfaceNavy shadow-[0_20px_40px_var(--color-panelShadow)]">
      <header className="flex shrink-0 flex-col gap-1 border-b border-softBorder px-6 pt-6 pb-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electricPurple/10 text-electricPurple">
            <Shield className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-bold text-textHigh">Admin Dashboard</h1>
        </div>
        <p className="text-sm text-textMed">Manage users, servers, and platform settings.</p>
        <nav className="mt-4 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "border-electricPurple text-electricPurple"
                  : "border-transparent text-textMed hover:text-textHigh"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="custom-scroll flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "servers" && <ServersTab />}
      </div>
    </section>
  );
}

/* ─── Overview ──────────────────────────────────────────────────────────── */

function OverviewTab() {
  // TODO: fetch GET /api/users → derive totalUsers from response array length
  // TODO: fetch GET /api/servers → derive totalServers from response array length

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={0}
          accent="text-electricPurple"
          bg="bg-electricPurple/10"
        />
        <StatCard
          icon={<Globe className="h-5 w-5" />}
          label="Total Servers"
          value={0}
          accent="text-blue-400"
          bg="bg-blue-400/10"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  bg: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-deepNavy p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${accent}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-textHigh">{value}</p>
      <p className="text-sm text-textMed">{label}</p>
    </div>
  );
}

/* ─── Users ─────────────────────────────────────────────────────────────── */

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  // TODO: on mount fetch GET /api/users → setUsers(data)

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className={inputCls + " max-w-xs"}
        />
        <span className="text-xs text-textMed">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="text-sm text-textMed">No users found.</p>
        )}
        {filtered.map((u) => (
          <UserRow
            key={u.id}
            user={u}
            onRoleChange={(newRole) => {
              // TODO: call PATCH /api/users/${u.id}/role with { role: newRole }
              setUsers((prev) =>
                prev.map((m) => (m.id === u.id ? { ...m, role: newRole } : m))
              );
            }}
            onDelete={() => {
              // TODO: call DELETE /api/users/${u.id}
              setUsers((prev) => prev.filter((m) => m.id !== u.id));
            }}
          />
        ))}
      </div>
    </div>
  );
}

function UserRow({
  user,
  onRoleChange,
  onDelete,
}: {
  user: User;
  onRoleChange: (role: "user" | "admin") => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRoleChange, setConfirmRoleChange] = useState(false);
  const targetRole = user.role === "admin" ? "user" : "admin";

  return (
    <div className="flex items-center gap-3 rounded-xl bg-deepNavy px-4 py-3">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center text-sm font-semibold text-white">
        <span className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-softBorder" />
        <span className="relative z-10 flex h-8 w-8 items-center justify-center [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-electricPurple">
          {user.username.slice(0, 2).toUpperCase()}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-textHigh">{user.username}</p>
        <p className="truncate text-xs text-textMed">{user.email}</p>
      </div>

      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          user.role === "admin"
            ? "bg-electricPurple/20 text-electricPurple"
            : "bg-deepNavy text-textMed ring-1 ring-softBorder"
        }`}
      >
        {user.role === "admin" && <Shield className="h-3 w-3" />}
        {user.role === "admin" ? "Admin" : "User"}
      </span>

      {confirmRoleChange ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-textMed">Make {targetRole}?</span>
          <button
            type="button"
            onClick={() => { onRoleChange(targetRole); setConfirmRoleChange(false); }}
            className="rounded-full bg-electricPurple px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setConfirmRoleChange(false)}
            className="rounded-full border border-softBorder px-3 py-1 text-xs font-semibold text-textMed transition hover:text-textHigh"
          >
            No
          </button>
        </div>
      ) : confirmDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400">Delete user?</span>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded-full border border-softBorder px-3 py-1 text-xs font-semibold text-textMed transition hover:text-textHigh"
          >
            No
          </button>
        </div>
      ) : (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setConfirmRoleChange(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-softBorder px-2.5 py-1.5 text-xs font-semibold text-textMed transition hover:border-electricPurple/50 hover:text-electricPurple"
          >
            <Shield className="h-3 w-3" />
            Change Role
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-textMed transition hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Delete ${user.username}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Servers ───────────────────────────────────────────────────────────── */

function ServersTab() {
  const [servers, setServers] = useState<Server[]>([]);
  const [search, setSearch] = useState("");

  // TODO: on mount fetch GET /api/servers → setServers(data)

  const filtered = servers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search servers..."
          className={inputCls + " max-w-xs"}
        />
        <span className="text-xs text-textMed">
          {filtered.length} server{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="text-sm text-textMed">No servers found.</p>
        )}
        {filtered.map((s) => (
          <ServerRow
            key={s.id}
            server={s}
            onDelete={() => {
              // TODO: call DELETE /api/servers/${s.id}
              setServers((prev) => prev.filter((m) => m.id !== s.id));
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ServerRow({ server, onDelete }: { server: Server; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-xl bg-deepNavy px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electricPurple/10 text-electricPurple text-sm font-bold">
        {server.name.slice(0, 2).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-textHigh">{server.name}</p>
        <p className="truncate font-mono text-xs text-textMed">{server.id}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs text-textMed">
          {server.room_ids?.length ?? 0} room{(server.room_ids?.length ?? 0) !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-textMed">
          {new Date(server.created_at).toLocaleDateString()}
        </p>
      </div>

      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400">Delete?</span>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded-full border border-softBorder px-3 py-1 text-xs font-semibold text-textMed transition hover:text-textHigh"
          >
            No
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-textMed transition hover:bg-red-500/10 hover:text-red-400"
          aria-label={`Delete ${server.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* ─── Shared ─────────────────────────────────────────────────────────────── */

const inputCls =
  "w-full rounded-lg border border-softBorder bg-deepNavy px-3 py-2.5 text-sm text-textHigh placeholder:text-textMed/50 outline-none transition focus:border-electricPurple focus:shadow-[0_0_0_2px_var(--color-purpleGlow)]";
