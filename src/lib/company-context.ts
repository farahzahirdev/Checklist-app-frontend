export const ACTIVE_COMPANY_STORAGE_KEY = 'checklist_active_company_id';

export function getActiveCompanyId() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY) ?? '';
}

export function setActiveCompanyId(companyId: string | null | undefined) {
  if (typeof window === 'undefined') return;
  const value = companyId?.trim() ?? '';
  if (value) {
    window.localStorage.setItem(ACTIVE_COMPANY_STORAGE_KEY, value);
  } else {
    window.localStorage.removeItem(ACTIVE_COMPANY_STORAGE_KEY);
  }
}

export function ensureActiveCompanyId(preferredCompanyId?: string | null) {
  if (typeof window === 'undefined') return preferredCompanyId?.trim() ?? '';
  const stored = window.localStorage.getItem(ACTIVE_COMPANY_STORAGE_KEY)?.trim() ?? '';
  if (stored) return stored;
  const preferred = preferredCompanyId?.trim() ?? '';
  if (preferred) {
    window.localStorage.setItem(ACTIVE_COMPANY_STORAGE_KEY, preferred);
    return preferred;
  }
  return '';
}

export function getCompanyQuerySuffix(companyId?: string | null) {
  const value = companyId?.trim() ?? '';
  return value ? `company_id=${encodeURIComponent(value)}` : '';
}
