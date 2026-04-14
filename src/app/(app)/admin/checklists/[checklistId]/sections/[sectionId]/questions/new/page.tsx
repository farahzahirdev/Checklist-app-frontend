import { QuestionEditor } from '@/components/checklist/question-editor';
import { mockQuestions } from '@/lib/checklist-mocks';

export default function NewQuestionPage() {
  // Implementation guide for frontend dev:
  // Purpose: Create question with full schema fields.
  // Required fields:
  // - security level, question id, audit type, legal requirement,
  //   explanation, expected implementation, points, customer answer status.
  // Optional fields:
  // - note, evidence upload metadata.
  // Backend touchpoints (planned):
  // - POST /api/v1/admin/checklists/:checklistId/sections/:sectionId/questions
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Admin</p>
        <h1 className="text-3xl font-semibold">Create Question</h1>
      </header>
      <QuestionEditor questions={mockQuestions} />
    </section>
  );
}
