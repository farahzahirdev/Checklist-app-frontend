import Link from 'next/link';
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
        <Link href="/admin/checklists" className="inline-flex items-center gap-1 text-sm font-medium text-[#425f8f] hover:text-[#223a63]">
          <span aria-hidden="true">←</span>
          Back
        </Link>
        <h1 className="text-3xl font-semibold">Create Section</h1>
      </header>
      <SectionEditor sections={mockSections} />
    </section>
  );
}
