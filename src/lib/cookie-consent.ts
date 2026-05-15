export const COOKIE_CONSENT_STORAGE_KEY = 'checklist_cookie_consent_v1';
export const COOKIE_CONSENT_VERSION = '1';

export type CookieConsentState = {
  version: string;
  accepted_at: string;
};

export function hasCookieConsent() {
  if (typeof window === 'undefined') {
    return false;
  }

  const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    return parsed.version === COOKIE_CONSENT_VERSION;
  } catch {
    return false;
  }
}

export function acceptCookieConsent() {
  if (typeof window === 'undefined') {
    return;
  }

  const state: CookieConsentState = {
    version: COOKIE_CONSENT_VERSION,
    accepted_at: new Date().toISOString(),
  };
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));
}
