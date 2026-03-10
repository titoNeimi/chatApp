'use client'

import { Server } from "@/types/server";
import { Bell, ChevronRight, Compass, Home, MessageSquare, Moon, Plus, Search, Sparkles, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const DARK_THEME: Record<string, string> = {
  "--color-deepNavy": "#0a0e17",
  "--color-surfaceNavy": "#121826",
  "--color-electricPurple": "#8b5cf6",
  "--color-purpleGlow": "rgba(139, 92, 246, 0.3)",
  "--color-textHigh": "#ffffff",
  "--color-textMed": "#94a3b8",
  "--color-softBorder": "rgba(148, 163, 184, 0.22)",
  "--color-panelShadow": "rgba(2, 6, 23, 0.35)",
};

const LIGHT_THEME: Record<string, string> = {
  "--color-deepNavy": "#e3eaf7",
  "--color-surfaceNavy": "#ffffff",
  "--color-electricPurple": "#7c3aed",
  "--color-purpleGlow": "rgba(124, 58, 237, 0.14)",
  "--color-textHigh": "#0f172a",
  "--color-textMed": "#475569",
  "--color-softBorder": "rgba(100, 116, 139, 0.26)",
  "--color-panelShadow": "rgba(15, 23, 42, 0.12)",
};

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const selectedTheme = mode === "light" ? LIGHT_THEME : DARK_THEME;
  Object.entries(selectedTheme).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function Topbar(params: { servers: Server[] | null }) {
  const { servers } = params;
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("chatapp-theme") === "light" ? "light" : "dark";
  });
  const [serversOpen, setServersOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem("chatapp-theme", theme);
  }, [theme]);

  const handleThemeToggle = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  const selectedServerID = pathname.split("/")[1];
  const isOnServer = servers?.some((s) => s.id === selectedServerID);

  return (
    <header className="relative flex h-16 w-full items-center gap-3 bg-deepNavy px-3 backdrop-blur sm:gap-5 sm:px-6">
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-electricPurple text-white shadow-[0_0_20px_var(--color-purpleGlow)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-textHigh">chatAPP</h1>
      </div>

      <span className="h-6 w-px shrink-0 bg-softBorder" />

      {/* Nav links */}
      <nav className="flex shrink-0 items-center gap-1">
        <NavLink href="/dashboard" active={pathname === "/dashboard"} icon={<Home className="h-4 w-4" />}>
          Home
        </NavLink>
        <NavLink href="/discover" active={pathname === "/discover"} icon={<Compass className="h-4 w-4" />}>
          Discover
        </NavLink>
        <NavLink href="/messages" active={pathname === "/messages"} icon={<MessageSquare className="h-4 w-4" />}>
          Messages
        </NavLink>
      </nav>

      <span className="h-6 w-px shrink-0 bg-softBorder" />

      {/* Servers expandable row */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {/* Arrow toggle */}
        <button
          type="button"
          onClick={() => setServersOpen((o) => !o)}
          aria-label={serversOpen ? "Collapse servers" : "Expand servers"}
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
            isOnServer
              ? "bg-electricPurple text-white shadow-[0_0_16px_var(--color-purpleGlow)]"
              : "bg-surfaceNavy text-textMed hover:bg-deepNavy hover:text-textHigh"
          }`}
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-300 ease-in-out ${serversOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Sliding server badges */}
        <div
          className={`flex min-w-0 items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
            serversOpen ? "max-w-full opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          <div className="flex items-center gap-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {servers && servers.map((server) => (
              <ServerBadge
                key={server.id}
                serverID={server.id}
                serverName={server.name}
                selected={selectedServerID === server.id}
              />
            ))}
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surfaceNavy text-textMed transition hover:bg-deepNavy hover:text-textHigh"
              aria-label="Add server"
            >
              <Plus className="h-4 w-4" />
            </button>
            {servers?.length === 0 && (
              <p className="whitespace-nowrap pl-1 text-sm text-textMed">No servers yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-1 h-6 w-px bg-softBorder" />
        <TopbarActionButton label="Search">
          <Search className="h-4 w-4" />
        </TopbarActionButton>
        <TopbarActionButton label="Notifications">
          <Bell className="h-4 w-4" />
        </TopbarActionButton>
        <TopbarActionButton
          label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={handleThemeToggle}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </TopbarActionButton>
        <HexProfileButton />
      </div>
    </header>
  );
}

function NavLink(params: { href: string; active: boolean; icon: ReactNode; children: ReactNode }) {
  const { href, active, icon, children } = params;
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
        active
          ? "bg-electricPurple text-white shadow-[0_0_20px_var(--color-purpleGlow)]"
          : "text-textMed hover:bg-surfaceNavy hover:text-textHigh"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function ServerBadge(params: { serverName: string; serverID: string; selected: boolean }) {
  const { serverName, serverID, selected } = params;
  return (
    <Link
      href={`/${serverID}`}
      className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
        selected
          ? "bg-electricPurple text-white shadow-[0_0_20px_var(--color-purpleGlow)]"
          : "bg-surfaceNavy text-textMed hover:bg-deepNavy hover:text-textHigh"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${selected ? "bg-white" : "bg-electricPurple"}`} />
      <span className="whitespace-nowrap uppercase">{serverName}</span>
    </Link>
  );
}

function TopbarActionButton(params: { children: ReactNode; label: string; onClick?: () => void }) {
  const { children, label, onClick } = params;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-textMed transition hover:bg-surfaceNavy hover:text-textHigh"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function HexProfileButton() {
  return (
    <button
      type="button"
      className="relative ml-1 inline-flex h-9 w-9 items-center justify-center"
      aria-label="User profile"
    >
      <span className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-purpleGlow" />
      <span className="absolute inset-[1.5px] [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-surfaceNavy transition hover:bg-deepNavy" />
      <span className="relative z-10 text-sm font-semibold text-textHigh">U</span>
    </button>
  );
}
