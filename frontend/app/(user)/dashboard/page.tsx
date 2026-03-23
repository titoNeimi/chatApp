'use client'

import { ServerActionModal } from '@/components/serverActionModal'
import {
  DirectMessageItem,
  DMItem,
  FeaturedServerCard,
  HexAvatar,
  NewServerCard,
  QuickActionButton,
  TrendingCard,
  TrendingCardData,
} from '@/components/dashboardComponents'
import { useUserServers } from '@/context/userServersContext'
import { Plus, Shield, Sparkles, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useUser } from '@/context/userContext'
import { DMChannel } from '@/types/dm'

// TODO: Replace with real trending servers fetched from /api/servers/discover
const MOCK_TRENDING: TrendingCardData[] = [
  { id: 'trend1', name: 'Code Architects', category: 'Community' },
  { id: 'trend2', name: 'Deep Space 9', category: 'Exploration' },
]

export default function Dashboard() {
  const {user, isLoading} = useUser()
  const mockUserRole = 'MASTER PROTOCOL'

  const { servers, refresh: handleServerCreated } = useUserServers()

  const [createServerOpen, setCreateServerOpen] = useState(false)
  const [dmItems, setDmItems] = useState<DMItem[]>([])

  useEffect(() => {
    if (!user?.id) return
    const fetchDMs = async () => {
      const res = await fetch('/api/dm', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      const channels: DMChannel[] = (data.channels ?? []).slice(0, 5)

      const items = await Promise.all(
        channels.map(async (ch): Promise<DMItem> => {
          const otherID = ch.user1_id === user.id ? ch.user2_id : ch.user1_id
          let name = `${otherID.slice(0, 8)}...`
          try {
            const usersRes = await fetch(`/api/rooms/${ch.room_id}/users`)
            if (usersRes.ok) {
              const members: { UserID: string; Username: string }[] = await usersRes.json()
              const other = members.find(m => m.UserID !== user.id)
              if (other) name = other.Username
            }
          } catch { /* use fallback name */ }
          return {
            id: ch.room_id,
            name,
            initials: name.slice(0, 2).toUpperCase(),
            timestamp: new Date(ch.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            preview: 'Direct message',
          }
        })
      )
      setDmItems(items)
    }
    fetchDMs()
  }, [user?.id])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-textMed">Loading user data...</p>
      </div>
    )
  }

  if (!user && !isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">You must be logged in to view the dashboard.</p>
      </div>
    )
  }

  if (user && !isLoading) { return (
    <section className="flex flex-1 gap-6 text-textHigh">
      <aside className="flex w-72 shrink-0 flex-col gap-4">

        {/* Profile card */}
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surfaceNavy p-5 shadow-[0_8px_24px_var(--color-panelShadow)]">
          <HexAvatar initials={user.username.slice(0,2).toUpperCase()} size="lg" />
          <div className="text-center">
            {/* TODO: Replace mock tags */}
            <p className="text-lg font-bold text-textHigh">{user.username}</p>
            <div className="mt-1.5 flex items-center justify-center gap-1 flex-wrap">
              {mockUserRole.split(' ').map((word) => (
                <span
                  key={word}
                  className="rounded-full bg-electricPurple/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-electricPurple"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Direct Messages */}
        <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-surfaceNavy p-4 shadow-[0_8px_24px_var(--color-panelShadow)]">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-widest text-textMed">
              Direct Messages
            </p>
            <Link
              href="/messages"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-electricPurple/20 text-electricPurple transition hover:bg-electricPurple hover:text-white"
              aria-label="New direct message"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            {dmItems.length === 0 ? (
              <p className="px-1 text-xs text-textMed">No conversations yet.</p>
            ) : (
              dmItems.map((dm) => (
                <DirectMessageItem key={dm.id} dm={dm} />
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Center — Server constellation grid*/}
      <main className="flex flex-1 flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold text-textHigh">
            Your Digital{' '}
            <span className="italic text-electricPurple font-[Georgia,serif]">
              Constellations
            </span>
          </h1>
          <p className="mt-1 text-sm text-textMed">
            Manage and explore your active server nodes.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {servers?.map((server) => (
            <FeaturedServerCard key={server.id} data={{ id: server.id, name: server.name }} />
          ))}

          {/* Opens the existing ServerActionModal to create or join a server */}
          <NewServerCard onClick={() => setCreateServerOpen(true)} />
        </div>
      </main>

      {/* Right panel — Quick Actions, Trending, Data Core*/}
      <aside className="flex w-52 shrink-0 flex-col gap-4">

        {/* Quick Actions */}
        <div className="flex flex-col gap-3 rounded-2xl bg-surfaceNavy p-4 shadow-[0_8px_24px_var(--color-panelShadow)]">
          <p className="text-xs font-bold uppercase tracking-widest text-textMed">
            Quick Actions
          </p>
          <div className="flex flex-col gap-2">
            {/* Reuses the same ServerActionModal already wired in the topbar */}
            <QuickActionButton
              variant="primary"
              icon={<Sparkles className="h-4 w-4 shrink-0" />}
              onClick={() => setCreateServerOpen(true)}
            >
              Create Server
            </QuickActionButton>

            {/* TODO: Implement Find Friends feature (search users, send friend requests) */}
            <QuickActionButton icon={<UserPlus className="h-4 w-4 shrink-0" />}>
              Find Friends
            </QuickActionButton>

            {/* TODO: Link to a /settings or /privacy page once user settings are implemented */}
            <QuickActionButton icon={<Shield className="h-4 w-4 shrink-0" />}>
              Privacy Settings
            </QuickActionButton>
          </div>
        </div>

        {/* Trending */}
        <div className="flex flex-col gap-3 rounded-2xl bg-surfaceNavy p-4 shadow-[0_8px_24px_var(--color-panelShadow)]">
          <p className="text-xs font-bold uppercase tracking-widest text-textMed">Trending</p>
          <div className="flex flex-col gap-2">
            {/* TODO: Replace MOCK_TRENDING with real data from /api/servers/discover */}
            {MOCK_TRENDING.map((t) => (
              <TrendingCard key={t.id} data={t} />
            ))}
          </div>
          <Link
            href="/discover"
            className="text-center text-xs font-semibold text-electricPurple hover:underline"
          >
            Discover More
          </Link>
        </div>
      </aside>

      {/* Reusing the existing ServerActionModal component */}
      <ServerActionModal
        open={createServerOpen}
        onClose={() => setCreateServerOpen(false)}
        onServerCreated={handleServerCreated}
      />
    </section>
  )
}
}
