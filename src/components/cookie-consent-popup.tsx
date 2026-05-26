'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  getCookieConsent,
  saveCookieConsent,
  type CookieConsentPreferences,
} from '@/lib/cookie-consent';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';
import { useLocale } from '@/lib/i18n';

type OptionalConsent = Omit<CookieConsentPreferences, 'necessary'>;

const itemClass = 'rounded-xl border border-[#dbe4f4] bg-[#f8fbff] px-3 py-2.5';

const consentCheckboxClass =
  'h-4 w-4 shrink-0 cursor-pointer rounded border border-[#9db2d6] bg-white text-[#2563eb] accent-[#2563eb] [color-scheme:light] focus:ring-2 focus:ring-[#2563eb]/30 focus:ring-offset-0';

const consentCheckboxLockedClass =
  'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#9db2d6] bg-white';

function ConsentCheckbox({
  checked,
  disabled,
  onChange,
  id,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  id?: string;
}) {
  if (disabled) {
    return (
      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled
          readOnly
          tabIndex={-1}
          aria-disabled="true"
          className="sr-only"
        />
        <span className={consentCheckboxLockedClass} aria-hidden="true">
          {checked ? (
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-[#2563eb]" fill="none">
              <path
                d="M3.5 8.2 6.4 11 12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </span>
    );
  }

  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      className={consentCheckboxClass}
    />
  );
}

const popupCopy = {
  en: {
    title: 'Cookie preferences',
    subtitle:
      'Choose how we can use cookies and browser storage on this device. Necessary cookies are always enabled.',
    language: 'Language',
    allowed: 'Allowed',
    blocked: 'Blocked',
    categoryNecessary: 'Necessary cookies',
    categoryNecessaryDesc: 'Required for security, authentication, and core app behavior.',
    categoryPreferences: 'Preference cookies',
    categoryPreferencesDesc: 'Remember language and interface choices.',
    categoryAnalytics: 'Analytics cookies',
    categoryAnalyticsDesc: 'Help us measure usage and improve performance.',
    categoryMarketing: 'Marketing cookies',
    categoryMarketingDesc: 'Measure campaign effectiveness and communication relevance.',
    inventoryTitle: 'Cookie and storage inventory',
    inventoryNote: 'This list reflects cookies and related browser storage used by the app.',
    inventoryName: 'Name',
    inventoryType: 'Type',
    inventoryCategory: 'Category',
    inventoryPurpose: 'Purpose',
    inventoryDuration: 'Duration',
    allEnabled: 'All optional categories are enabled.',
    partiallyBlocked: 'Optional categories are partially or fully blocked.',
    saveSelected: 'Save selected',
    allowAll: 'Allow all',
    rejectOptional: 'Reject optional',
    policyPrefix: 'Details:',
    policyLink: 'Cookie Policy',
  },
  cs: {
    title: 'Nastavení cookies',
    subtitle:
      'Vyberte, jak můžeme používat cookies a úložiště prohlížeče na tomto zařízení. Nezbytné cookies jsou vždy zapnuté.',
    language: 'Jazyk',
    allowed: 'Povoleno',
    blocked: 'Blokováno',
    categoryNecessary: 'Nezbytné cookies',
    categoryNecessaryDesc: 'Nutné pro zabezpečení, přihlášení a základní fungování aplikace.',
    categoryPreferences: 'Preferenční cookies',
    categoryPreferencesDesc: 'Pamatují si jazyk a volby rozhraní.',
    categoryAnalytics: 'Analytické cookies',
    categoryAnalyticsDesc: 'Pomáhají měřit používání a zlepšovat výkon.',
    categoryMarketing: 'Marketingové cookies',
    categoryMarketingDesc: 'Měří účinnost kampaní a relevanci komunikace.',
    inventoryTitle: 'Přehled cookies a úložišť',
    inventoryNote: 'Seznam odpovídá cookies a souvisejícím uloženým datům používaným aplikací.',
    inventoryName: 'Název',
    inventoryType: 'Typ',
    inventoryCategory: 'Kategorie',
    inventoryPurpose: 'Účel',
    inventoryDuration: 'Doba uložení',
    allEnabled: 'Všechny volitelné kategorie jsou povoleny.',
    partiallyBlocked: 'Volitelné kategorie jsou částečně nebo plně blokovány.',
    saveSelected: 'Uložit vybrané',
    allowAll: 'Povolit vše',
    rejectOptional: 'Odmítnout volitelné',
    policyPrefix: 'Detail:',
    policyLink: 'Zásady cookies',
  },
} as const;

const inventoryRows = {
  en: [
    ['auditready_consent', 'Cookie', 'Necessary', 'Stores the selected consent preferences.', '365 days'],
    ['checklist_access_token', 'Local storage', 'Necessary', 'Keeps authenticated session in the browser.', 'Until logout/clear'],
    ['checklist_original_access_token', 'Local storage', 'Necessary', 'Stores original token during role switch.', 'Until role switch ends'],
    ['checklist_role_switch_active', 'Local storage', 'Necessary', 'Indicates active admin role switching.', 'Until role switch ends'],
    ['checklist_locale', 'Local storage', 'Preferences', 'Stores selected interface language (CS/EN).', 'Until changed/clear'],
    ['user_language_preference', 'Cookie', 'Preferences', 'Persists language preference when allowed.', '365 days'],
    ['checklist_cookie_consent_v2', 'Legacy cookie/storage', 'Necessary', 'Backward-compatible consent storage key.', 'Legacy/read-only'],
  ],
  cs: [
    ['auditready_consent', 'Cookie', 'Nezbytné', 'Ukládá zvolené preference souhlasu.', '365 dní'],
    ['checklist_access_token', 'Local storage', 'Nezbytné', 'Udržuje přihlášenou relaci v prohlížeči.', 'Do odhlášení/smazání'],
    ['checklist_original_access_token', 'Local storage', 'Nezbytné', 'Ukládá původní token při přepnutí role.', 'Do konce přepnutí role'],
    ['checklist_role_switch_active', 'Local storage', 'Nezbytné', 'Určuje aktivní přepnutí admin role.', 'Do konce přepnutí role'],
    ['checklist_locale', 'Local storage', 'Preferenční', 'Ukládá zvolený jazyk rozhraní (CS/EN).', 'Do změny/smazání'],
    ['user_language_preference', 'Cookie', 'Preferenční', 'Ukládá jazykovou preferenci při povolení.', '365 dní'],
    ['checklist_cookie_consent_v2', 'Legacy cookie/storage', 'Nezbytné', 'Zpětně kompatibilní klíč pro souhlas.', 'Legacy/pouze čtení'],
  ],
} as const;

function ConsentToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
  stateLabel,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  stateLabel: {
    allowed: string;
    blocked: string;
  };
}) {
  return (
    <div className={itemClass}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#1f2d45]">{label}</p>
          <p className="mt-1 text-[12px] leading-5 text-[#607594]">{description}</p>
        </div>
        <label
          className={`inline-flex shrink-0 items-center gap-2 text-[12px] text-[#4a5f7d] ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <ConsentCheckbox checked={checked} disabled={disabled} onChange={onChange} />
          {checked ? stateLabel.allowed : stateLabel.blocked}
        </label>
      </div>
    </div>
  );
}

export function CookieConsentPopup() {
  const { locale, setLocale } = useLocale();
  const copy = popupCopy[locale] ?? popupCopy.en;
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<OptionalConsent>({
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (token) {
      setOpen(false);
      return;
    }

    const existing = getCookieConsent();
    if (existing) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, []);

  const allOptionalAllowed = useMemo(
    () => prefs.preferences && prefs.analytics && prefs.marketing,
    [prefs],
  );

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function allowAll() {
    const next: OptionalConsent = {
      preferences: true,
      analytics: true,
      marketing: true,
    };
    saveCookieConsent(next);
    setOpen(false);
  }

  function rejectOptional() {
    const next: OptionalConsent = {
      preferences: false,
      analytics: false,
      marketing: false,
    };
    saveCookieConsent(next);
    setOpen(false);
  }

  function saveSelected() {
    saveCookieConsent(prefs);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#0d1d3a]/50 backdrop-blur-[1px]" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Cookie settings"
        className="relative z-10 flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#dbe4f4] bg-white shadow-[0_22px_60px_rgba(15,32,62,0.25)]"
      >
        <div className="border-b border-[#e5ecf8] px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[17px] font-bold tracking-tight text-[#1f2d45]">{copy.title}</p>
              <p className="mt-1 text-[13px] leading-5 text-[#607594]">{copy.subtitle}</p>
            </div>
            <div className="inline-flex items-center rounded-lg border border-[#d4dced] bg-[#f7f9fe] p-1">
              <span className="px-2 text-[11px] font-semibold text-[#607594]">{copy.language}</span>
              <button
                type="button"
                onClick={() => setLocale('cs')}
                aria-pressed={locale === 'cs'}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${locale === 'cs' ? 'bg-[#1f2d45] text-white' : 'text-[#4c607d] hover:bg-[#eaf0fb]'}`}
              >
                CS
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                aria-pressed={locale === 'en'}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${locale === 'en' ? 'bg-[#1f2d45] text-white' : 'text-[#4c607d] hover:bg-[#eaf0fb]'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="space-y-2">
            <ConsentToggle
              label={copy.categoryNecessary}
              description={copy.categoryNecessaryDesc}
              checked
              disabled
              stateLabel={{ allowed: copy.allowed, blocked: copy.blocked }}
            />
            <ConsentToggle
              label={copy.categoryPreferences}
              description={copy.categoryPreferencesDesc}
              checked={prefs.preferences}
              onChange={(next) => setPrefs((prev) => ({ ...prev, preferences: next }))}
              stateLabel={{ allowed: copy.allowed, blocked: copy.blocked }}
            />
            <ConsentToggle
              label={copy.categoryAnalytics}
              description={copy.categoryAnalyticsDesc}
              checked={prefs.analytics}
              onChange={(next) => setPrefs((prev) => ({ ...prev, analytics: next }))}
              stateLabel={{ allowed: copy.allowed, blocked: copy.blocked }}
            />
            <ConsentToggle
              label={copy.categoryMarketing}
              description={copy.categoryMarketingDesc}
              checked={prefs.marketing}
              onChange={(next) => setPrefs((prev) => ({ ...prev, marketing: next }))}
              stateLabel={{ allowed: copy.allowed, blocked: copy.blocked }}
            />
          </div>

          <div className="rounded-xl border border-[#dbe4f4] bg-[#f9fbff] p-3">
            <p className="text-sm font-semibold text-[#1f2d45]">{copy.inventoryTitle}</p>
            <p className="mt-1 text-xs text-[#607594]">{copy.inventoryNote}</p>

            <div className="mt-3 max-h-56 overflow-auto rounded-lg border border-[#dbe4f4] bg-white">
              <table className="min-w-full text-left text-xs text-[#354a69]">
                <thead className="sticky top-0 bg-[#f1f5fc] text-[#20314f]">
                  <tr>
                    <th className="px-3 py-2 font-semibold">{copy.inventoryName}</th>
                    <th className="px-3 py-2 font-semibold">{copy.inventoryType}</th>
                    <th className="px-3 py-2 font-semibold">{copy.inventoryCategory}</th>
                    <th className="px-3 py-2 font-semibold">{copy.inventoryPurpose}</th>
                    <th className="px-3 py-2 font-semibold">{copy.inventoryDuration}</th>
                  </tr>
                </thead>
                <tbody>
                  {(inventoryRows[locale] ?? inventoryRows.en).map((row) => (
                    <tr key={row[0]} className="border-t border-[#edf2fa] align-top">
                      <td className="px-3 py-2 font-mono text-[11px] text-[#1f2d45]">{row[0]}</td>
                      <td className="px-3 py-2">{row[1]}</td>
                      <td className="px-3 py-2">{row[2]}</td>
                      <td className="px-3 py-2">{row[3]}</td>
                      <td className="px-3 py-2">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-[#607594]">
            {copy.policyPrefix}{' '}
            <Link href="/cookies" className="font-semibold text-[#2f4f83] underline underline-offset-2 hover:text-[#1d355c]">
              {copy.policyLink}
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#e5ecf8] bg-[#fbfcff] px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={saveSelected}
            className="rounded-lg border border-[#cdd9ee] bg-white px-3 py-2 text-xs font-semibold text-[#2a3d5f] hover:bg-[#f2f6fd]"
          >
            {copy.saveSelected}
          </button>
          <button
            type="button"
            onClick={allowAll}
            className="rounded-lg border border-[#2d4f83] bg-[#1f2d45] px-3 py-2 text-xs font-semibold text-white hover:bg-[#253a5e]"
          >
            {copy.allowAll}
          </button>
          <button
            type="button"
            onClick={rejectOptional}
            className="rounded-lg border border-[#cdd9ee] bg-transparent px-3 py-2 text-xs font-semibold text-[#4c607d] hover:bg-[#eef3fb]"
          >
            {copy.rejectOptional}
          </button>
          <span className="ml-auto text-[11px] text-[#607594]">
            {allOptionalAllowed ? copy.allEnabled : copy.partiallyBlocked}
          </span>
        </div>
      </section>
    </div>
  );
}
