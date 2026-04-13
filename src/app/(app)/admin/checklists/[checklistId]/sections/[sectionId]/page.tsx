import Link from 'next/link';
import { QuestionEditor } from '@/components/checklist/question-editor';
import { getQuestionsBySection } from '@/lib/checklist-api';

interface SectionDetailPageProps {
  params: Promise<{ checklistId: string; sectionId: string }>;
}

export default async function SectionDetailPage({ params }: SectionDetailPageProps) {
  // Implementation guide for frontend dev:
  // Purpose: Update section and manage all questions within it.
  // Backend touchpoints (planned):
  // - GET /api/v1/admin/checklists/:checklistId/sections/:sectionId/questions
  // - PATCH /api/v1/admin/checklists/:checklistId/sections/:sectionId
  const { checklistId, sectionId } = await params;
  const questions = await getQuestionsBySection(checklistId, sectionId);

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Admin</p>
          <h1 className="text-3xl font-semibold">Section Detail</h1>
        </div>
        <Link
          href={`/admin/checklists/${checklistId}/sections/${sectionId}/questions/new`}
          className="rounded-lg border border-cyan-300/35 px-3 py-2 text-sm text-cyan-100"
        >
          Add Question
        </Link>
      </header>

      <QuestionEditor questions={questions} />
    </section>
  );
}
