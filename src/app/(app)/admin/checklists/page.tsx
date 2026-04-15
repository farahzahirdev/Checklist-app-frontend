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
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Checklist Content</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Checklist Schemas</h1>
          <p className="mt-1 text-sm text-[#607594]">Create and manage checklist templates used by customer assessments.</p>
        </div>
        <Link href="/admin/checklists/new" className="rounded-xl border border-[#2f7dff] bg-[#2f7dff] px-4 py-2 text-sm font-semibold text-white">
          New Checklist
        </Link>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {checklists.map((checklist) => (
          <article key={checklist.id} className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
            <p className="text-lg font-semibold text-[#25375a]">{checklist.title}</p>
            <p className="mt-1 text-sm text-[#5f7395]">{checklist.lawDecree}</p>
            <p className="mt-2">
              <span className="rounded-md bg-[#edf1f8] px-2 py-1 text-xs font-semibold text-[#607594]">Status: {checklist.status}</span>
            </p>
            <Link href={`/admin/checklists/${checklist.id}`} className="mt-4 inline-block text-sm font-semibold text-[#3e69b0]">
              Open checklist
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
