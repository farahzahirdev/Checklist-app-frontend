import type { ChecklistQuestion, ChecklistSection } from '@/lib/checklist-types';
import { EvidenceUploadHint } from '@/components/evidence/evidence-upload-hint';

interface AssessmentShellProps {
  sections: ChecklistSection[];
  activeQuestion: ChecklistQuestion;
}

export function AssessmentShell({ sections, activeQuestion }: AssessmentShellProps) {
  // Frontend dev implementation guide:
  // 1) Replace static section list with router-driven sidebar navigation.
  // 2) Bind answer options + note/evidence inputs to assessment session state.
  // 3) Save in-progress answers via assessment API once backend endpoints are ready.
  return (
    <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-white/15 bg-black/25 p-4">
        <h3 className="text-lg font-semibold">Sections</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {sections.map((section) => (
            <li key={section.id} className="rounded-lg border border-white/15 p-2">
              {section.order}. {section.title}
            </li>
          ))}
        </ul>
      </aside>
      <div className="space-y-5">
        <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
          <h3 className="text-lg font-semibold">Current Question</h3>
          <p className="mt-3 text-sm text-zinc-300">Question ID: {activeQuestion.questionId}</p>
          <p className="mt-2 text-sm text-zinc-300">Legal Requirement: {activeQuestion.legalRequirement}</p>
          <p className="mt-2 text-sm text-zinc-400">Expected Implementation: {activeQuestion.expectedImplementation}</p>
        </article>
        <EvidenceUploadHint />
      </div>
    </section>
  );
}
