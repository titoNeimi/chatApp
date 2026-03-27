'use client'

import { HexAvatar } from '@/components/dashboardComponents'
import { useUser } from '@/context/userContext'
import { DMChannel } from '@/types/dm'
import { RoomMember } from '@/components/chatComponents'
import { MessageSquarePlus, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type DMListItem = {
  channel: DMChannel
  otherUsername: string
}

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams<{ roomID?: string }>()
  const activeRoomID = params?.roomID ?? null

  const [items, setItems] = useState<DMListItem[]>([])
  const [newDMOpen, setNewDMOpen] = useState(false)
  const [targetUserID, setTargetUserID] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchChannels = async () => {
    if (!user?.id) return
    const res = await fetch('/api/dm', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    const channels: DMChannel[] = data.channels ?? []

    const resolved = await Promise.all(
      channels.map(async (ch): Promise<DMListItem> => {
        try {
          const usersRes = await fetch(`/api/rooms/${ch.room_id}/users`)
          if (usersRes.ok) {
            const members: RoomMember[] = await usersRes.json()
            const other = members.find(m => m.user_id !== user.id)
            if (other) return { channel: ch, otherUsername: other.username }
          }
        } catch { /* fallback below */ }
        const fallbackID = ch.user1_id === user.id ? ch.user2_id : ch.user1_id
        return { channel: ch, otherUsername: fallbackID.slice(0, 8) }
      })
    )
    setItems(resolved)
  }

  useEffect(() => {
    fetchChannels()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    if (newDMOpen) setTimeout(() => inputRef.current?.focus(), 50)
    else { setTargetUserID(''); setCreateError(null) }
  }, [newDMOpen])

  const handleCreateDM = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUserID.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetUserID.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message ?? 'Failed to start conversation')
      }
      const channel: DMChannel = await res.json()
      await fetchChannels()
      setNewDMOpen(false)
      router.push(`/messages/${channel.room_id}`)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-1 gap-6 overflow-hidden transition-colors">
      {/* DM sidebar */}
      <aside className="flex w-64 shrink-0 flex-col gap-3 rounded-2xl bg-surfaceNavy p-4 shadow-[0_8px_24px_var(--color-panelShadow)]">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-widest text-textMed">Messages</p>
          <button
            type="button"
            onClick={() => setNewDMOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-electricPurple/20 text-electricPurple transition hover:bg-electricPurple hover:text-white"
            aria-label="New direct message"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
          </button>
        </div>

        <nav className="custom-scroll flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {items.length === 0 && (
            <p className="px-1 py-2 text-xs text-textMed">No conversations yet.</p>
          )}
          {items.map(({ channel, otherUsername }) => {
            const isActive = channel.room_id === activeRoomID
            const initials = otherUsername.slice(0, 2).toUpperCase()
            return (
              <Link
                key={channel.id}
                href={`/messages/${channel.room_id}`}
                className={`flex items-center gap-3 rounded-xl p-2.5 transition ${
                  isActive
                    ? 'border border-electricPurple/40 bg-deepNavy shadow-[0_0_12px_var(--color-purpleGlow)]'
                    : 'hover:bg-deepNavy/60'
                }`}
              >
                <HexAvatar initials={initials} size="sm" />
                <span className="truncate text-sm font-semibold text-textHigh">
                  {otherUsername}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Page content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>

      {/* New DM modal */}
      {newDMOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-surfaceNavy p-6 shadow-[0_20px_40px_var(--color-panelShadow)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-textHigh">New Direct Message</h2>
              <button
                type="button"
                onClick={() => setNewDMOpen(false)}
                className="rounded-lg p-1 text-textMed transition hover:text-textHigh"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDM} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-textMed">
                  User ID
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={targetUserID}
                  onChange={e => setTargetUserID(e.target.value)}
                  placeholder="Paste a user UUID..."
                  className="rounded-xl bg-deepNavy px-4 py-2.5 text-sm text-textHigh outline-none ring-1 ring-softBorder placeholder:text-textMed focus:ring-electricPurple/60"
                />
              </div>
              {createError && <p className="text-xs text-red-400">{createError}</p>}
              <button
                type="submit"
                disabled={!targetUserID.trim() || creating}
                className="mt-1 rounded-xl bg-electricPurple py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {creating ? 'Starting...' : 'Start Conversation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
