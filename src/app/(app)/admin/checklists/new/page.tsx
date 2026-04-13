import { ChecklistEditor } from '@/components/checklist/checklist-editor';
import { mockChecklist } from '@/lib/checklist-mocks';

export default function NewChecklistPage() {
  // Implementation guide for frontend dev:
  // Purpose: Create new checklist schema (draft).
  // Backend touchpoints (planned):
  // - POST /api/v1/admin/checklists
  // Acceptance criteria:
  // - Validates required fields and creates draft checklist.
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Admin</p>
        <h1 className="text-3xl font-semibold">Create Checklist</h1>
      </header>
      <ChecklistEditor checklist={mockChecklist} />
    </section>
  );
}
