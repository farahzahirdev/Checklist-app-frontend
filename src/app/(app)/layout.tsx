import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="min-h-screen px-6 py-8 text-zinc-100 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl border border-white/15 bg-black/25 p-5 backdrop-blur md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/85">Checklist App</p>
              <p className="mt-2 text-xl font-semibold text-zinc-100 md:text-2xl">Secure Access Workspace</p>
            </div>
            <nav className="flex items-center gap-3 text-sm text-zinc-300">
              <Link href="/" className="rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10">
                Public
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg border border-cyan-300/30 bg-cyan-400/15 px-3 py-1.5 text-cyan-100 hover:bg-cyan-400/25"
              >
                Dashboard
              </Link>
              <Link href="/assessment" className="rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10">
                Assessment
              </Link>
              <Link href="/reports" className="rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10">
                Reports
              </Link>
              <Link href="/resources" className="rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10">
                Resources
              </Link>
              <Link href="/admin/checklists" className="rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10">
                Admin
              </Link>
              <Link href="/health" className="rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10">
                Health
              </Link>
            </nav>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}