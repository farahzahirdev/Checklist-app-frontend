'use client';

import { translate, useLocale } from '@/lib/i18n';
import { legalPagesMessages } from '@/locales/legal-pages';

export default function PrivacyPolicyPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(legalPagesMessages, locale, key);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-[#1a2440]">
      <h1 className="text-3xl font-semibold">{t('privacy.title')}</h1>
      <p className="mt-3 text-base text-[#4c5f80]">{t('privacy.body')}</p>
    </main>
  );
}