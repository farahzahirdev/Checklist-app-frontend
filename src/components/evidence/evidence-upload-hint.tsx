import { mockEvidence } from '@/lib/checklist-mocks';
import { EVIDENCE_ALLOWED_MIME_TYPES, EVIDENCE_MAX_FILE_SIZE_BYTES } from '@/lib/upload-rules';

export function EvidenceUploadHint() {
  // Frontend dev implementation guide:
  // 1) Use this block wherever question evidence upload is present.
  // 2) Validate mime type and file size before upload API call.
  // 3) Optional fields: note and evidence should not block question save.
  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-5">
      <h3 className="text-lg font-semibold">Evidence Upload Rules</h3>
      <p className="mt-2 text-sm text-zinc-300">
        Allowed formats: {EVIDENCE_ALLOWED_MIME_TYPES.join(', ')}. Max file size: {Math.floor(EVIDENCE_MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB.
      </p>
      <article className="mt-4 rounded-xl border border-white/15 p-3 text-sm">
        <p className="font-medium">Example Evidence</p>
        <p className="mt-1 text-zinc-300">File: {mockEvidence.fileName}</p>
        <p className="mt-1 text-zinc-400">{mockEvidence.exampleText}</p>
        <p className="mt-2 text-xs text-zinc-500">Example image URL: {mockEvidence.previewUrl}</p>
      </article>
    </section>
  );
}
