'use client'

import { useUser } from "@/context/userContext";
import { Room } from "@/types/room";
import { EffectivePermissions, ServerBan, ServerRole, UserWithRoles } from "@/types/role";
import {
  AlertTriangle,
  Ban,
  Copy,
  Hash,
  Link2,
  Lock,
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
import { useState } from "react";
import { useEffect } from "react";

type Tab = "overview" | "roles" | "members" | "rooms" | "bans" | "invitations";

export default function ServerSettingsPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams<{ serverID: string }>();
  const serverID = params?.serverID ?? "";

  const [permissions, setPermissions] = useState<EffectivePermissions | null>(null);
  const [permLoading, setPermLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    // TODO: fetch GET /api/servers/${serverID}/my-permissions → setPermissions(data)
    setPermissions(null);
    setPermLoading(false);
  }, [serverID]);

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // TODO: on mount fetch GET /api/servers/${serverID} → populate name and description fields

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
          // TODO: onClick → call PUT /api/servers/${serverID} with { name, description }
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
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Are you sure?</span>
              <button
                type="button"
                // TODO: onClick → call DELETE /api/servers/${serverID} then router.push("/dashboard")
                className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
              >
                Yes, delete
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

  // TODO: on mount fetch GET /api/servers/${serverID}/roles → setRoles(data)

  const handleDelete = (id: string) => {
    // TODO: call DELETE /api/servers/${serverID}/roles/${id}, then remove from state on success
    setRoles((prev) => prev.filter((r) => r.id !== id));
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
          onSubmit={(data) => {
            // TODO: call POST /api/servers/${serverID}/roles with data → use the returned role instead of the locally generated one
            const newRole: ServerRole = {
              id: crypto.randomUUID(),
              server_id: serverID,
              name: data.name,
              can_delete_messages: data.can_delete_messages,
              can_mute_members: data.can_mute_members,
              can_manage_members: data.can_manage_members,
              can_manage_rooms: data.can_manage_rooms,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setRoles((prev) => [...prev, newRole]);
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
              onSubmit={(data) => {
                // TODO: call PUT /api/servers/${serverID}/roles/${role.id} with data, then update state with returned role
                setRoles((prev) =>
                  prev.map((r) => r.id === role.id ? { ...r, ...data, updated_at: new Date().toISOString() } : r)
                );
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
  can_delete_messages: boolean;
  can_mute_members: boolean;
  can_manage_members: boolean;
  can_manage_rooms: boolean;
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
    { key: "can_delete_messages", icon: <Trash2 className="h-3 w-3" />, label: "Delete Messages" },
    { key: "can_mute_members", icon: <VolumeX className="h-3 w-3" />, label: "Mute Members" },
    { key: "can_manage_members", icon: <Users className="h-3 w-3" />, label: "Manage Members" },
    { key: "can_manage_rooms", icon: <Hash className="h-3 w-3" />, label: "Manage Rooms" },
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
    can_delete_messages: initialPerms?.can_delete_messages ?? false,
    can_mute_members: initialPerms?.can_mute_members ?? false,
    can_manage_members: initialPerms?.can_manage_members ?? false,
    can_manage_rooms: initialPerms?.can_manage_rooms ?? false,
  });

  const PERM_LABELS: { key: keyof PermFields; label: string; desc: string }[] = [
    { key: "can_delete_messages", label: "Delete Messages", desc: "Can delete any message in the server." },
    { key: "can_mute_members", label: "Mute Members", desc: "Can mute members in rooms." },
    { key: "can_manage_members", label: "Manage Members", desc: "Can assign/revoke roles and ban users." },
    { key: "can_manage_rooms", label: "Manage Rooms", desc: "Can create, edit, and delete rooms." },
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

  // TODO: on mount fetch GET /api/servers/${serverID}/members → setMembers(data)
  // TODO: on mount fetch GET /api/servers/${serverID}/roles → setRoles(data)

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
            onRoleRevoke={(roleID) => {
              // TODO: call DELETE /api/servers/${serverID}/members/${member.user_id}/roles/${roleID}
              setMembers((prev) =>
                prev.map((m) =>
                  m.user_id === member.user_id
                    ? { ...m, roles: m.roles.filter((r) => r.id !== roleID) }
                    : m
                )
              );
            }}
            onRoleAssign={(role) => {
              // TODO: call POST /api/servers/${serverID}/members/${member.user_id}/roles with { role_id: role.id }
              setMembers((prev) =>
                prev.map((m) =>
                  m.user_id === member.user_id ? { ...m, roles: [...m.roles, role] } : m
                )
              );
            }}
            onBan={() => {
              // TODO: call POST /api/servers/${serverID}/bans/${member.user_id} with optional { reason }
              setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [confirmDeleteID, setConfirmDeleteID] = useState<string | null>(null);

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

  const handleDelete = (id: string) => {
    // TODO: call DELETE /api/servers/${serverID}/rooms/${id}, then remove from state on success
    setRooms((prev) => prev.filter((r) => r.id !== id));
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
          onSubmit={() => {
            // TODO: call POST /api/servers/${serverID}/rooms with { name, description, is_private }
            // TODO: on success append returned room to setRooms and close form
            setShowCreate(false);
          }}
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
              initialPrivate={room.is_private}
              onCancel={() => setEditingRoom(null)}
              onSubmit={() => {
                // TODO: call PUT /api/servers/${serverID}/rooms/${room.id} with { name, description, is_private }
                // TODO: on success update room in setRooms with returned data
                setEditingRoom(null);
              }}
            />
          ) : (
            <RoomRow
              key={room.id}
              room={room}
              confirmDelete={confirmDeleteID === room.id}
              onEdit={() => setEditingRoom(room)}
              onDeleteRequest={() => setConfirmDeleteID(room.id)}
              onDeleteConfirm={() => handleDelete(room.id)}
              onDeleteCancel={() => setConfirmDeleteID(null)}
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

function RoomRow({
  room,
  confirmDelete,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  room: Room;
  confirmDelete: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-deepNavy px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surfaceNavy text-electricPurple">
        {room.is_private ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-textHigh">{room.name}</p>
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

function RoomForm({
  title,
  initialName = "",
  initialDescription = "",
  initialPrivate = false,
  onCancel,
  onSubmit,
}: {
  title: string;
  initialName?: string;
  initialDescription?: string;
  initialPrivate?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [isPrivate, setIsPrivate] = useState(initialPrivate);

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

/* ─── Bans ──────────────────────────────────────────────────────────────── */

function BansTab({ serverID }: { serverID: string }) {
  const [bans, setBans] = useState<ServerBan[]>([]);
  const [loading] = useState(false);

  // TODO: on mount fetch GET /api/servers/${serverID}/bans → setBans(data)

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
            onUnban={() => {
              // TODO: call DELETE /api/servers/${serverID}/bans/${ban.user_id}, then remove from state on success
              setBans((prev) => prev.filter((b) => b.id !== ban.id));
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
