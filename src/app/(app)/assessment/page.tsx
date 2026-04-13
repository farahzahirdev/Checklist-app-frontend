import { AssessmentShell } from '@/components/assessment/assessment-shell';
import { mockQuestions, mockSections } from '@/lib/checklist-mocks';

export default function AssessmentPage() {
  // Implementation guide for frontend dev:
  // Purpose: Customer assessment workspace with section sidebar and active question view.
  // Backend touchpoints (planned):
  // - GET /api/v1/assessment/:id (section/question tree)
  // - POST /api/v1/assessment/:id/answer (save answer)
  // - POST /api/v1/assessment/:id/evidence (upload optional file)
  // Acceptance criteria:
  // - Sidebar lists all sections
  // - Question panel shows current question fields
  // - Optional note/evidence controls are visible with 25MB/pdf/png/jpg rules
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Customer</p>
        <h1 className="text-3xl font-semibold">Assessment</h1>
      </header>
      <AssessmentShell sections={mockSections} activeQuestion={mockQuestions[0]} />
    </section>
  );
}
