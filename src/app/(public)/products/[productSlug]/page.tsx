'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicFooter } from '@/components/public-footer';
import { AuditIcon, AUDIT_ICON_THEMES, pickAuditIconKind } from '@/components/products/audit-icon';
import { translate, useLocale } from '@/lib/i18n';
import { productsMessages } from '@/locales/products';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';
import { getCurrentUser, getRoleKey } from '@/lib/auth';
import { buildPaymentHref, setCheckoutIntent } from '@/lib/checkout-intent';
import {
  findBuilderProductBySlug,
  findDocumentationProductBySlug,
  isLikelyChecklistId,
  type BuilderProduct,
  type DocumentationProduct,
  type ResolvedProduct,
} from '@/lib/products-catalog';

function formatChecklistPrice(
  pricing: CustomerChecklist['pricing'],
  locale: string,
  freeLabel: string,
): string {
  if (!pricing || !pricing.amount_cents) return freeLabel;
  const amount = pricing.amount_cents / 100;
  const currency = (pricing.currency || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

type AuthState = { kind: 'unknown' } | { kind: 'guest' } | { kind: 'customer' } | { kind: 'staff' };

export default function ProductDetailPage() {
  const params = useParams<{ productSlug: string }>();
  const slug = (params?.productSlug ?? '').trim();
  const router = useRouter();
  const { locale } = useLocale();
  const t = (key: string, vars?: Record<string, string>) =>
    translate(productsMessages, locale, key, vars);

  const [resolved, setResolved] = useState<ResolvedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({ kind: 'unknown' });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setResolved(null);

    async function resolveProduct() {
      const builder = findBuilderProductBySlug(slug);
      if (builder) {
        if (!cancelled) {
          setResolved({ kind: 'builder', status: builder.status, builder });
          setLoading(false);
        }
        return;
      }

      const documentation = findDocumentationProductBySlug(slug);
      if (documentation) {
        if (!cancelled) {
          setResolved({ kind: 'documentation', status: documentation.status, documentation });
          setLoading(false);
        }
        return;
      }

      if (isLikelyChecklistId(slug)) {
        try {
          const list = await listPublishedCustomerChecklists({
            sortBy: 'updated_at',
            sortOrder: 'desc',
            limit: 200,
          });
          if (cancelled) return;
          const match = list.find((item) => item.id === slug && item.status === 'published');
          if (match) {
            setResolved({ kind: 'audit', status: 'available', checklist: match });
            setLoading(false);
            return;
          }
        } catch {
          // fall through to not found
        }
      }

      if (!cancelled) {
        setNotFound(true);
        setLoading(false);
      }
    }

    void resolveProduct();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getCurrentUser();
        if (cancelled) return;
        const role = getRoleKey(me.user.role);
        setAuthState({ kind: role === 'customer' ? 'customer' : 'staff' });
      } catch {
        if (!cancelled) setAuthState({ kind: 'guest' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const audit = resolved?.kind === 'audit' ? resolved.checklist : null;
  const auditIconKind = useMemo(
    () => (audit ? pickAuditIconKind(audit.checklist_type?.code, 0) : 'shield'),
    [audit],
  );
  const auditIconTheme = AUDIT_ICON_THEMES[auditIconKind];

  const docProduct: DocumentationProduct | null =
    resolved?.kind === 'documentation' ? resolved.documentation : null;
  const docIconTheme = docProduct ? AUDIT_ICON_THEMES[docProduct.iconKind] : null;

  const builderProduct: BuilderProduct | null = resolved?.kind === 'builder' ? resolved.builder : null;
  const builderIconTheme = builderProduct ? AUDIT_ICON_THEMES[builderProduct.iconKind] : null;

  function onBuyAudit() {
    if (!audit) return;
    setCheckoutIntent(audit.id);
    if (authState.kind === 'customer') {
      router.push(buildPaymentHref(audit.id) as Route);
    } else {
      router.push((`/register?checklist_id=${encodeURIComponent(audit.id)}`) as Route);
    }
  }

  const heroStyle = {
    background:
      'linear-gradient(140deg, #071733 0%, #0c2144 45%, #13356d 100%)',
  } as const;

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#f3f5fb]">
      <section className="border-b border-[#12315b]" style={heroStyle}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 md:px-6 md:py-12">
          <Link
            href="/products"
            className="inline-flex w-fit items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9ac3ff] hover:text-white"
          >
            <span aria-hidden="true">←</span>
            {t('detail.backTo')}
          </Link>

          {loading ? (
            <div className="h-32 w-full animate-pulse rounded-xl border border-[#1f3a6d] bg-[#0d2246]/60" aria-live="polite">
              <span className="sr-only">{t('detail.loading')}</span>
            </div>
          ) : null}

          {!loading && notFound ? (
            <div className="rounded-2xl border border-[#1f3a6d] bg-[#0d2246]/80 p-6 text-[#d8e2f2]">
              <h1 className="text-2xl font-semibold text-white">{t('detail.notFoundTitle')}</h1>
              <p className="mt-2 text-sm text-[#a9c0e6]">{t('detail.notFoundBody')}</p>
            </div>
          ) : null}

          {!loading && audit ? (
            <header className="flex flex-col gap-5 md:flex-row md:items-start">
              <div
                className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ${auditIconTheme.bg} ${auditIconTheme.fg}`}
                aria-hidden="true"
              >
                <AuditIcon kind={auditIconKind} className="h-12 w-12" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-[#3f8bff] bg-[#143264]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#cfe1ff]">
                    {t('detail.kind.audit')}
                  </span>
                  <span className="inline-flex rounded-full border border-[#1f8a4b]/70 bg-[#0e3b22]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9beaba]">
                    {t('detail.status.available')}
                  </span>
                  {audit.version ? (
                    <span className="text-[11px] font-medium text-[#a9c0e6]">
                      {t('audits.version', { version: String(audit.version) })}
                    </span>
                  ) : null}
                </div>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">{audit.title}</h1>
                {audit.checklist_type?.name ? (
                  <p className="text-sm text-[#a9c0e6]">{audit.checklist_type.name}</p>
                ) : null}
              </div>
            </header>
          ) : null}

          {!loading && docProduct ? (
            <header className="flex flex-col gap-5 md:flex-row md:items-start">
              <div
                className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ${docIconTheme!.bg} ${docIconTheme!.fg}`}
                aria-hidden="true"
              >
                <AuditIcon kind={docProduct.iconKind} className="h-12 w-12" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-[#3f8bff] bg-[#143264]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#cfe1ff]">
                    {t('detail.kind.documentation')}
                  </span>
                  <span className="inline-flex rounded-full border border-amber-300/40 bg-amber-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                    {t('detail.status.comingSoon')}
                  </span>
                </div>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">{t(`doc.${docProduct.id}.name`)}</h1>
                <p className="max-w-2xl text-sm text-[#c7d8f8]">{t(`doc.${docProduct.id}.subtitle`)}</p>
              </div>
            </header>
          ) : null}

          {!loading && builderProduct ? (
            <header className="flex flex-col gap-5 md:flex-row md:items-start">
              <div
                className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ${builderIconTheme!.bg} ${builderIconTheme!.fg}`}
                aria-hidden="true"
              >
                <AuditIcon kind={builderProduct.iconKind} className="h-12 w-12" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-[#3f8bff] bg-[#143264]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#cfe1ff]">
                    {t('detail.kind.builder')}
                  </span>
                  <span className="inline-flex rounded-full border border-amber-300/40 bg-amber-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                    {t('detail.status.comingSoon')}
                  </span>
                </div>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  {t(`builders.${builderProduct.id}.title`)}
                </h1>
                <p className="max-w-2xl text-sm text-[#c7d8f8]">
                  {t(`builders.${builderProduct.id}.subtitle`)}
                </p>
              </div>
            </header>
          ) : null}
        </div>
      </section>

      <div className="flex-1">
      {!loading && !notFound ? (
        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:px-6 lg:grid-cols-[1.6fr_1fr]">
          <article className="space-y-6 rounded-2xl border border-[#d7deeb] bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-[#1f2741]">{t('detail.aboutTitle')}</h2>
              {audit ? (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-[#5e7293]">
                    {audit.checklist_type?.description?.trim() || t('detail.audit.about')}
                  </p>
                  {audit.warning ? (
                    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      {audit.warning}
                    </p>
                  ) : null}
                </>
              ) : null}
              {docProduct ? (
                <p className="mt-2 text-sm leading-relaxed text-[#5e7293]">{t(`doc.${docProduct.id}.body`)}</p>
              ) : null}
              {builderProduct ? (
                <p className="mt-2 text-sm leading-relaxed text-[#5e7293]">
                  {t(`builders.${builderProduct.id}.description`)}
                </p>
              ) : null}
            </div>

            {audit ? (
              <div>
                <h3 className="text-base font-semibold text-[#1f2741]">{t('detail.includesTitle')}</h3>
                <ul className="mt-3 grid gap-2 text-sm text-[#3f4f6e] md:grid-cols-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ddf5e8] text-[#2f9c65]" aria-hidden="true">
                        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                          <path d="m4.2 8.1 2.2 2.2 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>{t(`detail.audit.includes.${idx}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {docProduct ? (
              <div>
                <h3 className="text-base font-semibold text-[#1f2741]">{t('detail.includesTitle')}</h3>
                <ul className="mt-3 grid gap-2 text-sm text-[#3f4f6e] md:grid-cols-2">
                  {docProduct.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ddf5e8] text-[#2f9c65]" aria-hidden="true">
                        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                          <path d="m4.2 8.1 2.2 2.2 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>{t(`docPoint.${point}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-[#d7deeb] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c83a8]">
                {t('detail.priceLabel')}
              </p>
              {audit ? (
                <p className="mt-2 text-3xl font-semibold text-[#1f355d]">
                  {formatChecklistPrice(audit.pricing, locale, t('audits.price.free'))}
                </p>
              ) : null}
              {docProduct ? (
                <p className="mt-2 text-3xl font-semibold text-[#1f355d]">{docProduct.price}</p>
              ) : null}
              {builderProduct ? (
                <p className="mt-2 text-2xl font-semibold text-[#5e7293]">—</p>
              ) : null}

              {audit ? (
                <button
                  type="button"
                  onClick={onBuyAudit}
                  className="mt-4 flex w-full items-center justify-center rounded-lg border border-[#1f7bff] bg-[#1f7bff] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2e87ff]"
                >
                  {t('detail.buy')}
                </button>
              ) : null}

              {!audit ? (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="mt-4 flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-[#d7deeb] bg-[#f3f5fb] px-3 py-2 text-sm font-semibold text-[#9aa6bd]"
                >
                  {t('detail.buy')}
                </button>
              ) : null}

              <button
                type="button"
                disabled
                aria-disabled="true"
                title={t('detail.brochureUnavailable')}
                className="mt-2 flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-[#d7deeb] bg-white px-3 py-2 text-sm font-semibold text-[#9aa6bd]"
              >
                {t('detail.brochure')}
              </button>

              {!audit ? (
                <Link
                  href="/contact"
                  className="mt-2 flex w-full items-center justify-center rounded-lg border border-[#d7deeb] bg-white px-3 py-2 text-sm font-semibold text-[#1f355d] transition-colors hover:bg-[#f3f7ff]"
                >
                  {t('detail.contactSales')}
                </Link>
              ) : null}
            </div>

            {!audit ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                {t('detail.comingSoonNotice')}
              </p>
            ) : null}
          </aside>
        </section>
      ) : null}

      {!loading && notFound ? (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 rounded-lg border border-[#1f7bff] bg-[#1f7bff]/10 px-3 py-2 text-sm font-semibold text-[#1f7bff] hover:bg-[#1f7bff]/20"
          >
            <span aria-hidden="true">←</span>
            {t('detail.backTo')}
          </Link>
        </section>
      ) : null}
      </div>

      <PublicFooter />
    </main>
  );
}
