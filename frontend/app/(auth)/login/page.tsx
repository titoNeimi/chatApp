'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useUser } from "@/context/userContext";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useUser();
  const [formData, setFormData] = useState<{ email: string; password: string }>({ email: '', password: '' });
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
    <section className="bg-white dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center text-dark dark:text-white px-4">
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <h2 className="text-2xl text-center">Log in</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium">Email</label>
            <input onChange={handleChange} value={formData.email} type="email" id="email" name="email" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-blue-400" />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="password" className="font-medium">Password</label>
            <input onChange={handleChange} value={formData.password} type="password" id="password" name="password" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-blue-400" />
          </div>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <button disabled={loading} type="submit" className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-200">{loading ? 'Logging in...' : 'Log in'}</button>
        </form>
        <p className="text-sm text-center text-slate-500">
          Don&apos;t have an account? <Link href="/register" className="text-blue-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </section>
  );
}
