'use client'

import { Room } from "@/types/room";
import { useUser } from "@/context/userContext";
import {
  AlertTriangle,
  ChevronDown,
  Copy,
  Hash,
  Link2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserMinus,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = "overview" | "members" | "rooms" | "invitations";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "rooms", label: "Rooms" },
  { id: "invitations", label: "Invitations" },
];

export default function ServerSettingsPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams<{ serverID: string }>();
  const serverID = params?.serverID ?? "";
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace(`/${serverID}`);
    }
  }, [user, serverID, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <section className="flex h-[calc(100dvh-8.5rem)] min-h-120 w-full flex-col overflow-hidden rounded-2xl bg-surfaceNavy shadow-[0_20px_40px_var(--color-panelShadow)]">
      <header className="flex shrink-0 flex-col gap-1 border-b border-softBorder px-6 pt-6 pb-0">
        <h1 className="text-xl font-bold text-textHigh">Server Settings</h1>
        <p className="text-sm text-textMed">Manage your server configuration and members.</p>
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
        {activeTab === "members" && <MembersTab />}
        {activeTab === "rooms" && <RoomsTab serverID={serverID} />}
        {activeTab === "invitations" && <InvitationsTab />}
      </div>
    </section>
  );
}

/* ─── Overview ──────────────────────────────────────────────────────────── */

function OverviewTab() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <SettingsCard title="General">
        <Field label="Server Name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Server"
            className={inputCls}
          />
        </Field>
        <Field label="Description">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this server about?"
            className={`${inputCls} resize-none`}
          />
        </Field>
        <button
          type="button"
          disabled={!name.trim()}
          className="self-start rounded-full bg-electricPurple px-5 py-2 text-sm font-semibold text-white shadow-[0_0_16px_var(--color-purpleGlow)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save Changes
        </button>
      </SettingsCard>

      <SettingsCard title="Danger Zone" danger>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-textHigh">Delete this server</p>
            <p className="text-xs text-textMed">This action is permanent and cannot be undone.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
          >
            <AlertTriangle className="h-4 w-4" />
            Delete Server
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}

/* ─── Members ───────────────────────────────────────────────────────────── */

const MOCK_MEMBERS = [
  { id: "1", username: "Alice", role: "admin" as const },
  { id: "2", username: "Bob", role: "user" as const },
  { id: "3", username: "Charlie", role: "user" as const },
];

