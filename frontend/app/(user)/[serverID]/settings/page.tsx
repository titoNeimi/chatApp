'use client'

import { useServer } from "@/context/serverContext";
import { useUser } from "@/context/userContext";
import { Room } from "@/types/room";
import { RoomPermissionOverride, ServerBan, ServerRole, UserWithRoles } from "@/types/role";
import {
  AlertTriangle,
  Ban,
  Copy,
  Hash,
  Link2,
  Lock,
  MessageSquare,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserMinus,
  Users,
  VolumeX,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Tab = "overview" | "roles" | "members" | "rooms" | "bans" | "invitations";

export default function ServerSettingsPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams<{ serverID: string }>();
  const serverID = params?.serverID ?? "";

  const { permissions, loading: permLoading } = useServer();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const isAppAdmin = user?.role === "admin";
  const canManageMembers = isAppAdmin || permissions?.can_manage_members === true;
  const canManageRooms = isAppAdmin || permissions?.can_manage_rooms === true;
  const hasAnyAccess = isAppAdmin || canManageMembers || canManageRooms;

  useEffect(() => {
    if (!permLoading && !hasAnyAccess) {
      router.replace(`/${serverID}`);
    }
  }, [permLoading, hasAnyAccess, serverID, router]);

  if (permLoading || !hasAnyAccess) return null;

  const ALL_TABS: { id: Tab; label: string; visible: boolean }[] = [
    { id: "overview", label: "Overview", visible: isAppAdmin },
    { id: "roles", label: "Roles", visible: canManageMembers },
    { id: "members", label: "Members", visible: canManageMembers },
    { id: "rooms", label: "Rooms", visible: canManageRooms },
    { id: "bans", label: "Bans", visible: canManageMembers },
    { id: "invitations", label: "Invitations", visible: isAppAdmin },
  ];
  const TABS = ALL_TABS.filter((t) => t.visible);

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
        {activeTab === "overview" && <OverviewTab serverID={serverID} />}
        {activeTab === "roles" && <RolesTab serverID={serverID} />}
        {activeTab === "members" && <MembersTab serverID={serverID} />}
        {activeTab === "rooms" && <RoomsTab serverID={serverID} />}
        {activeTab === "bans" && <BansTab serverID={serverID} />}
        {activeTab === "invitations" && <InvitationsTab />}
      </div>
    </section>
  );
}

/* ─── Overview ──────────────────────────────────────────────────────────── */

function OverviewTab({ serverID }: { serverID: string }) {
  const { server, refreshServer } = useServer();
  const router = useRouter();
  const [name, setName] = useState(server?.name ?? "");
  const [description, setDescription] = useState(server?.description ?? "");
  const [isPrivate, setIsPrivate] = useState(server?.is_private ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (server) {
      setName(server.name);
      setDescription(server.description ?? "");
      setIsPrivate(server.is_private ?? false);
    }
  }, [server]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/servers/${serverID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, is_private: isPrivate }),
      });
      if (res.ok) await refreshServer();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/servers/${serverID}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard");
    } finally {
      setDeleting(false);
    }
  };

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
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-softBorder bg-deepNavy px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-textHigh">Private server</p>
            <p className="text-xs text-textMed">Only members with an invite can join.</p>
          </div>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-4 w-4 accent-electricPurple"
          />
        </label>
        <button
          type="button"
          disabled={!name.trim() || saving}
          onClick={handleSave}
          className="self-start rounded-full bg-electricPurple px-5 py-2 text-sm font-semibold text-white shadow-[0_0_16px_var(--color-purpleGlow)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </SettingsCard>

      <SettingsCard title="Danger Zone" danger>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-textHigh">Delete this server</p>
            <p className="text-xs text-textMed">This action is permanent and cannot be undone.</p>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Are you sure?</span>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full border border-softBorder px-3 py-1.5 text-xs font-semibold text-textMed transition hover:text-textHigh"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <AlertTriangle className="h-4 w-4" />
              Delete Server
            </button>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}

/* ─── Roles ─────────────────────────────────────────────────────────────── */

