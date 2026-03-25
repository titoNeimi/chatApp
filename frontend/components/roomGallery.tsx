'use client'

import { useServer } from "@/context/serverContext";
import { Room } from "@/types/room";
import { Bell, Calendar, ChevronLeft, ChevronRight, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useUser } from "@/context/userContext";
import { Modal } from "@/components/modal";

export function RoomGallery(params: {rooms: Room[] | null, selectedRoomID: string | null, serverID: string}) {
  const [collapsed, setCollapsed] = useState(false);
  const [newRoomOpen, setNewRoomOpen] = useState(false);
  const { user } = useUser();
  const { permissions, refreshRooms } = useServer();
  const {rooms, selectedRoomID, serverID} = params
  const canManage = user?.role === 'admin' || permissions?.can_manage_rooms === true;

  return (
    <aside
      data-collapsed={collapsed}
      className={`group relative flex shrink-0 flex-col gap-4 rounded-3xl bg-surfaceNavy shadow-[0_18px_45px_var(--color-panelShadow)] backdrop-blur transition-[width] duration-300 ${
        collapsed ? "w-20 px-3 py-5" : "w-[320px] px-5 py-6"
      }`}
    >
      <div className="flex items-center gap-2 justify-between w-full min-h-7">
        <h2 className="mt-0 mb-0 overflow-hidden whitespace-nowrap text-xl font-semibold text-textHigh transition-opacity duration-300 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:opacity-0">
          Rooms gallery
        </h2>
        <span className="overflow-hidden whitespace-nowrap rounded-full bg-deepNavy px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-electricPurple transition-opacity duration-300 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:opacity-0">
          12 Online
        </span>
        <button
          type="button"
          className="shrink-0 rounded-full p-1 text-textMed transition hover:bg-deepNavy hover:text-textHigh"
          aria-label={collapsed ? "Abrir sidebar" : "Cerrar sidebar"}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {canManage && (
        <button
          type="button"
          onClick={() => setNewRoomOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-dashed border-softBorder px-4 py-3 text-sm font-semibold text-textMed transition hover:border-electricPurple hover:text-electricPurple group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0"
          aria-label="Create room"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="group-data-[collapsed=true]:hidden">New Room</span>
        </button>
      )}

      {rooms && rooms.map((room) => (
        <RoomButton key={room.id} selected={selectedRoomID == room.id} room={room} serverID={serverID} canManage={canManage}/>
      ))}

      {!rooms && (
        <div>
          <h2 className={`text-textMed ${collapsed ? "hidden" : ""}`}>No rooms available</h2>
        </div>
      )}

      {canManage && (
        <Link
          href={`/${serverID}/settings`}
          className="mt-auto flex items-center gap-2 rounded-2xl border border-softBorder px-4 py-3 text-sm font-semibold text-textMed transition hover:border-electricPurple/40 hover:text-textHigh group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0"
          aria-label="Server settings"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className="group-data-[collapsed=true]:hidden">Settings</span>
        </Link>
      )}

      {newRoomOpen && (
        <NewRoomModal
          serverID={serverID}
          onClose={() => setNewRoomOpen(false)}
          onCreated={async () => {
            setNewRoomOpen(false)
            await refreshRooms()
          }}
        />
      )}
    </aside>
  );
}

function NewRoomModal({ serverID, onClose, onCreated }: { serverID: string; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/servers/${serverID}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, is_private: isPrivate, is_read_only: isReadOnly }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? res.statusText);
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold text-textHigh">New Room</h2>
          <p className="mt-1 text-sm text-textMed">Add a new room to this server.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-textMed">
              Room Name <span className="ml-1 text-electricPurple">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. general"
              required
              className="w-full rounded-lg border border-softBorder bg-deepNavy px-3 py-2.5 text-sm text-textHigh placeholder:text-textMed/50 outline-none transition focus:border-electricPurple focus:shadow-[0_0_0_2px_var(--color-purpleGlow)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-textMed">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this room about? (optional)"
              className="w-full rounded-lg border border-softBorder bg-deepNavy px-3 py-2.5 text-sm text-textHigh placeholder:text-textMed/50 outline-none transition focus:border-electricPurple focus:shadow-[0_0_0_2px_var(--color-purpleGlow)]"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-softBorder bg-deepNavy px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-textHigh">Private room</p>
              <p className="text-xs text-textMed">Only invited members can see this room.</p>
            </div>
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="h-4 w-4 accent-electricPurple" />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-softBorder bg-deepNavy px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-textHigh">Read only</p>
              <p className="text-xs text-textMed">Only managers can send messages.</p>
            </div>
            <input type="checkbox" checked={isReadOnly} onChange={(e) => setIsReadOnly(e.target.checked)} className="h-4 w-4 accent-electricPurple" />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="mt-1 w-full rounded-full bg-electricPurple py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_var(--color-purpleGlow)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </span>
            ) : 'Create Room'}
          </button>
        </form>
      </div>
    </Modal>
  );
}

function RoomButton(params: { selected: boolean; room: Room; serverID: string; canManage: boolean }) {
  const { selected, room, serverID, canManage } = params;
  return (
    <Link
      href={`/${serverID}/${room.id}`}
      title={room.name}
      className={`relative group/room flex h-32 w-full flex-col gap-2 overflow-hidden rounded-2xl p-4 transition duration-200 ${
        selected
          ? "bg-deepNavy shadow-[0_12px_24px_var(--color-purpleGlow)]"
          : "bg-deepNavy hover:-translate-y-0.5 hover:shadow-[0_12px_24px_var(--color-panelShadow)]"
      } cursor-pointer group-data-[collapsed=true]:items-center group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:gap-0`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surfaceNavy text-electricPurple shadow-sm">
        {room.is_read_only ? <Bell className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
      </div>
      <div className="flex flex-col gap-1 min-w-0 transition-opacity duration-300 group-data-[collapsed=true]:w-0 group-data-[collapsed=true]:h-0 group-data-[collapsed=true]:opacity-0">
        <h2 className="line-clamp-1 overflow-hidden text-ellipsis text-base font-semibold text-textHigh">{room.name}</h2>
        {room.description && (
          <p className="line-clamp-2 overflow-hidden text-ellipsis text-xs leading-relaxed italic text-textMed">{room.description}</p>
        )}
      </div>

      {canManage && (
        <div className="absolute right-2 top-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover/room:opacity-100 group-data-[collapsed=true]:hidden">
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-surfaceNavy text-textMed transition hover:bg-deepNavy hover:text-electricPurple"
            aria-label={`Edit ${room.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-surfaceNavy text-textMed transition hover:bg-deepNavy hover:text-red-400"
            aria-label={`Delete ${room.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </Link>
  )
}
