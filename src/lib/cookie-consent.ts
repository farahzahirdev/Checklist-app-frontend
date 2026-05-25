export const COOKIE_CONSENT_STORAGE_KEY = 'checklist_cookie_consent_v2';
export const COOKIE_CONSENT_COOKIE_NAME = 'checklist_cookie_consent_v2';
export const COOKIE_CONSENT_VERSION = '2';

export type CookieConsentPreferences = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type CookieConsentState = {
  version: string;
  accepted_at: string;
  preferences: CookieConsentPreferences;
};

function parseCookieString(cookieString: string, key: string): string | null {
  const parts = cookieString.split(';');
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey === key) {
      return rest.join('=');
    }
  }
  return null;
}

function readConsentFromCookie(): CookieConsentState | null {
  if (typeof document === 'undefined') return null;
  const raw = parseCookieString(document.cookie, COOKIE_CONSENT_COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<CookieConsentState>;
    if (parsed.version !== COOKIE_CONSENT_VERSION || !parsed.preferences) return null;
    return parsed as CookieConsentState;
  } catch {
    return null;
  }
}

function readConsentFromStorage(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (parsed.version !== COOKIE_CONSENT_VERSION || !parsed.preferences) return null;
    return parsed as CookieConsentState;
  } catch {
    return null;
  }
}

export function getCookieConsent(): CookieConsentState | null {
  return readConsentFromCookie() ?? readConsentFromStorage();
}

export function hasCookieConsent() {
  return Boolean(getCookieConsent());
}

export function saveCookieConsent(preferences: Omit<CookieConsentPreferences, 'necessary'>) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const state: CookieConsentState = {
    version: COOKIE_CONSENT_VERSION,
    accepted_at: new Date().toISOString(),
    preferences: {
      necessary: true,
      preferences: Boolean(preferences.preferences),
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
    },
  };

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));

  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(state))}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function acceptCookieConsent() {
  saveCookieConsent({
    preferences: true,
    analytics: true,
    marketing: true,
  });
}
