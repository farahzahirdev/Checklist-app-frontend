export const PUBLIC_CONTACT_EMAIL = 'info@auditready.cz';

export const PUBLIC_CONTACT_MAILTO = `mailto:${PUBLIC_CONTACT_EMAIL}`;

const LEGACY_PUBLIC_CONTACT_EMAILS = new Set(['info@checklistkb.com']);

/** Normalize public-facing contact email; maps retired addresses to the current one. */
export function resolvePublicContactEmail(email?: string | null): string {
  if (!email?.trim()) {
    return PUBLIC_CONTACT_EMAIL;
  }
  const normalized = email.trim().toLowerCase();
  if (LEGACY_PUBLIC_CONTACT_EMAILS.has(normalized)) {
    return PUBLIC_CONTACT_EMAIL;
  }
  return email.trim();
}
