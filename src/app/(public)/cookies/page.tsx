'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useLocale } from '@/lib/i18n';
import { PublicFooter } from '@/components/public-footer';
import { useCMSPage } from '@/hooks/useCMSPage';
import { PageRenderer } from '@/components/cms/PageRenderer';
import { ACCESS_TOKEN_STORAGE_KEY, getCurrentUser, getRoleHomePath } from '@/lib/auth';
import { acceptCookieConsent, hasCookieConsent } from '@/lib/cookie-consent';
import { getCustomerPostLoginDestination } from '@/lib/customer-post-login';
import {
  cookiesContent,
  type CookiesBlock,
  type CookiesSection,
} from '@/locales/cookies-content';

function renderBlocks(blocks: CookiesBlock[], depth = 0) {
  return blocks.map((block, index) => {
    if (block.type === 'p') {
      return (
        <p
          key={`p-${depth}-${index}`}
          className="mt-3 text-[15px] leading-7 text-black"
        >
          {block.text}
        </p>
      );
    }
    if (block.type === 'list') {
      return (
        <ul
          key={`ul-${depth}-${index}`}
          className="mt-3 list-disc space-y-1.5 pl-6 text-[15px] leading-7 text-black marker:text-black"
        >
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    if (block.type === 'table') {
      return (
        <div
          key={`table-${depth}-${index}`}
          className="mt-4 overflow-x-auto rounded-xl border border-black/10"
        >
          <table className="min-w-full divide-y divide-black/10 text-left text-[14px] leading-6 text-black">
            <thead className="bg-black/5">
              <tr>
                {block.headers.map((header, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-3 py-2 font-semibold text-black"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {block.rows.map((row, ri) => (
                <tr key={ri} className="align-top">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-black">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.footnote ? (
            <p className="border-t border-black/10 bg-black/[0.02] px-3 py-2 text-[13px] leading-6 text-black">
              {block.footnote}
            </p>
          ) : null}
        </div>
      );
    }
    return (
      <section key={`sub-${depth}-${index}`} className="mt-6">
        <h3 className="text-lg font-semibold text-black">
          <span className="mr-2 text-black">{block.number}</span>
          {block.title}
        </h3>
        <div className="mt-1">{renderBlocks(block.blocks, depth + 1)}</div>
      </section>
    );
  });
}

function renderSection(section: CookiesSection) {
  return (
    <section key={section.number} className="mt-10">
      <h2 className="text-2xl font-semibold text-black">
        <span className="mr-2 text-black">{section.number}.</span>
        {section.title}
      </h2>
      <div className="mt-2">{renderBlocks(section.blocks)}</div>
    </section>
  );
}

function CookiesPageContent({ footerSlot }: { footerSlot?: React.ReactNode }) {
  const { locale } = useLocale();
  const content = cookiesContent[locale] ?? cookiesContent.en;

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="border-b border-black/10 pb-6">
          <h1 className="text-3xl font-semibold leading-tight text-black sm:text-4xl">
            {content.title}
          </h1>
          {content.intro?.map((paragraph, i) => (
            <p
              key={i}
              className="mt-3 text-[15px] leading-7 text-black"
            >
              {paragraph.text}
            </p>
          ))}
        </header>

        {content.sections.map(renderSection)}

        {content.contactBlock ? (
          <aside className="mt-8 rounded-2xl border border-black/10 bg-white p-5 text-[15px] leading-7 text-black">
            <p className="font-semibold text-black">{content.contactBlock.title}</p>
            <div className="mt-2 space-y-1">
              {content.contactBlock.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </aside>
        ) : null}

        {footerSlot}
      </main>
      <PublicFooter />
    </div>
  );
}

function CookieConsentAction() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [consentReady, setConsentReady] = useState(false);
  const returnTo = searchParams.get('returnTo') ?? '';
  const postLogin = searchParams.get('postLogin') === '1';

  useEffect(() => {
    setConsentReady(hasCookieConsent());
  }, []);

  async function continueAfterConsent() {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) : null;
    if (!token) {
      if (returnTo && returnTo.startsWith('/')) {
        router.replace(returnTo as Route);
      }
      router.refresh();
      return;
    }

    try {
      const me = await getCurrentUser();
      if (postLogin) {
        const destination = await getCustomerPostLoginDestination(me.user.id);
        router.replace(destination as Route);
        router.refresh();
        return;
      }

      if (returnTo && returnTo.startsWith('/')) {
        router.replace(returnTo as Route);
        router.refresh();
        return;
      }

      router.replace(getRoleHomePath(me.user.role) as Route);
      router.refresh();
    } catch {
      if (returnTo && returnTo.startsWith('/')) {
        router.replace(returnTo as Route);
        router.refresh();
      } else {
        router.refresh();
      }
    }
  }

  async function handleAccept() {
    setSubmitting(true);
    try {
      acceptCookieConsent();
      setConsentReady(true);
      toast.success('Cookie consent saved.');
      await continueAfterConsent();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-black/10 bg-[#0d1d3a] px-5 py-4 text-white shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Cookie consent</p>
          <p className="text-sm text-white/75">
            {consentReady
              ? 'Consent is already saved for this browser/device.'
              : 'Please read the policy and accept to continue.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleAccept()}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-[#0d1d3a] transition-colors hover:bg-[#edf4ff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : consentReady ? 'Continue' : 'Accept and continue'}
        </button>
      </div>
    </section>
  );
}

function CookiesPageWithCMS() {
  const { page, loading } = useCMSPage('cookies');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f5fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d6e2f7] border-t-[#2f7dff]" />
      </div>
    );
  }

  const footerSlot = (
    <div className="px-4 pb-10 sm:px-6 lg:px-8">
      <CookieConsentAction />
    </div>
  );

  return (
    <PageRenderer
      page={page}
      fallback={(slot) => <CookiesPageContent footerSlot={slot} />}
      footerSlot={footerSlot}
    />
  );
}

export default CookiesPageWithCMS;
