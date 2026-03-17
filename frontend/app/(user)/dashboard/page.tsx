'use client'

import { ServerActionModal } from '@/components/serverActionModal'
import {
  DataCoreBar,
  DirectMessageItem,
  DMItem,
  FeaturedServerCard,
  FeaturedServerData,
  HexAvatar,
  NewServerCard,
  QuickActionButton,
  TrendingCard,
  TrendingCardData,
} from '@/components/dashboardComponents'
import { Plus, Shield, Sparkles, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// ---------------------------------------------------------------------------
// Mock data — remove once backend is connected
// ---------------------------------------------------------------------------

// TODO: Replace with real DMs fetched from a future /api/users/me/dms endpoint
const MOCK_DMS: DMItem[] = [
  {
    id: '1',
    name: 'Nova_Core',
    initials: 'NC',
    timestamp: '2m',
    preview: 'The logic gates are synchronize...',
    online: false,
  },
  {
    id: '2',
    name: 'Echo_Alpha',
    initials: 'EA',
    timestamp: 'Just now',
    preview: 'New data stream available!',
    active: true,
    online: true,
  },
  {
    id: '3',
    name: 'Bit_Runner',
    initials: 'BR',
    timestamp: '1h',
    preview: "Ping me when you're online.",
    online: false,
  },
]

// TODO: Replace with real servers fetched from /api/users/me/servers
const MOCK_SERVERS: FeaturedServerData[] = [
  { id: 'server1', name: 'Cyber Nexus', memberCount: '1.2K' },
  { id: 'server2', name: 'Void Runners', memberCount: '450' },
  { id: 'server3', name: 'Neon Garden', memberCount: '890' },
]

// TODO: Replace with real trending servers fetched from /api/servers/discover
const MOCK_TRENDING: TrendingCardData[] = [
  { id: 'trend1', name: 'Code Architects', category: 'Community' },
  { id: 'trend2', name: 'Deep Space 9', category: 'Exploration' },
]

// TODO: Replace with real storage data from a future storage/usage API endpoint
const MOCK_STORAGE_PERCENT = 78

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------
export default function Dashboard() {
  // TODO: Connect to UserContext — import { useUser } from '@/context/userContext'
  //       then use: const { user } = useUser()
  //       and replace mock user values below with user.username, user.role, etc.
  const mockUserName = 'Voyager_7'
  const mockUserRole = 'MASTER PROTOCOL'
  const mockUserInitials = 'V7'

  const [createServerOpen, setCreateServerOpen] = useState(false)

  // TODO: After connecting to backend, call the servers refresh from the parent
  //       layout (UserLayout) so the topbar server list updates too.
  //       Pass onServerCreated to ServerActionModal accordingly.
  const handleServerCreated = () => {}

  return (
    <section className="flex flex-1 gap-6 text-textHigh">

      {/* ------------------------------------------------------------------ */}
      {/* Left panel — User profile + Direct Messages                         */}
      {/* ------------------------------------------------------------------ */}
      <aside className="flex w-72 shrink-0 flex-col gap-4">

        {/* Profile card */}
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surfaceNavy p-5 shadow-[0_8px_24px_var(--color-panelShadow)]">
          {/* TODO: Pass real user avatar / image once profile pictures are supported */}
          <HexAvatar initials={mockUserInitials} size="lg" />
          <div className="text-center">
            {/* TODO: Replace mock values with data from useUser() context */}
            <p className="text-lg font-bold text-textHigh">{mockUserName}</p>
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
            {/* TODO: Implement new DM flow — open a modal or route to /messages/new */}
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-electricPurple/20 text-electricPurple transition hover:bg-electricPurple hover:text-white"
              aria-label="New direct message"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {/* TODO: Replace MOCK_DMS with real data once DM feature is implemented */}
            {MOCK_DMS.map((dm) => (
              <DirectMessageItem key={dm.id} dm={dm} />
            ))}
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Center — Server constellation grid                                  */}
      {/* ------------------------------------------------------------------ */}
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
          {/* TODO: Replace MOCK_SERVERS with real servers from /api/users/me/servers */}
          {MOCK_SERVERS.map((server) => (
            <FeaturedServerCard key={server.id} data={server} />
          ))}

          {/* Opens the existing ServerActionModal to create or join a server */}
          <NewServerCard onClick={() => setCreateServerOpen(true)} />
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Right panel — Quick Actions, Trending, Data Core                    */}
      {/* ------------------------------------------------------------------ */}
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

        {/* Data Core */}
        {/* TODO: Replace MOCK_STORAGE_PERCENT with real usage data from backend */}
        <DataCoreBar usedPercent={MOCK_STORAGE_PERCENT} />
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
