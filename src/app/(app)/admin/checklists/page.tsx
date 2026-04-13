import Link from 'next/link';
import { getAdminChecklists } from '@/lib/checklist-api';

export default async function AdminChecklistsPage() {
  // Implementation guide for frontend dev:
  // Purpose: List all checklist schemas with actions (view/edit/publish/delete).
  // Backend touchpoints (planned):
  // - GET /api/v1/admin/checklists
  // - PATCH /api/v1/admin/checklists/:id/publish
  // - DELETE /api/v1/admin/checklists/:id
  const checklists = await getAdminChecklists();

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Admin</p>
          <h1 className="text-3xl font-semibold">Checklist Schemas</h1>
        </div>
        <Link href="/admin/checklists/new" className="rounded-lg border border-cyan-300/35 px-3 py-2 text-sm text-cyan-100">
          New Checklist
        </Link>
      </header>

      <div className="space-y-3">
        {checklists.map((checklist) => (
          <article key={checklist.id} className="rounded-xl border border-white/15 bg-black/25 p-4">
            <p className="font-medium">{checklist.title}</p>
            <p className="mt-1 text-sm text-zinc-300">{checklist.lawDecree}</p>
            <p className="mt-1 text-xs text-zinc-400">Status: {checklist.status}</p>
            <Link href={`/admin/checklists/${checklist.id}`} className="mt-3 inline-block text-sm text-cyan-200">
              Open checklist
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
