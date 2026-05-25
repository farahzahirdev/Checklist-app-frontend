'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  getCookieConsent,
  saveCookieConsent,
  type CookieConsentPreferences,
} from '@/lib/cookie-consent';

type OptionalConsent = Omit<CookieConsentPreferences, 'necessary'>;

const panelClass =
  'fixed inset-x-4 bottom-4 z-[120] mx-auto max-w-3xl rounded-2xl border border-[#153566] bg-[linear-gradient(160deg,#071733_0%,#0b2448_55%,#113463_100%)] p-4 text-white shadow-[0_18px_50px_rgba(3,11,24,0.55)] sm:inset-x-6 sm:p-5';

const itemClass =
  'rounded-xl border border-[#2b4f86] bg-[#0f2750]/70 px-3 py-2.5';

function ConsentToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <div className={itemClass}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-white">{label}</p>
          <p className="mt-1 text-[12px] leading-5 text-[#c8d9f5]">{description}</p>
        </div>
        <label className="inline-flex shrink-0 items-center gap-2 text-[12px] text-[#d7e5ff]">
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.checked)}
            className="h-4 w-4 accent-[#58a6ff]"
          />
          {checked ? 'Allowed' : 'Blocked'}
        </label>
      </div>
    </div>
  );
}

export function CookieConsentPopup() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<OptionalConsent>({
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
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
    <section className={panelClass} role="dialog" aria-modal="true" aria-label="Cookie settings">
      <div className="space-y-3">
        <div>
          <p className="text-[15px] font-bold tracking-tight">Cookie preferences</p>
          <p className="mt-1 text-[12px] leading-5 text-[#c8d9f5]">
            First visit on this browser: review each cookie category and allow them one by one.
            Your selection is stored in this browser.
          </p>
        </div>

        <div className="space-y-2">
          <ConsentToggle
            label="Necessary cookies"
            description="Required for core security, login state, and basic app functionality. Always enabled."
            checked
            disabled
          />
          <ConsentToggle
            label="Preference cookies"
            description="Remember language and interface choices to improve your experience."
            checked={prefs.preferences}
            onChange={(next) => setPrefs((prev) => ({ ...prev, preferences: next }))}
          />
          <ConsentToggle
            label="Analytics cookies"
            description="Help us understand product usage and improve performance."
            checked={prefs.analytics}
            onChange={(next) => setPrefs((prev) => ({ ...prev, analytics: next }))}
          />
          <ConsentToggle
            label="Marketing cookies"
            description="Measure campaign effectiveness and tailor external communication."
            checked={prefs.marketing}
            onChange={(next) => setPrefs((prev) => ({ ...prev, marketing: next }))}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={saveSelected}
            className="rounded-lg border border-[#79b6ff]/35 bg-white px-3 py-2 text-[12px] font-semibold text-[#0b2448] hover:bg-[#e9f3ff]"
          >
            Save selected
          </button>
          <button
            type="button"
            onClick={allowAll}
            className="rounded-lg border border-[#295b9c] bg-[#1c3f72] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#265493]"
          >
            Allow all
          </button>
          <button
            type="button"
            onClick={rejectOptional}
            className="rounded-lg border border-[#3b567d] bg-transparent px-3 py-2 text-[12px] font-semibold text-[#d7e5ff] hover:bg-[#12315a]"
          >
            Reject optional
          </button>
          <span className="ml-auto text-[11px] text-[#b8cdee]">
            {allOptionalAllowed ? 'All optional categories are enabled.' : 'Optional categories are partially or fully blocked.'}
          </span>
        </div>

        <p className="text-[11px] text-[#a9c3e6]">
          Details: <Link href="/cookies" className="underline decoration-[#a9c3e6]/70 underline-offset-2 hover:text-white">Cookie Policy</Link>
        </p>
      </div>
    </section>
  );
}
