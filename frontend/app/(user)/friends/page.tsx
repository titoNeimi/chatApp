'use client'

import { HexAvatar } from '@/components/dashboardComponents'
import { useUserBlocks } from '@/context/userBlocksContext'
import { FriendEntry, PendingRequest } from '@/types/friends'
import { User } from '@/types/user'
import { Check, MessageSquare, Search, Shield, UserMinus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function FriendsPage() {
  const router = useRouter()
  const { addUserBlock } = useUserBlocks()

  const [friends, setFriends] = useState<FriendEntry[]>([])
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [loadingFriends, setLoadingFriends] = useState(true)
  const [loadingPending, setLoadingPending] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const fetchFriends = async () => {
    setLoadingFriends(true)
    const res = await fetch('/api/friends')
    if (res.ok) setFriends(await res.json())
    setLoadingFriends(false)
  }

  const fetchPending = async () => {
    setLoadingPending(true)
    const res = await fetch('/api/friends/pending')
    if (res.ok) setPending(await res.json())
    setLoadingPending(false)
  }

  useEffect(() => {
    void (async () => {
      await Promise.all([fetchFriends(), fetchPending()])
    })()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) setSearchResults(await res.json())
      setSearching(false)
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery])

  const handleMessage = async (friendUserID: string) => {
    const res = await fetch('/api/dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_user_id: friendUserID }),
    })
    if (res.ok) {
      const channel = await res.json()
      router.push(`/messages/${channel.room_id}`)
    }
  }

  const handleRemove = async (friendshipID: string) => {
    const res = await fetch(`/api/friends/${friendshipID}`, { method: 'DELETE' })
    if (res.ok) setFriends(prev => prev.filter(f => f.friendship_id !== friendshipID))
  }

  const handleBlock = async (userID: string) => {
    setFriends(prev => prev.filter(f => f.user.id !== userID))
    await addUserBlock(userID)
  }

  const handleAccept = async (friendshipID: string) => {
    const res = await fetch(`/api/friends/requests/${friendshipID}/accept`, { method: 'POST' })
    if (res.ok) {
      setPending(prev => prev.filter(p => p.friendship_id !== friendshipID))
      fetchFriends()
      window.dispatchEvent(new Event('friends:pending-changed'))
    }
  }

  const handleDecline = async (friendshipID: string) => {
    const res = await fetch(`/api/friends/requests/${friendshipID}/decline`, { method: 'POST' })
    if (res.ok) {
      setPending(prev => prev.filter(p => p.friendship_id !== friendshipID))
      window.dispatchEvent(new Event('friends:pending-changed'))
    }
  }

  const handleSendRequest = async (userID: string) => {
    const res = await fetch('/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userID }),
    })
    if (res.ok) setSentRequests(prev => new Set(prev).add(userID))
  }

  const shortID = (id: string) => `#${id.slice(0, 4).toUpperCase()}-${id.slice(4, 6).toUpperCase()}`

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-120 w-full flex-col gap-6 overflow-hidden">
      <div ref={searchRef} className="relative">
        <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMed" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search for users or node IDs..."
          className="w-full rounded-2xl bg-surfaceNavy py-4 pl-12 pr-6 text-sm text-textHigh shadow-[0_8px_24px_var(--color-panelShadow)] outline-none ring-1 ring-softBorder placeholder:text-textMed focus:ring-electricPurple/50"
        />
        {searchOpen && (searchResults.length > 0 || searching || searchQuery.length >= 2) && (
          <div className="absolute top-full z-20 mt-2 w-full rounded-2xl border border-softBorder bg-surfaceNavy shadow-[0_8px_32px_var(--color-panelShadow)]">
            {searching && (
              <p className="px-5 py-4 text-sm text-textMed">Searching...</p>
            )}
            {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="px-5 py-4 text-sm text-textMed">No users found.</p>
            )}
            {searchResults.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 transition hover:bg-deepNavy">
                <HexAvatar initials={u.username.slice(0, 2).toUpperCase()} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-textHigh">{u.username}</p>
                  <p className="text-xs text-textMed">{shortID(u.id)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendRequest(u.id)}
                  disabled={sentRequests.has(u.id)}
                  className="rounded-xl bg-electricPurple/20 px-4 py-1.5 text-xs font-semibold text-electricPurple transition hover:bg-electricPurple hover:text-white disabled:opacity-50"
                >
                  {sentRequests.has(u.id) ? 'Sent' : 'Add Friend'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        <div className="flex w-72 shrink-0 flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-textHigh">Pending Requests</h2>
            {pending.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-electricPurple px-1.5 text-[11px] font-bold text-white">
                {String(pending.length).padStart(2, '0')}
              </span>
            )}
          </div>

          <div className="custom-scroll flex flex-col gap-3 overflow-y-auto">
            {loadingPending && (
              <p className="text-sm text-textMed">Loading...</p>
            )}
            {!loadingPending && pending.length === 0 && (
              <p className="text-sm text-textMed">No incoming requests.</p>
            )}
            {pending.map(p => (
              <div
                key={p.friendship_id}
                className="flex items-center gap-3 rounded-2xl bg-surfaceNavy px-4 py-3.5 shadow-[0_4px_16px_var(--color-panelShadow)]"
              >
                <HexAvatar initials={p.from_user.username.slice(0, 2).toUpperCase()} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-textHigh">{p.from_user.username}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-textMed">
                    Sent {new Date(p.sent_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAccept(p.friendship_id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-electricPurple/20 text-electricPurple transition hover:bg-electricPurple hover:text-white"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDecline(p.friendship_id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-softBorder/40 text-textMed transition hover:bg-red-500/20 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-textHigh">
              My <span className="text-electricPurple italic">Protocol</span>
            </h2>
            <p className="text-xs font-semibold text-textMed">
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </p>
          </div>

          <div className="custom-scroll min-h-0 flex-1 overflow-y-auto">
            {loadingFriends && (
              <p className="text-sm text-textMed">Loading...</p>
            )}
            {!loadingFriends && friends.length === 0 && (
              <p className="text-sm text-textMed">No friends yet. Search for someone above!</p>
            )}
            {friends.length > 0 && (
              <div className="grid grid-cols-2 gap-4 pb-2 xl:grid-cols-3">
                {friends.map(f => (
                  <div
                    key={f.friendship_id}
                    className="flex flex-col items-center gap-4 rounded-2xl bg-surfaceNavy px-5 py-6 shadow-[0_4px_16px_var(--color-panelShadow)]"
                  >
                    <HexAvatar initials={f.user.username.slice(0, 2).toUpperCase()} size="lg" />
                    <div className="flex flex-col items-center gap-0.5 text-center">
                      <p className="text-base font-bold text-textHigh">{f.user.username}</p>
                      <p className="text-xs text-textMed">{shortID(f.user.id)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMessage(f.user.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-electricPurple py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_var(--color-purpleGlow)] transition hover:brightness-110"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </button>
                    <div className="flex w-full gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemove(f.friendship_id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-transparent py-1.5 text-xs font-semibold uppercase tracking-widest text-textMed transition hover:text-red-400"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        Remove
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBlock(f.user.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-transparent py-1.5 text-xs font-semibold uppercase tracking-widest text-textMed transition hover:text-yellow-400"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        Block
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
