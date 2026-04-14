import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Implementation guide for frontend dev:
  // 1) Protect this layout with admin-only guard once auth context is wired.
  // 2) Keep checklist management as top priority domain in admin nav.
  return (
    <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-white/15 bg-black/25 p-4">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <nav className="mt-4 flex flex-col gap-2 text-sm">
          <Link href="/admin/checklists" className="rounded-lg border border-white/15 px-3 py-2 hover:bg-white/10">
            Checklist Schemas
          </Link>
        </nav>
      </aside>
      <div>{children}</div>
    </section>
  );
}
