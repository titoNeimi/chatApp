export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(900px_circle_at_top_left,var(--color-purpleGlow)_0%,transparent_50%),linear-gradient(180deg,var(--color-deepNavy)_0%,var(--color-surfaceNavy)_100%)] px-4 py-12">
      {children}
    </div>
  );
}
