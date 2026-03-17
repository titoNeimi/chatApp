'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useUser } from "@/context/userContext";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useUser();
  const [formData, setFormData] = useState<{ email: string; password: string }>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ message: "Login failed" }));
        setError(payload.message ?? "Login failed");
        return;
      }

      await refresh();
      router.push('/dashboard');
    } catch {
      setError("Unexpected error while logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">

      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-electricPurple shadow-[0_0_32px_var(--color-purpleGlow)]">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-textHigh">chatAPP</h1>
      </div>

      {/* Card */}
      <div className="flex flex-col gap-6 rounded-2xl border border-softBorder bg-surfaceNavy p-8 shadow-[0_8px_40px_var(--color-panelShadow)]">
        <div>
          <h2 className="text-2xl font-bold text-textHigh">Welcome back</h2>
          <p className="mt-1 text-sm text-textMed">Sign in to continue to your constellations.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email">
            <input
              onChange={handleChange}
              value={formData.email}
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="Password">
            <div className="relative">
              <input
                onChange={handleChange}
                value={formData.password}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="••••••••"
                required
                className={`${INPUT_CLASS} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textMed transition hover:text-textHigh"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-electricPurple py-3 text-sm font-semibold text-white shadow-[0_0_20px_var(--color-purpleGlow)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-textMed">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-electricPurple hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-softBorder bg-deepNavy px-4 py-2.5 text-sm text-textHigh placeholder:text-textMed/50 outline-none transition focus:border-electricPurple focus:shadow-[0_0_0_3px_var(--color-purpleGlow)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-textMed">{label}</label>
      {children}
    </div>
  );
}
