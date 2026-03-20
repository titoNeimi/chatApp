'use client'

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";

type State = "loading" | "ready" | "joining" | "success" | "expired" | "invalid" | "error"

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  const [state, setState] = useState<State>("loading");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const loadPreview = useCallback(() => {
    if (!code) { setState("invalid"); return; }
    setState("loading");
    fetch(`/api/invitations/${code}`)
      .then((r) => {
        if (r.status === 401) { router.replace("/login"); return null; }
        if (r.status === 404) { setState("invalid"); return null; }
        if (!r.ok) { setState("error"); return null; }
        return r.json();
      })
      .then((data: InvitationPreview | null) => {
        if (!data) return;
        setPreview(data);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [code, router]);

  useEffect(() => { loadPreview(); }, [loadPreview]);

  const handleJoin = async () => {
    setState("joining");
    setJoinError(null);
    try {
      const r = await fetch(`/api/invitations/${code}/use`, { method: "POST" });
      if (r.status === 401) { router.replace("/login"); return; }
      if (r.status === 404) { setState("invalid"); return; }
      if (r.status === 410) { setState("expired"); return; }
      if (r.status === 409) {
        // Already a member — just go to the server
        router.replace(preview ? `/${preview.server.id}` : "/dashboard");
        return;
      }
      if (!r.ok) { setState("ready"); setJoinError("Something went wrong. Please try again."); return; }
      setState("success");
      setTimeout(() => router.replace(preview ? `/${preview.server.id}` : "/dashboard"), 1200);
    } catch {
      setState("ready");
      setJoinError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--color-deepNavy)_0%,var(--color-surfaceNavy)_100%)]">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-softBorder bg-deepNavy p-8 text-center shadow-xl">

        {state === "loading" && (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-electricPurple border-t-transparent" />
            <p className="text-sm text-textMed">Loading invite…</p>
          </>
        )}

        {(state === "ready" || state === "joining") && preview && (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-electricPurple/10 text-electricPurple">
              <Users className="h-8 w-8" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-textMed">You&apos;ve been invited to</p>
              <h1 className="mt-1 text-2xl font-bold text-textHigh">{preview.server.name}</h1>
              {preview.server.description && (
                <p className="mt-1 text-sm text-textMed">{preview.server.description}</p>
              )}
            </div>

            {joinError && <p className="text-sm text-red-400">{joinError}</p>}

            <button
              onClick={handleJoin}
              disabled={state === "joining"}
              className="w-full rounded-full bg-electricPurple py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_var(--color-purpleGlow)] transition hover:opacity-90 disabled:opacity-60"
            >
              {state === "joining" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Joining…
                </span>
              ) : (
                "Accept Invite"
              )}
            </button>
          </>
        )}

        {state === "success" && (
          <>
            <span className="text-3xl font-bold text-electricPurple">✓</span>
            <p className="text-base font-semibold text-textHigh">Joined {preview?.server.name}!</p>
            <p className="text-sm text-textMed">Redirecting you now…</p>
          </>
        )}

        {state === "expired" && (
          <>
            <p className="text-base font-semibold text-textHigh">Invite expired</p>
            <p className="text-sm text-textMed">This link has expired or reached its maximum number of uses.</p>
            <a href="/dashboard" className="rounded-full bg-electricPurple px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90">
              Go to Dashboard
            </a>
          </>
        )}

        {state === "invalid" && (
          <>
            <p className="text-base font-semibold text-textHigh">Invalid invite</p>
            <p className="text-sm text-textMed">This invite link doesn&apos;t exist.</p>
            <a href="/dashboard" className="rounded-full bg-electricPurple px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90">
              Go to Dashboard
            </a>
          </>
        )}

        {state === "error" && (
          <>
            <p className="text-base font-semibold text-textHigh">Something went wrong</p>
            <p className="text-sm text-textMed">Could not load this invite. Please try again.</p>
            <button
              onClick={loadPreview}
              className="rounded-full bg-electricPurple px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Retry
            </button>
          </>
        )}

      </div>
    </div>
  );
}