function MembersTab() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_MEMBERS.filter((m) =>
    m.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className={`${inputCls} max-w-xs`}
        />
        <span className="text-xs text-textMed">
          {filtered.length} member{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex max-w-xl flex-col gap-2">
        {filtered.map((member) => (
          <MemberRow key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: { id: string; username: string; role: "admin" | "user" } }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-deepNavy px-4 py-3">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center text-sm font-semibold text-white">
        <span className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-softBorder" />
        <span className="relative z-10 flex h-8 w-8 items-center justify-center [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-electricPurple">
          {member.username.slice(0, 2).toUpperCase()}
        </span>
      </span>

      <span className="min-w-0 flex-1 text-sm font-semibold text-textHigh">{member.username}</span>

      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        member.role === "admin"
          ? "bg-electricPurple/20 text-electricPurple"
          : "bg-deepNavy text-textMed ring-1 ring-softBorder"
      }`}>
        {member.role === "admin" && <Shield className="h-3 w-3" />}
        {member.role === "admin" ? "Admin" : "User"}
      </span>

      <div className="relative">
        <select
          defaultValue={member.role}
          className="appearance-none rounded-lg border border-softBorder bg-surfaceNavy py-1.5 pl-3 pr-7 text-xs text-textMed transition focus:border-electricPurple focus:outline-none"
          aria-label="Change role"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-textMed" />
      </div>

      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-textMed transition hover:bg-red-500/10 hover:text-red-400"
        aria-label={`Remove ${member.username}`}
      >
        <UserMinus className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─── Rooms ─────────────────────────────────────────────────────────────── */

function RoomsTab({ serverID }: { serverID: string }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`/api/servers/${serverID}/rooms`, { cache: "no-store" });
        if (res.ok) setRooms(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [serverID]);

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-textMed">
          {rooms.length} room{rooms.length !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => { setShowCreate((v) => !v); setEditingRoom(null); }}
          className="inline-flex items-center gap-2 rounded-full bg-electricPurple px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_var(--color-purpleGlow)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Room
        </button>
      </div>

      {showCreate && (
        <RoomForm
          title="Create Room"
          onCancel={() => setShowCreate(false)}
          onSubmit={() => setShowCreate(false)}
        />
      )}

      {loading && <p className="text-sm text-textMed">Loading rooms...</p>}

      <div className="flex flex-col gap-2">
        {rooms.map((room) =>
          editingRoom?.id === room.id ? (
            <RoomForm
              key={room.id}
              title="Edit Room"
              initialName={room.name}
              initialDescription={room.description}
              onCancel={() => setEditingRoom(null)}
              onSubmit={() => setEditingRoom(null)}
            />
          ) : (
            <RoomRow
              key={room.id}
              room={room}
              onEdit={() => setEditingRoom(room)}
            />
          )
        )}
        {!loading && rooms.length === 0 && !showCreate && (
          <p className="text-sm text-textMed">No rooms yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}

function RoomRow({ room, onEdit }: { room: Room; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-deepNavy px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surfaceNavy text-electricPurple">
        <Hash className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-textHigh">{room.name}</p>
        {room.description && (
          <p className="truncate text-xs text-textMed">{room.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-textMed transition hover:bg-surfaceNavy hover:text-electricPurple"
        aria-label={`Edit ${room.name}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-textMed transition hover:bg-red-500/10 hover:text-red-400"
        aria-label={`Delete ${room.name}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function RoomForm({
  title,
  initialName = "",
  initialDescription = "",
  onCancel,
  onSubmit,
}: {
  title: string;
  initialName?: string;
  initialDescription?: string;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-electricPurple/30 bg-deepNavy p-4">
      <p className="text-sm font-semibold text-textHigh">{title}</p>
      <Field label="Room Name" required>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="general"
          className={inputCls}
        />
      </Field>
      <Field label="Description">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this room for?"
          className={inputCls}
        />
      </Field>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!name.trim()}
          onClick={onSubmit}
          className="rounded-full bg-electricPurple px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-softBorder px-4 py-1.5 text-sm font-semibold text-textMed transition hover:border-textMed hover:text-textHigh"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Invitations ───────────────────────────────────────────────────────── */

const MOCK_INVITES = [
  { id: "1", code: "chatapp.io/invite/xK9mQp", uses: 3, maxUses: 10, expiresAt: "2026-03-18" },
  { id: "2", code: "chatapp.io/invite/zR2vNt", uses: 0, maxUses: 1, expiresAt: "2026-03-12" },
];

function InvitationsTab() {
  const [invites, setInvites] = useState(MOCK_INVITES);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-textMed">
          {invites.length} active link{invites.length !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-electricPurple px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_var(--color-purpleGlow)] transition hover:opacity-90"
        >
          <Link2 className="h-4 w-4" />
          Generate Link
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {invites.map((invite) => (
          <div key={invite.id} className="flex items-center gap-3 rounded-xl bg-deepNavy px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surfaceNavy text-electricPurple">
              <Link2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm font-semibold text-textHigh">{invite.code}</p>
              <p className="text-xs text-textMed">
                {invite.uses}/{invite.maxUses} uses · expires {invite.expiresAt}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(invite.code)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-textMed transition hover:bg-surfaceNavy hover:text-textHigh"
              aria-label="Copy link"
            >
              {copied === invite.code ? (
                <span className="text-[10px] font-bold text-electricPurple">✓</span>
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setInvites((prev) => prev.filter((i) => i.id !== invite.id))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-textMed transition hover:bg-red-500/10 hover:text-red-400"
              aria-label="Revoke invite"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {invites.length === 0 && (
          <p className="text-sm text-textMed">No active invite links.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Shared UI ─────────────────────────────────────────────────────────── */

const inputCls =
  "w-full rounded-lg border border-softBorder bg-deepNavy px-3 py-2.5 text-sm text-textHigh placeholder:text-textMed/50 outline-none transition focus:border-electricPurple focus:shadow-[0_0_0_2px_var(--color-purpleGlow)]";

function SettingsCard({
  title,
  danger,
  children,
}: {
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-4 rounded-2xl border p-5 ${
      danger ? "border-red-500/30 bg-red-500/5" : "border-softBorder bg-deepNavy"
    }`}>
      <h2 className={`text-xs font-bold uppercase tracking-wider ${danger ? "text-red-400" : "text-textMed"}`}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-textMed">
        {label}
        {required && <span className="ml-1 text-electricPurple">*</span>}
      </label>
      {children}
    </div>
  );
}