function RolesTab({ serverID }: { serverID: string }) {
  const [roles, setRoles] = useState<ServerRole[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<ServerRole | null>(null);
  const [confirmDeleteID, setConfirmDeleteID] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/servers/${serverID}/roles`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then(setRoles);
  }, [serverID]);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/servers/${serverID}/roles/${id}`, { method: "DELETE" });
    if (res.ok) setRoles((prev) => prev.filter((r) => r.id !== id));
    setConfirmDeleteID(null);
  };

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-textMed">
          {roles.length} role{roles.length !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => { setShowCreate((v) => !v); setEditingRole(null); }}
          className="inline-flex items-center gap-2 rounded-full bg-electricPurple px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_var(--color-purpleGlow)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Role
        </button>
      </div>

      {showCreate && (
        <RoleForm
          title="Create Role"
          onCancel={() => setShowCreate(false)}
          onSubmit={async (data) => {
            const res = await fetch(`/api/servers/${serverID}/roles`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (res.ok) { const newRole = await res.json(); setRoles((prev) => [...prev, newRole]); }
            setShowCreate(false);
          }}
        />
      )}

      <div className="flex flex-col gap-2">
        {roles.map((role) =>
          editingRole?.id === role.id ? (
            <RoleForm
              key={role.id}
              title="Edit Role"
              initialName={role.name}
              initialPerms={role}
              onCancel={() => setEditingRole(null)}
              onSubmit={async (data) => {
                const res = await fetch(`/api/servers/${serverID}/roles/${role.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                if (res.ok) { const updated = await res.json(); setRoles((prev) => prev.map((r) => r.id === role.id ? updated : r)); }
                setEditingRole(null);
              }}
            />
          ) : (
            <RoleRow
              key={role.id}
              role={role}
              confirmDelete={confirmDeleteID === role.id}
              onEdit={() => setEditingRole(role)}
              onDeleteRequest={() => setConfirmDeleteID(role.id)}
              onDeleteConfirm={() => handleDelete(role.id)}
              onDeleteCancel={() => setConfirmDeleteID(null)}
            />
          )
        )}
        {roles.length === 0 && !showCreate && (
          <p className="text-sm text-textMed">No roles yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}

type PermFields = {
  can_send_messages: boolean;
  can_delete_messages: boolean;
  can_mute_members: boolean;
  can_manage_members: boolean;
  can_manage_rooms: boolean;
  display_separately: boolean;
};

function RoleRow({
  role,
  confirmDelete,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  role: ServerRole;
  confirmDelete: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}) {
  const PERM_BADGES: { key: keyof PermFields; icon: React.ReactNode; label: string }[] = [
    { key: "can_send_messages",   icon: <MessageSquare className="h-3 w-3" />, label: "Send Messages" },
    { key: "can_delete_messages", icon: <Trash2 className="h-3 w-3" />,        label: "Delete Messages" },
    { key: "can_mute_members",    icon: <VolumeX className="h-3 w-3" />,       label: "Mute Members" },
    { key: "can_manage_members",  icon: <Users className="h-3 w-3" />,         label: "Manage Members" },
    { key: "can_manage_rooms",    icon: <Hash className="h-3 w-3" />,          label: "Manage Rooms" },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-deepNavy px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-electricPurple/10 text-electricPurple">
          <Shield className="h-4 w-4" />
        </div>
        <span className="flex-1 text-sm font-semibold text-textHigh">{role.name}</span>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Delete?</span>
            <button
              type="button"
              onClick={onDeleteConfirm}
              className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={onDeleteCancel}
              className="rounded-full border border-softBorder px-3 py-1 text-xs font-semibold text-textMed transition hover:text-textHigh"
            >
              No
            </button>
          </div>
        ) : (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-textMed transition hover:bg-surfaceNavy hover:text-electricPurple"
              aria-label={`Edit ${role.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDeleteRequest}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-textMed transition hover:bg-red-500/10 hover:text-red-400"
              aria-label={`Delete ${role.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {PERM_BADGES.map(({ key, icon, label }) => (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              role[key]
                ? "bg-electricPurple/15 text-electricPurple"
                : "bg-surfaceNavy text-textMed/50"
            }`}
          >
            {icon}
            {label}
          </span>
        ))}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            role.display_separately
              ? "bg-cyan-500/15 text-cyan-400"
              : "bg-surfaceNavy text-textMed/50"
          }`}
        >
          <Users className="h-3 w-3" />
          Listed separately
        </span>
      </div>
    </div>
  );
}

function RoleForm({
  title,
  initialName = "",
  initialPerms,
  onCancel,
  onSubmit,
}: {
  title: string;
  initialName?: string;
  initialPerms?: PermFields;
  onCancel: () => void;
  onSubmit: (data: { name: string } & PermFields) => void;
}) {
  const [name, setName] = useState(initialName);
  const [perms, setPerms] = useState<PermFields>({
    can_send_messages: initialPerms?.can_send_messages ?? false,
    can_delete_messages: initialPerms?.can_delete_messages ?? false,
    can_mute_members: initialPerms?.can_mute_members ?? false,
    can_manage_members: initialPerms?.can_manage_members ?? false,
    can_manage_rooms: initialPerms?.can_manage_rooms ?? false,
    display_separately: initialPerms?.display_separately ?? false,
  });

  const PERM_LABELS: { key: keyof PermFields; label: string; desc: string }[] = [
    { key: "can_send_messages",   label: "Send Messages",   desc: "Can send messages in read-only rooms." },
    { key: "can_delete_messages", label: "Delete Messages", desc: "Can delete any message in the server." },
    { key: "can_mute_members",    label: "Mute Members",    desc: "Can mute members in rooms." },
    { key: "can_manage_members",  label: "Manage Members",  desc: "Can assign/revoke roles and ban users." },
    { key: "can_manage_rooms",    label: "Manage Rooms",    desc: "Can create, edit, and delete rooms." },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-electricPurple/30 bg-deepNavy p-4">
      <p className="text-sm font-semibold text-textHigh">{title}</p>
      <Field label="Role Name" required>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Moderator"
          className={inputCls}
        />
      </Field>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-textMed">Permissions</p>
        {PERM_LABELS.map(({ key, label, desc }) => (
          <label
            key={key}
            className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-surfaceNavy"
          >
            <input
              type="checkbox"
              checked={perms[key]}
              onChange={(e) => setPerms((p) => ({ ...p, [key]: e.target.checked }))}
              className="mt-0.5 h-4 w-4 accent-electricPurple"
            />
            <div>
              <p className="text-sm font-medium text-textHigh">{label}</p>
              <p className="text-xs text-textMed">{desc}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-textMed">Display</p>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-surfaceNavy">
          <input
            type="checkbox"
            checked={perms.display_separately}
            onChange={(e) => setPerms((p) => ({ ...p, display_separately: e.target.checked }))}
            className="mt-0.5 h-4 w-4 accent-electricPurple"
          />
          <div>
            <p className="text-sm font-medium text-textHigh">List separately in members panel</p>
            <p className="text-xs text-textMed">Members with this role appear as a named group in the room sidebar.</p>
          </div>
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => onSubmit({ name, ...perms })}
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

/* ─── Members ───────────────────────────────────────────────────────────── */

function MembersTab({ serverID }: { serverID: string }) {
  const [members, setMembers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<ServerRole[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/servers/${serverID}/members`, { cache: 'no-store' }),
      fetch(`/api/servers/${serverID}/roles`, { cache: 'no-store' }),
    ]).then(async ([membersRes, rolesRes]) => {
      if (membersRes.ok) setMembers(await membersRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
    });
  }, [serverID]);

  const filtered = members.filter((m) =>
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

      <div className="flex max-w-2xl flex-col gap-2">
        {filtered.length === 0 && (
          <p className="text-sm text-textMed">No members found.</p>
        )}
        {filtered.map((member) => (
          <MemberRow
            key={member.user_id}
            member={member}
            availableRoles={roles.filter((r) => !member.roles.some((mr) => mr.id === r.id))}
            onRoleRevoke={async (roleID) => {
              const res = await fetch(`/api/servers/${serverID}/members/${member.user_id}/roles/${roleID}`, { method: "DELETE" });
              if (res.ok) setMembers((prev) => prev.map((m) => m.user_id === member.user_id ? { ...m, roles: m.roles.filter((r) => r.id !== roleID) } : m));
            }}
            onRoleAssign={async (role) => {
              const res = await fetch(`/api/servers/${serverID}/members/${member.user_id}/roles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role_id: role.id }),
              });
              if (res.ok) setMembers((prev) => prev.map((m) => m.user_id === member.user_id ? { ...m, roles: [...m.roles, role] } : m));
            }}
            onBan={async () => {
              const res = await fetch(`/api/servers/${serverID}/bans/${member.user_id}`, { method: "POST" });
              if (res.ok) setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MemberRow({
  member,
  availableRoles,
  onRoleRevoke,
  onRoleAssign,
  onBan,
}: {
  member: UserWithRoles;
  availableRoles: ServerRole[];
  onRoleRevoke: (roleID: string) => void;
  onRoleAssign: (role: ServerRole) => void;
  onBan: () => void;
}) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [confirmBan, setConfirmBan] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-deepNavy px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center text-sm font-semibold text-white">
          <span className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-softBorder" />
          <span className="relative z-10 flex h-8 w-8 items-center justify-center [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-electricPurple">
            {member.username.slice(0, 2).toUpperCase()}
          </span>
        </span>

        <span className="min-w-0 flex-1 text-sm font-semibold text-textHigh">{member.username}</span>

        {confirmBan ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Ban user?</span>
            <button
              type="button"
              onClick={onBan}
              className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setConfirmBan(false)}
              className="rounded-full border border-softBorder px-3 py-1 text-xs font-semibold text-textMed transition hover:text-textHigh"
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmBan(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-textMed transition hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Ban ${member.username}`}
          >
            <UserMinus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Role chips */}
      <div className="flex flex-wrap items-center gap-2 pl-12">
        {member.roles.map((role) => (
          <span
            key={role.id}
            className="inline-flex items-center gap-1 rounded-full bg-electricPurple/15 px-2.5 py-0.5 text-xs font-semibold text-electricPurple"
          >
            {role.name}
            <button
              type="button"
              onClick={() => onRoleRevoke(role.id)}
              className="ml-0.5 rounded-full p-0.5 transition hover:bg-electricPurple/20"
              aria-label={`Remove role ${role.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {availableRoles.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleDropdown((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-softBorder px-2.5 py-0.5 text-xs font-semibold text-textMed transition hover:border-electricPurple/50 hover:text-electricPurple"
            >
              <Plus className="h-3 w-3" />
              Add Role
            </button>
            {showRoleDropdown && (
              <div className="absolute left-0 top-7 z-10 flex min-w-40 flex-col gap-1 rounded-xl border border-softBorder bg-surfaceNavy p-1 shadow-lg">
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => { onRoleAssign(role); setShowRoleDropdown(false); }}
                    className="rounded-lg px-3 py-2 text-left text-sm text-textMed transition hover:bg-deepNavy hover:text-textHigh"
                  >
                    {role.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Rooms ─────────────────────────────────────────────────────────────── */

function RoomsTab({ serverID }: { serverID: string }) {
  const { refreshRooms } = useServer();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [confirmDeleteID, setConfirmDeleteID] = useState<string | null>(null);
  const [permissionsRoomID, setPermissionsRoomID] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/servers/${serverID}/rooms/${id}`, { method: "DELETE" });
    if (res.ok) { setRooms((prev) => prev.filter((r) => r.id !== id)); refreshRooms(); }
    setConfirmDeleteID(null);
  };

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
          onSubmit={async (data) => {
            const res = await fetch(`/api/servers/${serverID}/rooms`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (res.ok) { const newRoom = await res.json(); setRooms((prev) => [...prev, newRoom]); refreshRooms(); }
            setShowCreate(false);
          }}
        />
      )}

      {loading && <p className="text-sm text-textMed">Loading rooms...</p>}

      <div className="flex flex-col gap-2">
        {rooms.map((room) => (
          <div key={room.id} className="flex flex-col gap-1">
            {editingRoom?.id === room.id ? (
              <RoomForm
                title="Edit Room"
                initialName={room.name}
                initialDescription={room.description}
                initialPrivate={room.is_private}
                initialReadOnly={room.is_read_only}
                onCancel={() => setEditingRoom(null)}
                onSubmit={async (data) => {
                  const res = await fetch(`/api/servers/${serverID}/rooms/${room.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    const updated = await res.json();
                    setRooms((prev) => prev.map((r) => r.id === room.id ? updated : r));
                    refreshRooms();
                    setEditingRoom(null);
                  } else {
                    alert("Failed to update room. You may not have permission.");
                  }
                }}
              />
            ) : (
              <RoomRow
                room={room}
                confirmDelete={confirmDeleteID === room.id}
                permissionsOpen={permissionsRoomID === room.id}
                onEdit={() => { setEditingRoom(room); setPermissionsRoomID(null); }}
                onDeleteRequest={() => setConfirmDeleteID(room.id)}
                onDeleteConfirm={() => handleDelete(room.id)}
                onDeleteCancel={() => setConfirmDeleteID(null)}
                onPermissionsToggle={() => setPermissionsRoomID(permissionsRoomID === room.id ? null : room.id)}
              />
            )}
            {permissionsRoomID === room.id && editingRoom?.id !== room.id && (
              <OverridesPanel serverID={serverID} roomID={room.id} />
            )}
          </div>
        ))}
        {!loading && rooms.length === 0 && !showCreate && (
          <p className="text-sm text-textMed">No rooms yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}

function RoomRow({
  room,
  confirmDelete,
  permissionsOpen,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  onPermissionsToggle,
}: {
  room: Room;
  confirmDelete: boolean;
  permissionsOpen: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onPermissionsToggle: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${permissionsOpen ? "bg-deepNavy ring-1 ring-electricPurple/30" : "bg-deepNavy"}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surfaceNavy text-electricPurple">
        {room.is_private ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-textHigh">{room.name}</p>
          {room.is_read_only && (
            <span className="rounded bg-surfaceNavy px-1.5 py-0.5 text-[10px] font-medium text-textMed">read-only</span>
          )}
        </div>
        {room.description && (
          <p className="truncate text-xs text-textMed">{room.description}</p>
        )}
      </div>
      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400">Delete?</span>
          <button
            type="button"
            onClick={onDeleteConfirm}
            className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={onDeleteCancel}
            className="rounded-full border border-softBorder px-3 py-1 text-xs font-semibold text-textMed transition hover:text-textHigh"
          >
            No
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onPermissionsToggle}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${permissionsOpen ? "bg-electricPurple/20 text-electricPurple" : "text-textMed hover:bg-surfaceNavy hover:text-electricPurple"}`}
            aria-label={`${permissionsOpen ? "Hide" : "Show"} permissions for ${room.name}`}
          >
            <Shield className="h-3.5 w-3.5" />
          </button>
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
            onClick={onDeleteRequest}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-textMed transition hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Delete ${room.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

/* ─── Overrides ─────────────────────────────────────────────────────────── */

function OverridesPanel({ serverID, roomID }: { serverID: string; roomID: string }) {
  const [overrides, setOverrides] = useState<RoomPermissionOverride[]>([]);
  const [roles, setRoles] = useState<ServerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/servers/${serverID}/rooms/${roomID}/overrides`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/servers/${serverID}/roles`).then((r) => r.ok ? r.json() : []),
    ]).then(([ovs, rls]) => {
      setOverrides(ovs ?? []);
      setRoles(rls ?? []);
      setLoading(false);
    });
  }, [serverID, roomID]);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/servers/${serverID}/rooms/${roomID}/overrides/${id}`, { method: "DELETE" });
    if (res.ok) setOverrides((prev) => prev.filter((o) => o.id !== id));
  };

  const handleUpsert = async (data: {
    role_id?: string; user_id?: string;
    can_send_messages: boolean; can_delete_messages: boolean;
    can_mute_members: boolean; can_manage_members: boolean; can_manage_rooms: boolean;
  }) => {
    const res = await fetch(`/api/servers/${serverID}/rooms/${roomID}/overrides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated: RoomPermissionOverride = await res.json();
      setOverrides((prev) => {
        const idx = prev.findIndex((o) => o.id === updated.id);
        return idx >= 0 ? prev.map((o) => (o.id === updated.id ? updated : o)) : [...prev, updated];
      });
      setShowForm(false);
    }
  };

  return (
    <div className="ml-12 flex flex-col gap-2 rounded-xl border border-electricPurple/20 bg-surfaceNavy p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-textMed">Permission Overrides</p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-softBorder px-2.5 py-1 text-xs font-semibold text-textMed transition hover:border-electricPurple/50 hover:text-electricPurple"
        >
          <Plus className="h-3 w-3" />
          Add Override
        </button>
      </div>

      {showForm && (
        <OverrideForm
          roles={roles}
          onCancel={() => setShowForm(false)}
          onSubmit={handleUpsert}
        />
      )}

      {loading && <p className="text-xs text-textMed">Loading...</p>}

      {overrides.map((override) => (
        <OverrideRow
          key={override.id}
          override={override}
          roles={roles}
          onDelete={() => handleDelete(override.id)}
        />
      ))}

      {!loading && overrides.length === 0 && !showForm && (
        <p className="text-xs text-textMed">No overrides configured.</p>
      )}
    </div>
  );
}

const PERM_LABELS: { key: keyof Pick<RoomPermissionOverride, "can_delete_messages" | "can_mute_members" | "can_manage_members" | "can_manage_rooms" | "can_send_messages">; label: string }[] = [
  { key: "can_send_messages",   label: "Send Messages" },
  { key: "can_delete_messages", label: "Delete Msgs" },
  { key: "can_mute_members",    label: "Mute" },
  { key: "can_manage_members",  label: "Manage Members" },
  { key: "can_manage_rooms",    label: "Manage Rooms" },
];

function OverrideRow({
  override,
  roles,
  onDelete,
}: {
  override: RoomPermissionOverride;
  roles: ServerRole[];
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const roleName = override.role_id ? (roles.find((r) => r.id === override.role_id)?.name ?? override.role_id) : null;
  const enabledPerms = PERM_LABELS.filter((p) => override[p.key] === true);

  return (
    <div className="flex items-start gap-3 rounded-lg bg-deepNavy px-3 py-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-electricPurple/10 text-electricPurple">
        {override.role_id ? <Shield className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-textHigh">
          {override.role_id ? (
            <><span className="text-textMed">Role: </span>{roleName}</>
          ) : (
            <><span className="text-textMed">User: </span><span className="font-mono">{override.user_id}</span></>
          )}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {enabledPerms.length > 0 ? enabledPerms.map((p) => (
            <span key={p.key} className="rounded-full bg-electricPurple/15 px-2 py-0.5 text-[10px] font-semibold text-electricPurple">
              {p.label}
            </span>
          )) : (
            <span className="text-[10px] text-textMed italic">no permissions granted</span>
          )}
        </div>
      </div>
      {confirmDelete ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-red-400">Delete?</span>
          <button type="button" onClick={onDelete} className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-red-600">Yes</button>
          <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border border-softBorder px-2 py-0.5 text-[10px] font-semibold text-textMed hover:text-textHigh">No</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-textMed transition hover:bg-red-500/10 hover:text-red-400"
          aria-label="Delete override"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function OverrideForm({
  roles,
  onCancel,
  onSubmit,
}: {
  roles: ServerRole[];
  onCancel: () => void;
  onSubmit: (data: {
    role_id?: string; user_id?: string;
    can_send_messages: boolean; can_delete_messages: boolean;
    can_mute_members: boolean; can_manage_members: boolean; can_manage_rooms: boolean;
  }) => void;
}) {
  const [targetType, setTargetType] = useState<"role" | "user">("role");
  const [roleID, setRoleID] = useState(roles[0]?.id ?? "");
  const [userID, setUserID] = useState("");
  const [perms, setPerms] = useState({
    can_send_messages: false,
    can_delete_messages: false,
    can_mute_members: false,
    can_manage_members: false,
    can_manage_rooms: false,
  });

  const togglePerm = (key: keyof typeof perms) => setPerms((p) => ({ ...p, [key]: !p[key] }));

  const canSubmit = targetType === "role" ? !!roleID : !!userID.trim();

  const handleSubmit = () => {
    onSubmit({
      ...(targetType === "role" ? { role_id: roleID } : { user_id: userID.trim() }),
      ...perms,
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-electricPurple/30 bg-deepNavy p-3">
      <div className="flex gap-2">
        {(["role", "user"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTargetType(t)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${targetType === t ? "bg-electricPurple text-white" : "border border-softBorder text-textMed hover:text-textHigh"}`}
          >
            {t === "role" ? "Role" : "User"}
          </button>
        ))}
      </div>

      {targetType === "role" ? (
        <select
          value={roleID}
          onChange={(e) => setRoleID(e.target.value)}
          className="w-full rounded-lg border border-softBorder bg-surfaceNavy px-3 py-2 text-sm text-textHigh outline-none transition focus:border-electricPurple"
        >
          {roles.length === 0 && <option value="">No roles available</option>}
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          placeholder="User ID"
          className="w-full rounded-lg border border-softBorder bg-surfaceNavy px-3 py-2 text-sm text-textHigh placeholder:text-textMed/50 outline-none transition focus:border-electricPurple"
        />
      )}

      <div className="grid grid-cols-2 gap-1.5">
        {PERM_LABELS.map((p) => (
          <label key={p.key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-surfaceNavy">
            <input
              type="checkbox"
              checked={perms[p.key]}
              onChange={() => togglePerm(p.key)}
              className="h-3.5 w-3.5 accent-electricPurple"
            />
            <span className="text-xs text-textHigh">{p.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="rounded-full bg-electricPurple px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-softBorder px-4 py-1.5 text-xs font-semibold text-textMed transition hover:text-textHigh"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function RoomForm({
  title,
  initialName = "",
  initialDescription = "",
  initialPrivate = false,
  initialReadOnly = false,
  onCancel,
  onSubmit,
}: {
  title: string;
  initialName?: string;
  initialDescription?: string;
  initialPrivate?: boolean;
  initialReadOnly?: boolean;
  onCancel: () => void;
  onSubmit: (data: { name: string; description: string; is_private: boolean; is_read_only: boolean }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isPrivate, setIsPrivate] = useState(initialPrivate);
  const [isReadOnly, setIsReadOnly] = useState(initialReadOnly);

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
      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="h-4 w-4 accent-electricPurple"
        />
        <div>
          <p className="text-sm font-medium text-textHigh">Private room</p>
          <p className="text-xs text-textMed">Only members with explicit access can see this room.</p>
        </div>
      </label>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5">
        <input
          type="checkbox"
          checked={isReadOnly}
          onChange={(e) => setIsReadOnly(e.target.checked)}
          className="h-4 w-4 accent-electricPurple"
        />
        <div>
          <p className="text-sm font-medium text-textHigh">Read-only room</p>
          <p className="text-xs text-textMed">Only roles with &quot;Send Messages&quot; permission can post.</p>
        </div>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => onSubmit({ name, description, is_private: isPrivate, is_read_only: isReadOnly })}
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

/* ─── Bans ──────────────────────────────────────────────────────────────── */

function BansTab({ serverID }: { serverID: string }) {
  const [bans, setBans] = useState<ServerBan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/servers/${serverID}/bans`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { setBans(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [serverID]);

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <span className="text-sm text-textMed">
        {bans.length} banned user{bans.length !== 1 ? "s" : ""}
      </span>

      {loading && <p className="text-sm text-textMed">Loading...</p>}

      <div className="flex flex-col gap-2">
        {bans.map((ban) => (
          <BanRow
            key={ban.id}
            ban={ban}
            onUnban={async () => {
              const res = await fetch(`/api/servers/${serverID}/bans/${ban.user_id}`, { method: "DELETE" });
              if (res.ok) setBans((prev) => prev.filter((b) => b.id !== ban.id));
            }}
          />
        ))}
        {!loading && bans.length === 0 && (
          <p className="text-sm text-textMed">No banned users.</p>
        )}
      </div>
    </div>
  );
}

function BanRow({ ban, onUnban }: { ban: ServerBan; onUnban: () => void }) {
  const [confirmUnban, setConfirmUnban] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-xl bg-deepNavy px-4 py-3">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center text-sm font-semibold text-white">
        <span className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-red-500/30" />
        <span className="relative z-10 flex h-8 w-8 items-center justify-center [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-red-500/20 text-red-400">
          <Ban className="h-4 w-4" />
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm font-semibold text-textHigh">{ban.user_id}</p>
        <p className="text-xs text-textMed">
          {ban.reason && <span className="italic">{ban.reason} · </span>}
          Banned {new Date(ban.banned_at).toLocaleDateString()}
        </p>
      </div>

      {confirmUnban ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-textMed">Unban?</span>
          <button
            type="button"
            onClick={onUnban}
            className="rounded-full bg-electricPurple px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setConfirmUnban(false)}
            className="rounded-full border border-softBorder px-3 py-1 text-xs font-semibold text-textMed transition hover:text-textHigh"
          >
            No
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmUnban(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
        >
          Unban
        </button>
      )}
    </div>
  );
}

/* ─── Invitations ───────────────────────────────────────────────────────── */

function InvitationsTab() {
  const params = useParams<{ serverID: string }>();
  const serverID = params?.serverID ?? "";

  const [invites, setInvites] = useState<Invitation[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (!serverID) return;
    setLoading(true);
    fetch(`/api/servers/${serverID}/invitations`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: Invitation[]) => setInvites(data ?? []))
      .catch(() => setError("Failed to load invitations."))
      .finally(() => setLoading(false));
  }, [serverID]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const closeForm = () => { setShowForm(false); setMaxUses(""); setExpiresAt(""); };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    try {
      const body: { max_uses?: number; expires_at?: string } = {};
      if (maxUses.trim()) body.max_uses = parseInt(maxUses, 10);
      if (expiresAt.trim()) body.expires_at = new Date(expiresAt).toISOString();

      const r = await fetch(`/api/servers/${serverID}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      const inv: Invitation = await r.json();
      setInvites((prev) => [...prev, inv]);
      closeForm();
    } catch {
      setError("Failed to generate invitation.");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const r = await fetch(`/api/servers/${serverID}/invitations/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      setInvites((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError("Failed to revoke invitation.");
    }
  };

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-textMed">
          {invites.length} active link{invites.length !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => showForm ? closeForm() : setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-full bg-electricPurple px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_var(--color-purpleGlow)] transition hover:opacity-90"
        >
          <Link2 className="h-4 w-4" />
          Generate Link
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleGenerate}
          className="flex flex-col gap-3 rounded-xl border border-softBorder bg-deepNavy p-4"
        >
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-textMed">
                Max Uses
              </label>
              <input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full rounded-lg border border-softBorder bg-surfaceNavy px-3 py-2 text-sm text-textHigh placeholder:text-textMed/50 outline-none transition focus:border-electricPurple focus:shadow-[0_0_0_2px_var(--color-purpleGlow)]"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-textMed">
                Expires At
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-lg border border-softBorder bg-surfaceNavy px-3 py-2 text-sm text-textHigh outline-none transition focus:border-electricPurple focus:shadow-[0_0_0_2px_var(--color-purpleGlow)]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full px-4 py-1.5 text-sm text-textMed transition hover:text-textHigh"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-full bg-electricPurple px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {generating ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              Create
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-col gap-2">
        {loading ? (
          <p className="text-sm text-textMed">Loading...</p>
        ) : (
          <>
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 rounded-xl bg-deepNavy px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surfaceNavy text-electricPurple">
                  <Link2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-semibold text-textHigh">{invite.code}</p>
                  <p className="text-xs text-textMed">
                    {invite.uses}{invite.max_uses != null ? `/${invite.max_uses}` : ""} uses
                    {invite.expires_at ? ` · expires ${new Date(invite.expires_at).toLocaleDateString()}` : ""}
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
                  onClick={() => handleRevoke(invite.id)}
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
          </>
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
