import { QuestionEditor } from '@/components/checklist/question-editor';
import { mockQuestions } from '@/lib/checklist-mocks';

export default function QuestionDetailPage() {
  // Implementation guide for frontend dev:
  // Purpose: Edit existing question and manage optional note/evidence rules.
  // Backend touchpoints (planned):
  // - GET /api/v1/admin/checklists/:checklistId/sections/:sectionId/questions/:questionId
  // - PATCH /api/v1/admin/checklists/:checklistId/sections/:sectionId/questions/:questionId
  // - DELETE /api/v1/admin/checklists/:checklistId/sections/:sectionId/questions/:questionId
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Admin</p>
        <h1 className="text-3xl font-semibold">Question Detail</h1>
      </header>
      <QuestionEditor questions={mockQuestions} />
    </section>
  );
}
