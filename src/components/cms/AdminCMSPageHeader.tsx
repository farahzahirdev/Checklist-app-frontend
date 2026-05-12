'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { translate, useLocale } from '@/lib/i18n';
import { adminCmsMessages } from '@/locales/admin-cms';
import {
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_SUBTITLE_CLASS,
  ADMIN_PAGE_HERO_TITLE_CLASS,
} from '@/app/(app)/admin/admin-page-title';

type AdminCMSPageHeaderVariant = 'edit' | 'create';

export function AdminCMSPageHeader({ variant, slug }: { variant: AdminCMSPageHeaderVariant; slug?: string }) {
  const { locale } = useLocale();
  const t = (key: string) => translate(adminCmsMessages, locale, key);

  return (
    <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
      <Link
        href="/admin/cms"
        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#b8cae7] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        {t('page.backToList')}
      </Link>
      <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>{t('list.heroEyebrow')}</p>
      <h1 className={ADMIN_PAGE_HERO_TITLE_CLASS}>{variant === 'edit' ? t('page.editTitle') : t('page.createTitle')}</h1>
      <p className={ADMIN_PAGE_HERO_SUBTITLE_CLASS}>
        {variant === 'edit' && slug ? (
          <>
            {t('page.slugLabel')}{' '}
            <span className="font-mono text-[#dce8ff]">{slug}</span>
          </>
        ) : (
          t('page.createSubtitle')
        )}
      </p>
    </header>
  );
}
