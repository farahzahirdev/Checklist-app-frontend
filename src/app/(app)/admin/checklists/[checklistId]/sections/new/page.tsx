import { SectionEditor } from '@/components/checklist/section-editor';
import { mockSections } from '@/lib/checklist-mocks';

export default function NewSectionPage() {
  // Implementation guide for frontend dev:
  // Purpose: Create a new section under selected checklist.
  // Backend touchpoints (planned):
  // - POST /api/v1/admin/checklists/:checklistId/sections
  // Acceptance criteria:
  // - New section title + order are validated and saved.
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Admin</p>
        <h1 className="text-3xl font-semibold">Create Section</h1>
      </header>
      <SectionEditor sections={mockSections} />
    </section>
  );
}
