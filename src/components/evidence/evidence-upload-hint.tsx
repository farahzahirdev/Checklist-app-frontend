import { mockEvidence } from '@/lib/checklist-mocks';
import { EVIDENCE_ALLOWED_MIME_TYPES, EVIDENCE_MAX_FILE_SIZE_MB } from '@/lib/upload-rules';

export function EvidenceUploadHint() {
  // Frontend dev implementation guide:
  // 1) Use this block wherever question evidence upload is present.
  // 2) Validate mime type and file size before upload API call.
  // 3) Optional fields: note and evidence should not block question save.
  return (
    <section className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#243555]">Evidence Upload Rules</h3>
      <p className="mt-2 text-sm text-[#4f6281]">
        Allowed formats: {EVIDENCE_ALLOWED_MIME_TYPES.join(', ')}. Max file size: {EVIDENCE_MAX_FILE_SIZE_MB}MB.
      </p>
      <article className="mt-4 rounded-xl border border-[#e2e8f5] bg-[#f7f9fe] p-3 text-sm">
        <p className="font-medium text-[#243555]">Example Evidence</p>
        <p className="mt-1 text-[#4f6281]">File: {mockEvidence.fileName}</p>
        <p className="mt-1 text-[#607594]">{mockEvidence.exampleText}</p>
        <p className="mt-2 text-xs text-[#7b8fac]">Example image URL: {mockEvidence.previewUrl}</p>
      </article>
    </section>
  );
}
