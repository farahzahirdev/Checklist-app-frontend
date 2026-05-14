'use client';

import { ADMIN_PAGE_TITLE_CLASS } from '@/app/(app)/admin/admin-page-title';
import { translate, useLocale } from '@/lib/i18n';
import { adminSettingsMessages } from '@/locales/admin-settings';

const securityItems = ['security.mfa', 'security.password', 'security.lockout', 'security.auditExport'] as const;

export default function AdminSettingsPage() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminSettingsMessages, locale, key, values);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">{t('hero.eyebrow')}</p>
        <h1 className={`mt-2 ${ADMIN_PAGE_TITLE_CLASS}`}>{t('hero.title')}</h1>
        <p className="mt-1 text-sm text-[#607594]">{t('hero.subtitle')}</p>
      </header>

      <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">{t('general.title')}</h2>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-[#566b8d]">{t('field.orgName')}</span>
              <input
                type="text"
                defaultValue="Checklist KB"
                className="mt-1 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#566b8d]">{t('field.assessmentWindow')}</span>
              <input
                type="number"
                defaultValue={7}
                className="mt-1 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#566b8d]">{t('field.retention')}</span>
              <input
                type="number"
                defaultValue={48}
                className="mt-1 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              />
            </label>
            <button
              type="button"
              className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]"
            >
              {t('actions.save')}
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">{t('security.title')}</h2>
          <div className="mt-4 space-y-3 text-sm text-[#4f6487]">
            {securityItems.map((itemKey) => (
              <label
                key={itemKey}
                className="flex items-center justify-between rounded-xl border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2"
              >
                <span>{t(itemKey)}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#3f74df]" />
              </label>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
