import type { ChecklistSection } from '@/lib/checklist-types';

interface SectionEditorProps {
  sections: ChecklistSection[];
}

export function SectionEditor({ sections }: SectionEditorProps) {
  // Frontend dev implementation guide:
  // 1) Replace static rendering with drag-and-drop ordering.
  // 2) Persist ordering and edits through section CRUD endpoints.
  // 3) Add duplicate-title validation within checklist scope.
  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-5">
      <h2 className="text-xl font-semibold">Sections</h2>
      <p className="mt-2 text-sm text-zinc-300">Each checklist contains multiple ordered sections.</p>
      <ul className="mt-4 space-y-2">
        {sections.map((section) => (
          <li key={section.id} className="rounded-lg border border-white/15 p-3 text-sm">
            {section.order}. {section.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
