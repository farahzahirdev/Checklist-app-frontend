import type { ChecklistQuestion } from '@/lib/checklist-types';

interface QuestionEditorProps {
  questions: ChecklistQuestion[];
}

export function QuestionEditor({ questions }: QuestionEditorProps) {
  // Frontend dev implementation guide:
  // 1) Convert into a create/edit drawer with field-level validation.
  // 2) Enforce required fields: questionId, legalRequirement, explanation, expectedImplementation, points.
  // 3) Add per-question optional note/evidence controls and upload integration.
  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-5">
      <h2 className="text-xl font-semibold">Questions</h2>
      <p className="mt-2 text-sm text-zinc-300">Question core fields with risk level, legal requirement, and points.</p>
      <div className="mt-4 space-y-3">
        {questions.map((question) => (
          <article key={question.id} className="rounded-lg border border-white/15 p-3 text-sm">
            <p className="font-medium">{question.questionId}</p>
            <p className="text-zinc-300">{question.legalRequirement}</p>
            <p className="mt-1 text-zinc-400">Risk: {question.securityLevel} | Points: {question.points}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
