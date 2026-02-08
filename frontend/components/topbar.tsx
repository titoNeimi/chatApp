'use client'

import { Server } from "@/types/server";
import { Bell, Moon, Plus, Search, Sparkles, Sun } from "lucide-react";
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

  Object.entries(selectedTheme).forEach(([variableName, variableValue]) => {
    root.style.setProperty(variableName, variableValue);
  });
}

export function Topbar(params: { servers: Server[] | null }) {
  const { servers } = params
  const pathname = usePathname()
  const selectedServerID = pathname.split("/")[1]
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("chatapp-theme") === "light"
      ? "light"
      : "dark";
  });

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem("chatapp-theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((currentTheme) => (
      currentTheme === "dark" ? "light" : "dark"
    ));
  };

  return (
    <header className="relative flex h-20 w-full items-center gap-3 bg-deepNavy px-3 backdrop-blur sm:gap-5 sm:px-6">
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-electricPurple text-white shadow-[0_0_20px_var(--color-purpleGlow)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-textHigh">chatAPP</h1>
      </div>

      <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {servers && servers.map((server, i) => (
          <ServerBadges
            key={server.id}
            serverID={server.id}
            serverName={server.name}
            selected={selectedServerID ? selectedServerID === server.id : i === 0}
          />
        ))}
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surfaceNavy text-textMed transition hover:bg-deepNavy hover:text-textHigh"
          aria-label="Agregar servidor"
        >
          <Plus className="h-4 w-4" />
        </button>
        {servers?.length === 0 && (
          <p className="pl-2 text-sm text-textMed">No servers yet</p>
        )}
      </nav>

      <div className="flex shrink-0 items-center gap-1 pl-2 sm:gap-2 sm:pl-4">
        <span className="mr-1 h-8 w-px bg-softBorder" />
        <TopbarActionButton label="Buscar">
          <Search className="h-5 w-5" />
        </TopbarActionButton>
        <TopbarActionButton label="Notificaciones">
          <Bell className="h-5 w-5" />
        </TopbarActionButton>
        <TopbarActionButton
          label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          onClick={handleThemeToggle}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </TopbarActionButton>

        <HexProfileButton />
      </div>
    </header>
  );
}

function ServerBadges(params: { serverName: string, serverID: string, selected: boolean }) {
  const { serverName, serverID, selected } = params

  return (
    <Link
      href={`/${serverID}`}
      className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
        selected
          ? "bg-electricPurple text-white shadow-[0_0_20px_var(--color-purpleGlow)]"
          : "bg-surfaceNavy text-textMed hover:bg-deepNavy hover:text-textHigh"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          selected ? "bg-white" : "bg-electricPurple"
        }`}
      />
      <span className="whitespace-nowrap uppercase">{serverName}</span>
    </Link>
  )
}

function TopbarActionButton(params: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  const { children, label, onClick } = params;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-textMed transition hover:bg-surfaceNavy hover:text-textHigh"
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
      className="relative ml-1 inline-flex h-11 w-11 items-center justify-center"
      aria-label="Perfil de usuario"
    >
      <span className="absolute inset-0 [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-purpleGlow" />
      <span className="absolute inset-[1.5px] [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)] bg-surfaceNavy transition hover:bg-deepNavy" />
      <span className="relative z-10 text-sm font-semibold text-textHigh">U</span>
    </button>
  );
}
