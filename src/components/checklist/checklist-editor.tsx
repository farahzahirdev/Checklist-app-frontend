import type { Checklist } from '@/lib/checklist-types';

interface ChecklistEditorProps {
  checklist: Checklist;
}

export function ChecklistEditor({ checklist }: ChecklistEditorProps) {
  // Frontend dev implementation guide:
  // 1) Bind this form to react-hook-form or zod-based schema validation.
  // 2) Persist via createChecklist/updateChecklist from checklist-api.ts.
  // 3) Add save-as-draft and publish actions with confirmation modal.
  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-5">
      <h2 className="text-xl font-semibold">Checklist Metadata</h2>
      <p className="mt-2 text-sm text-zinc-300">Title, law/decree reference, version, and publication status.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-white/15 p-3 text-sm">Title: {checklist.title}</div>
        <div className="rounded-lg border border-white/15 p-3 text-sm">Law/Decree: {checklist.lawDecree}</div>
        <div className="rounded-lg border border-white/15 p-3 text-sm">Audit Type: {checklist.auditType}</div>
        <div className="rounded-lg border border-white/15 p-3 text-sm">Status: {checklist.status}</div>
      </div>
    </section>
  );
}
