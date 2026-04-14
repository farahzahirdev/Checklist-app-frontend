import type { ReactNode } from 'react';
import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="min-h-screen px-6 py-8 text-[#ffffff] md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl border border-[#2f4d82] bg-[#07112a]/85 p-5 backdrop-blur md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#9dc5ff]">Checklist App</p>
              <p className="mt-2 text-xl font-semibold text-white md:text-2xl">Secure Access Workspace</p>
            </div>
            <nav className="flex items-center gap-3 text-sm text-[#d8e2f2]">
              <Link href="/" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                Public
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg border border-[#1f7bff] bg-[#1f7bff]/25 px-3 py-1.5 text-[#f3f8ff] hover:bg-[#1f7bff]/35"
              >
                Dashboard
              </Link>
              <Link href="/assessment" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                Assessment
              </Link>
              <Link href="/reports" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                Reports
              </Link>
              <Link href="/resources" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                Resources
              </Link>
              <Link href="/admin/checklists" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                Admin
              </Link>
              <Link href="/health" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                Health
              </Link>
              <LogoutButton />
            </nav>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}