// Tracks a "checkout intent": the checklist a visitor selected on the public
// /products page before going through registration or login. The id is
// persisted to localStorage so it survives the (possibly multi-step) auth
// flow, and is consumed by /payment to preselect the right checklist and by
// /payment/success to grant access after Stripe redirects back.

export const CHECKOUT_CHECKLIST_ID_STORAGE_KEY = 'checklist_checkout_selected_id';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidChecklistId(value: string | null | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && UUID_RE.test(trimmed);
}

export function setCheckoutIntent(checklistId: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  if (!isValidChecklistId(checklistId)) return;
  try {
    window.localStorage.setItem(CHECKOUT_CHECKLIST_ID_STORAGE_KEY, checklistId.trim());
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

export function getCheckoutIntent(): string {
  if (typeof window === 'undefined') return '';
  try {
    const value = window.localStorage.getItem(CHECKOUT_CHECKLIST_ID_STORAGE_KEY);
    return isValidChecklistId(value) ? value.trim() : '';
  } catch {
    return '';
  }
}

export function clearCheckoutIntent(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CHECKOUT_CHECKLIST_ID_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Builds a "/payment" URL, appending the checklist_id query param if the
 * supplied value (or, falling back, the stored intent) is a valid id.
 */
export function buildPaymentHref(checklistId?: string | null): string {
  const candidate = isValidChecklistId(checklistId) ? checklistId!.trim() : getCheckoutIntent();
  if (!candidate) return '/payment';
  return `/payment?checklist_id=${encodeURIComponent(candidate)}`;
}

/**
 * Appends an existing `checklist_id` query param (if any) to a destination
 * URL like "/register" or "/login". Used by the auth pages to preserve
 * the intent on the "have an account?" / "create account" cross-links.
 */
export function appendChecklistIdParam(baseHref: string, checklistId?: string | null): string {
  if (!isValidChecklistId(checklistId)) return baseHref;
  const separator = baseHref.includes('?') ? '&' : '?';
  return `${baseHref}${separator}checklist_id=${encodeURIComponent(checklistId!.trim())}`;
}
