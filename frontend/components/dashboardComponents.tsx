'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Plus } from 'lucide-react'
import { ReactNode } from 'react'

const PLACEHOLDER_IMAGE =
  'https://static.vecteezy.com/system/resources/previews/042/971/890/non_2x/night-sky-galaxy-cloud-with-nebula-starry-in-dark-blue-background-universe-filled-with-star-light-in-purple-pink-beautiful-nature-star-field-with-milky-way-horizon-banner-colorful-cosmos-stardust-vector.jpg'

// ---------------------------------------------------------------------------
// HexAvatar
// Reusable hexagon-clipped avatar showing user initials.
// Used in the profile card and DM list.
// ---------------------------------------------------------------------------
type HexAvatarSize = 'sm' | 'md' | 'lg'

export function HexAvatar({
  initials,
  size = 'md',
}: {
  initials: string
  size?: HexAvatarSize
}) {
  const containerSizes: Record<HexAvatarSize, string> = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
  }
  const textSizes: Record<HexAvatarSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-xl',
  }
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${containerSizes[size]}`}
    >
      <span className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-electricPurple/40" />
      <span className="absolute inset-[2px] [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-surfaceNavy" />
      <span className={`relative z-10 font-bold text-textHigh ${textSizes[size]}`}>
        {initials}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DirectMessageItem
// A single row in the Direct Messages list.
// ---------------------------------------------------------------------------
export type DMItem = {
  id: string
  name: string
  initials: string
  timestamp: string
  preview: string
  active?: boolean
  online?: boolean
}

export function DirectMessageItem({ dm }: { dm: DMItem }) {
  return (
    // TODO: Update href once the /messages route is implemented
    <Link
      href={`/messages/${dm.id}`}
      className={`flex items-center gap-3 rounded-xl p-2.5 transition ${
        dm.active
          ? 'border border-electricPurple/40 bg-deepNavy shadow-[0_0_12px_var(--color-purpleGlow)]'
          : 'hover:bg-deepNavy/60'
      }`}
    >
      <div className="relative shrink-0">
        <HexAvatar initials={dm.initials} size="sm" />
        {dm.online && (
          <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-surfaceNavy" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-semibold text-textHigh">{dm.name}</span>
          <span className="shrink-0 text-xs text-textMed">{dm.timestamp}</span>
        </div>
        <p className="truncate text-xs text-textMed">{dm.preview}</p>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// FeaturedServerCard
// A large card with a background image for the server constellation grid.
// Different from ServerCard (discover page) — uses image overlay layout.
// ---------------------------------------------------------------------------
export type FeaturedServerData = {
  id: string
  name: string
  memberCount: string
  image?: string
}

export function FeaturedServerCard({ data }: { data: FeaturedServerData }) {
  return (
    <Link href={`/${data.id}`} className="group relative overflow-hidden rounded-2xl">
      <div className="relative h-52 w-full">
        <Image
          src={data.image ?? PLACEHOLDER_IMAGE}
          alt={data.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Card content */}
        <div className="absolute right-0 bottom-0 left-0 flex items-end justify-between p-4">
          <div>
            <h3 className="text-base font-bold text-white">{data.name}</h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-white/80">
                {data.memberCount} ONLINE
              </span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-electricPurple/80 text-white shadow-[0_0_12px_var(--color-purpleGlow)] transition group-hover:bg-electricPurple">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// NewServerCard
// Dashed placeholder card that triggers server creation (via ServerActionModal).
// ---------------------------------------------------------------------------
export function NewServerCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-52 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-electricPurple/40 bg-surfaceNavy/30 transition hover:border-electricPurple/70 hover:bg-surfaceNavy/60"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-electricPurple/20 text-electricPurple transition group-hover:bg-electricPurple/30">
        <Plus className="h-6 w-6" />
      </div>
      <span className="text-sm font-semibold text-textMed transition group-hover:text-textHigh">
        New Universe
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// QuickActionButton
// Full-width action button for the right-side Quick Actions panel.
// ---------------------------------------------------------------------------
type QuickActionVariant = 'primary' | 'secondary'

export function QuickActionButton({
  icon,
  children,
  variant = 'secondary',
  onClick,
}: {
  icon: ReactNode
  children: ReactNode
  variant?: QuickActionVariant
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
        variant === 'primary'
          ? 'bg-electricPurple text-white shadow-[0_0_20px_var(--color-purpleGlow)] hover:opacity-90'
          : 'border border-softBorder text-textMed hover:border-electricPurple/50 hover:text-textHigh'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// TrendingCard
// Compact card with background image for the Trending section.
// ---------------------------------------------------------------------------
export type TrendingCardData = {
  id: string
  name: string
  category: string
  image?: string
}

export function TrendingCard({ data }: { data: TrendingCardData }) {
  return (
    // TODO: Update href to link to the actual server once discover/join is wired up
    <Link href={`/discover`} className="group relative overflow-hidden rounded-xl">
      <div className="relative h-24 w-full">
        <Image
          src={data.image ?? PLACEHOLDER_IMAGE}
          alt={data.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
            {data.category}
          </p>
          <p className="text-sm font-bold text-white">{data.name}</p>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// DataCoreBar
// Storage / usage progress bar shown at the bottom of the right panel.
// ---------------------------------------------------------------------------
export function DataCoreBar({ usedPercent }: { usedPercent: number }) {
  return (
    <div className="rounded-2xl bg-surfaceNavy p-4 shadow-[0_8px_24px_var(--color-panelShadow)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-textMed">Data Core</p>
        {/* TODO: Replace with real storage usage from /api/users/me or a dedicated storage endpoint */}
        <p className="text-xs font-bold text-textHigh">{usedPercent}% Full</p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-deepNavy">
        <div
          className="h-full rounded-full bg-electricPurple shadow-[0_0_8px_var(--color-purpleGlow)] transition-all duration-500"
          style={{ width: `${Math.min(usedPercent, 100)}%` }}
        />
      </div>
    </div>
  )
}
