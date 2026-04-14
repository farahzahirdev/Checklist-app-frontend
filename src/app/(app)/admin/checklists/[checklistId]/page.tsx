import Link from 'next/link';
import { ChecklistEditor } from '@/components/checklist/checklist-editor';
import { SectionEditor } from '@/components/checklist/section-editor';
import { getChecklistById, getSectionsByChecklist } from '@/lib/checklist-api';

interface ChecklistDetailPageProps {
  params: Promise<{ checklistId: string }>;
}

export default async function ChecklistDetailPage({ params }: ChecklistDetailPageProps) {
  // Implementation guide for frontend dev:
  // Purpose: Update checklist metadata and manage section ordering.
  // Backend touchpoints (planned):
  // - GET /api/v1/admin/checklists/:checklistId
  // - PATCH /api/v1/admin/checklists/:checklistId
  // - POST /api/v1/admin/checklists/:checklistId/sections
  const { checklistId } = await params;
  const checklist = await getChecklistById(checklistId);
  const sections = await getSectionsByChecklist(checklistId);

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Admin</p>
          <h1 className="text-3xl font-semibold">Checklist Detail</h1>
        </div>
        <Link
          href={`/admin/checklists/${checklistId}/sections/new`}
          className="rounded-lg border border-cyan-300/35 px-3 py-2 text-sm text-cyan-100"
        >
          Add Section
        </Link>
      </header>

      <ChecklistEditor checklist={checklist} />
      <SectionEditor sections={sections} />
    </section>
  );
}
