'use client'

import { Server } from "@/types/server";
import { Users } from "lucide-react";
import Image from "next/image";

const PLACEHOLDER_IMAGE = "https://static.vecteezy.com/system/resources/previews/042/971/890/non_2x/night-sky-galaxy-cloud-with-nebula-starry-in-dark-blue-background-universe-filled-with-star-light-in-purple-pink-beautiful-nature-star-field-with-milky-way-horizon-banner-colorful-cosmos-stardust-vector.jpg";

type BadgeVariant = "new" | "trending";

export type ServerCardData = Server & {
  id: string;
  memberCount?: string;
  badge?: BadgeVariant;
  image?: string;
  featured?: boolean;
};

function Badge({ variant }: { variant: BadgeVariant }) {
  const styles: Record<BadgeVariant, { label: string; className: string }> = {
    trending: { label: "TRENDING", className: "bg-emerald-500 text-white" },
    new:      { label: "NEW",      className: "bg-blue-500 text-white" },
  };
  const { label, className } = styles[variant];
  return (
    <span className={`absolute top-3 left-3 z-10 text-xs font-bold px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  );
}

function JoinButton({ featured, onJoin, id }: { featured: boolean, onJoin: (serverID: string) => void, id: string }) {
  return (
    <button
      type="button"
      className={`w-full py-2.5 rounded-full font-semibold text-sm transition ${
        featured
          ? "bg-electricPurple text-white shadow-[0_0_16px_var(--color-purpleGlow)] hover:opacity-90"
          : "border border-softBorder text-textMed hover:border-electricPurple hover:text-textHigh"
      }`}
      onClick={() => onJoin(id)}
    >
      Join Community
    </button>
  );
}

export function ServerCard({serverData, onJoin}: {serverData: ServerCardData, onJoin: (id: string) => void}) {
  const {name, created_at, memberCount = "1k", badge, image, featured = false, id} = serverData
  const isNew = !badge && (new Date().getTime() - new Date(created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;
  const resolvedBadge: BadgeVariant | null = badge ?? (isNew ? "new" : null);

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-surfaceNavy border border-softBorder transition hover:border-electricPurple/40 hover:shadow-[0_0_24px_var(--color-panelShadow)]">
      <div className="relative">
        {resolvedBadge && <Badge variant={resolvedBadge} />}
        <Image
          width={350}
          height={200}
          className="w-full object-cover h-44"
          src={image ?? PLACEHOLDER_IMAGE}
          alt={name}
        />
      </div>
      <div className="flex flex-col gap-3 px-4 py-4">
        <div>
          <h3 className="font-bold text-lg text-textHigh">{name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-textMed">
            <Users className="h-3.5 w-3.5" />
            <span>{memberCount} members</span>
          </div>
        </div>
        <JoinButton featured={featured} onJoin={onJoin} id={id}/>
      </div>
    </div>
  );
}

const CATEGORIES = ["All", "Gaming", "Technology", "Art", "Music", "Education", "Lifestyle", "Business"] as const;
export type Category = (typeof CATEGORIES)[number];

export function CategoryFilter({
  selected,
  onChange,
}: {
  selected: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            selected === cat
              ? "bg-electricPurple text-white shadow-[0_0_16px_var(--color-purpleGlow)]"
              : "border border-softBorder text-textMed hover:border-electricPurple/60 hover:text-textHigh"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
