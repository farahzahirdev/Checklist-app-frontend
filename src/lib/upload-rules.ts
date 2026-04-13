export const EVIDENCE_ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;
export const EVIDENCE_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export function isAllowedEvidenceMimeType(mimeType: string): boolean {
  return EVIDENCE_ALLOWED_MIME_TYPES.includes(mimeType as (typeof EVIDENCE_ALLOWED_MIME_TYPES)[number]);
}

export function isAllowedEvidenceFileSize(fileSize: number): boolean {
  return fileSize <= EVIDENCE_MAX_FILE_SIZE_BYTES;
}
