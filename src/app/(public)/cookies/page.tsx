'use client';

import { translate, useLocale } from '@/lib/i18n';
import { legalPagesMessages } from '@/locales/legal-pages';
import { useCMSPage } from '@/hooks/useCMSPage';
import { PageRenderer } from '@/components/cms/PageRenderer';

function CookiesPageContent() {
  const { locale } = useLocale();
  const t = (key: string) => translate(legalPagesMessages, locale, key);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-[#1a2440]">
      <h1 className="text-3xl font-semibold">{t('cookies.title')}</h1>
      <p className="mt-3 text-base text-[#4c5f80]">{t('cookies.body')}</p>
    </main>
  );
}

// CMS Integration Wrapper: Renders CMS page for "cookies" slug if available, otherwise shows hardcoded content
function CookiesPageWithCMS() {
  const { page, loading } = useCMSPage('cookies');
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f5fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d6e2f7] border-t-[#2f7dff]" />
      </div>
    );
  }

  // PageRenderer handles both CMS page and fallback content
  return <PageRenderer page={page} fallback={<CookiesPageContent />} />;
}

export default CookiesPageWithCMS;