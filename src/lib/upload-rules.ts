export const EVIDENCE_ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;
export const EVIDENCE_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB - must match backend limit
export const EVIDENCE_MAX_FILE_SIZE_MB = EVIDENCE_MAX_FILE_SIZE_BYTES / (1024 * 1024);

export function isAllowedEvidenceMimeType(mimeType: string): boolean {
  return EVIDENCE_ALLOWED_MIME_TYPES.includes(mimeType as (typeof EVIDENCE_ALLOWED_MIME_TYPES)[number]);
}

export function isAllowedEvidenceFileSize(fileSize: number): boolean {
  return fileSize <= EVIDENCE_MAX_FILE_SIZE_BYTES;
}

export function getEvidenceFileSizeErrorMessage(fileSize: number): string | null {
  if (fileSize > EVIDENCE_MAX_FILE_SIZE_BYTES) {
    const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    return `File size (${sizeMB}MB) exceeds maximum allowed size of ${EVIDENCE_MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
}
