'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PublicFooter } from '@/components/public-footer';
import { AuditIcon, AUDIT_ICON_THEMES, pickAuditIconKind } from '@/components/products/audit-icon';
import { translate, useLocale } from '@/lib/i18n';
import { productsMessages } from '@/locales/products';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';
import { getApiBaseUrl } from '@/lib/api';
import {
  formatPublicProductPriceLabel,
  getPublicProductBySlug,
  isPublicProductPriceUnset,
  publicChecklistProductToCustomerChecklist,
  type PublicProductDetail,
} from '@/lib/public-products';
import { getCurrentUser, getRoleKey } from '@/lib/auth';
import { getCustomerProfileCompletion } from '@/lib/customer-profile';
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
  labels: { free: string; comingSoon: string },
): string {
  return formatPublicProductPriceLabel(pricing, locale, labels);
}

function pricingForDisplay(detail: PublicProductDetail): CustomerChecklist['pricing'] | null {
  if (isPublicProductPriceUnset(detail.pricing)) return null;
  const amountCents = detail.pricing!.amount_cents!;
  if (amountCents === 0) {
    return {
      price_id: detail.pricing?.price_id ?? '',
      amount_cents: 0,
      currency: (detail.pricing?.currency || 'USD').toUpperCase(),
    };
  }
  return {
    price_id: detail.pricing!.price_id ?? '',
    amount_cents: amountCents,
    currency: (detail.pricing!.currency || 'USD').toUpperCase(),
  };
}

function includeLinesFromApi(description: string | null | undefined, short: string | null | undefined): string[] {
  const text = (description ?? short ?? '').trim();
  if (!text) return [];
  
  // Strip HTML tags for bullet points
  const plainText = text.replace(/<[^>]*>/g, '');
  const lines = plainText.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (lines.length >= 2) return lines.slice(0, 6);
  const sentences = plainText.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  return (sentences.length ? sentences : [plainText]).slice(0, 6);
}

function ProductHeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="w-full shrink-0 lg:max-w-[380px] lg:justify-self-end">
      <div className="overflow-hidden rounded-2xl border border-[#2a4a7f] bg-[#0a1a38] shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        <div className="flex aspect-[16/10] max-h-[280px] items-center justify-center p-3 sm:max-h-[320px] lg:aspect-[4/3] lg:max-h-none lg:min-h-[240px]">
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain object-center"
            loading="lazy"
          />
        </div>
      </div>
    </figure>
  );
}

function productDetailHeroGridClass(hasHeroImage: boolean): string {
  return hasHeroImage
    ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(380px,38%)] lg:items-start'
    : '';
}

/** Resolve relative brochure paths against the public API origin. */
function absolutePublicAssetUrl(url: string | null | undefined): string | null {
  const u = (url ?? '').trim();
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  const base = getApiBaseUrl().replace(/\/$/, '');
  const path = u.startsWith('/') ? u : `/${u}`;
  return `${base}${path}`;
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
  const [profileCompletionPercent, setProfileCompletionPercent] = useState<number | null>(null);
  const [profileCompletionLoading, setProfileCompletionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setResolved(null);

    async function resolveProduct() {
      try {
        const apiDetail = await getPublicProductBySlug(slug);
        if (!cancelled && apiDetail) {
          if (apiDetail.product_kind === 'checklist') {
            const ch = publicChecklistProductToCustomerChecklist(apiDetail);
            if (ch && (apiDetail.status === 'published' || apiDetail.status === 'coming_soon')) {
              setResolved({
                kind: 'audit',
                status: 'available',
                checklist: ch,
                publicProductStatus: apiDetail.status === 'coming_soon' ? 'coming_soon' : 'published',
                brochurePdfUrl: apiDetail.brochure_pdf_url,
                heroImageUrl: apiDetail.hero_image_url,
              });
              setLoading(false);
              return;
            }
          } else if (apiDetail.product_kind === 'documentation' || apiDetail.product_kind === 'module') {
            if (apiDetail.status === 'published' || apiDetail.status === 'coming_soon') {
              setResolved({ kind: 'api', detail: apiDetail });
              setLoading(false);
              return;
            }
          }
        }
      } catch {
        // fall through to static resolution
      }
      if (cancelled) return;

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
            setResolved({
              kind: 'audit',
              status: 'available',
              checklist: match,
              publicProductStatus: 'published',
            });
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

  useEffect(() => {
    if (authState.kind !== 'customer') {
      setProfileCompletionPercent(null);
      setProfileCompletionLoading(false);
      return;
    }

    let cancelled = false;
    setProfileCompletionLoading(true);
    getCustomerProfileCompletion()
      .then((completion) => {
        if (!cancelled) setProfileCompletionPercent(completion.completion_percent);
      })
      .catch(() => {
        if (!cancelled) setProfileCompletionPercent(null);
      })
      .finally(() => {
        if (!cancelled) setProfileCompletionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authState]);

  const audit = resolved?.kind === 'audit' ? resolved.checklist : null;
  const priceLabels = useMemo(
    () => ({ free: t('audits.price.free'), comingSoon: t('detail.status.comingSoon') }),
    [locale, t],
  );
  const canPurchaseAudit = useMemo(() => {
    if (!resolved || resolved.kind !== 'audit') return false;
    if (resolved.publicProductStatus === 'coming_soon') return false;
    if (isPublicProductPriceUnset(audit?.pricing)) return false;
    return (audit?.pricing?.amount_cents ?? 0) > 0;
  }, [resolved, audit?.pricing]);

  const requiresCompletedProfileForPurchase =
    authState.kind === 'customer' && !profileCompletionLoading && profileCompletionPercent !== 100;

  const brochureLinkHref = useMemo(() => {
    if (resolved?.kind === 'audit') return absolutePublicAssetUrl(resolved.brochurePdfUrl);
    if (resolved?.kind === 'api') return absolutePublicAssetUrl(resolved.detail.brochure_pdf_url);
    return null;
  }, [resolved]);

  const documentationFiles = useMemo(() => {
    if (resolved?.kind === 'api') {
      return (resolved.detail.documentation_files || []).map((file) => ({
        ...file,
        url: absolutePublicAssetUrl(file.url),
      }));
    }
    return [];
  }, [resolved]);

  const hasBrochurePdf = useMemo(() => Boolean(brochureLinkHref), [brochureLinkHref]);
  const hasDocumentationFiles = useMemo(() => documentationFiles.length > 0, [documentationFiles]);

  const heroImageHref = useMemo(() => {
    if (resolved?.kind === 'audit') return absolutePublicAssetUrl(resolved.heroImageUrl);
    if (resolved?.kind === 'api') return absolutePublicAssetUrl(resolved.detail.hero_image_url);
    return null;
  }, [resolved]);

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

  const showComingSoonNotice = useMemo(() => {
    if (docProduct || builderProduct) return true;
    if (resolved?.kind === 'api' && resolved.detail.status === 'coming_soon') return true;
    if (resolved?.kind === 'audit' && resolved.publicProductStatus === 'coming_soon') return true;
    if (resolved?.kind === 'audit' && isPublicProductPriceUnset(audit?.pricing)) return true;
    if (resolved?.kind === 'api' && isPublicProductPriceUnset(resolved.detail.pricing)) return true;
    return false;
  }, [docProduct, builderProduct, resolved, audit?.pricing]);

  const apiDetail = resolved?.kind === 'api' ? resolved.detail : null;
  const apiIconKind = useMemo(
    () => (apiDetail ? pickAuditIconKind(apiDetail.checklist_type?.checklist_type_code, 0) : 'clipboard'),
    [apiDetail],
  );
  const apiIconTheme = AUDIT_ICON_THEMES[apiIconKind];
  const apiIncludeLines = useMemo(
    () => (apiDetail ? includeLinesFromApi(apiDetail.description, apiDetail.short_description) : []),
    [apiDetail],
  );

  function onBuyAudit() {
    if (!audit || !canPurchaseAudit) return;
    if (requiresCompletedProfileForPurchase) {
      toast.error(t('detail.completeProfileFirst'));
      router.push('/profile');
      return;
    }
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
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 md:px-6 md:py-12 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
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
            <div className={productDetailHeroGridClass(Boolean(heroImageHref))}>
              <header className="flex min-w-0 flex-col gap-5 md:flex-row md:items-start">
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
                    {resolved?.kind === 'audit' && resolved.publicProductStatus === 'coming_soon' ? (
                      <span className="inline-flex rounded-full border border-amber-300/40 bg-amber-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                        {t('detail.status.comingSoon')}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-[#1f8a4b]/70 bg-[#0e3b22]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9beaba]">
                        {t('detail.status.available')}
                      </span>
                    )}
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
              {heroImageHref ? <ProductHeroImage src={heroImageHref} alt={audit.title} /> : null}
            </div>
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

          {!loading && apiDetail ? (
            <div className={productDetailHeroGridClass(Boolean(heroImageHref))}>
              <header className="flex min-w-0 flex-col gap-5 md:flex-row md:items-start">
                <div
                  className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ${apiIconTheme.bg} ${apiIconTheme.fg}`}
                  aria-hidden="true"
                >
                  <AuditIcon kind={apiIconKind} className="h-12 w-12" />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-[#3f8bff] bg-[#143264]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#cfe1ff]">
                      {apiDetail.product_kind === 'documentation'
                        ? t('detail.kind.documentation')
                        : t('detail.kind.builder')}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        apiDetail.status === 'published'
                          ? 'border-[#1f8a4b]/70 bg-[#0e3b22]/70 text-[#9beaba]'
                          : 'border-amber-300/40 bg-amber-500/15 text-amber-100'
                      }`}
                    >
                      {apiDetail.status === 'published' ? t('detail.status.available') : t('detail.status.comingSoon')}
                    </span>
                  </div>
                  <h1 className="text-3xl font-semibold text-white sm:text-4xl">{apiDetail.name}</h1>
                  <p className="max-w-2xl text-sm text-[#c7d8f8]">
                    {(apiDetail.short_description ?? '').trim() || t('browse.apiSubtitleFallback')}
                  </p>
                </div>
              </header>
              {heroImageHref ? <ProductHeroImage src={heroImageHref} alt={apiDetail.name} /> : null}
            </div>
          ) : null}
        </div>
      </section>

      <div className="flex-1">
      {!loading && !notFound ? (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:px-6 lg:max-w-6xl lg:grid-cols-[1.6fr_1fr] xl:max-w-7xl 2xl:max-w-[90rem]">
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
              {apiDetail ? (
                <div className="mt-2 text-sm leading-relaxed text-[#5e7293] max-w-none">
                  <style jsx global>{`
                    .product-description h1 {
                      font-size: 1.5rem;
                      font-weight: 700;
                      line-height: 2rem;
                      margin-bottom: 0.75rem;
                      margin-top: 1.25rem;
                      color: #1f2741;
                    }
                    .product-description h2 {
                      font-size: 1.25rem;
                      font-weight: 600;
                      line-height: 1.75rem;
                      margin-bottom: 0.5rem;
                      margin-top: 1rem;
                      color: #1f2741;
                    }
                    .product-description h3 {
                      font-size: 1.125rem;
                      font-weight: 600;
                      line-height: 1.5rem;
                      margin-bottom: 0.5rem;
                      margin-top: 0.75rem;
                      color: #1f2741;
                    }
                    .product-description p {
                      margin-bottom: 0.75rem;
                      color: #5e7293;
                    }
                    .product-description ul,
                    .product-description ol {
                      margin-bottom: 0.75rem;
                      padding-left: 1.5rem;
                      color: #5e7293;
                    }
                    .product-description ul {
                      list-style-type: disc;
                    }
                    .product-description ol {
                      list-style-type: decimal;
                    }
                    .product-description li {
                      margin-bottom: 0.25rem;
                      color: #5e7293;
                    }
                    .product-description a {
                      color: #2563eb;
                      text-decoration: underline;
                    }
                    .product-description a:hover {
                      color: #1d4ed8;
                    }
                    .product-description strong {
                      font-weight: 700;
                      color: #1f2741;
                    }
                    .product-description em {
                      font-style: italic;
                    }
                    .product-description u {
                      text-decoration: underline;
                    }
                  `}</style>
                  {(apiDetail.description ?? apiDetail.short_description ?? '').trim() ? (
                    <div 
                      className="product-description"
                      dangerouslySetInnerHTML={{ 
                        __html: (apiDetail.description ?? apiDetail.short_description ?? '').trim() 
                      }} 
                    />
                  ) : (
                    <span>{t('browse.apiSubtitleFallback')}</span>
                  )}
                </div>
              ) : null}
            </div>

            {audit ? (
              <div>
                <h3 className="text-base font-semibold text-[#1f2741]">{t('detail.aboutTitle')}</h3>
                <div className="mt-3 text-sm text-[#3f4f6e]">
                  {apiDetail?.description || audit?.checklist_type?.description || t('detail.audit.about')}
                </div>
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
                {apiDetail?.benefits ? (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-[#1f2741]">{t('detail.benefitsTitle')}</h3>
                    <div 
                      className="mt-3 text-sm text-[#3f4f6e] prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: apiDetail.benefits }}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {docProduct ? (
              <div>
                <h3 className="text-base font-semibold text-[#1f2741]">{t('detail.aboutTitle')}</h3>
                <div className="mt-3 text-sm text-[#3f4f6e]">
                  {t(`doc.${docProduct.id}.body`)}
                </div>
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
                {docProduct.benefits ? (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-[#1f2741]">{t('detail.benefitsTitle')}</h3>
                    <div 
                      className="mt-3 text-sm text-[#3f4f6e] prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: docProduct.benefits }}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {apiDetail && apiIncludeLines.length ? (
              <div>
                <h3 className="text-base font-semibold text-[#1f2741]">{t('detail.aboutTitle')}</h3>
                <div className="mt-3 text-sm text-[#3f4f6e]">
                  {apiDetail.description || apiDetail.short_description}
                </div>
                <ul className="mt-3 grid gap-2 text-sm text-[#3f4f6e] md:grid-cols-2">
                  {apiIncludeLines.map((line, idx) => (
                    <li key={`api-line-${idx}`} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ddf5e8] text-[#2f9c65]" aria-hidden="true">
                        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                          <path d="m4.2 8.1 2.2 2.2 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                {apiDetail.benefits ? (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-[#1f2741]">{t('detail.benefitsTitle')}</h3>
                    <div 
                      className="mt-3 text-sm text-[#3f4f6e] prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: apiDetail.benefits }}
                    />
                  </div>
                ) : null}
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
                  {formatChecklistPrice(audit.pricing, locale, priceLabels)}
                </p>
              ) : null}
              {docProduct ? (
                <p className="mt-2 text-3xl font-semibold text-[#1f355d]">{docProduct.price}</p>
              ) : null}
              {builderProduct ? (
                <p className="mt-2 text-2xl font-semibold text-[#5e7293]">—</p>
              ) : null}
              {apiDetail ? (
                <p className="mt-2 text-3xl font-semibold text-[#1f355d]">
                  {formatChecklistPrice(pricingForDisplay(apiDetail), locale, priceLabels)}
                </p>
              ) : null}

              {audit ? (
                <button
                  type="button"
                  onClick={onBuyAudit}
                  disabled={!canPurchaseAudit}
                  aria-disabled={!canPurchaseAudit}
                  className={`mt-4 flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    canPurchaseAudit
                      ? 'border border-[#1f7bff] bg-[#1f7bff] text-white hover:bg-[#2e87ff]'
                      : 'cursor-not-allowed border border-[#d7deeb] bg-[#f3f5fb] text-[#9aa6bd]'
                  }`}
                >
                  {t('detail.buy')}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="mt-4 flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-[#d7deeb] bg-[#f3f5fb] px-3 py-2 text-sm font-semibold text-[#9aa6bd]"
                >
                  {t('detail.buy')}
                </button>
              )}

              {hasBrochurePdf && brochureLinkHref ? (
                <a
                  href={brochureLinkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex w-full items-center justify-center rounded-lg border border-[#1f7bff] bg-white px-3 py-2 text-sm font-semibold text-[#1f7bff] transition-colors hover:bg-[#f3f7ff]"
                >
                  {t('detail.brochure')}
                </a>
              ) : null}

              {hasDocumentationFiles ? (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c83a8]">
                    {t('detail.documentationFiles')}
                  </p>
                  {documentationFiles.map((file) => (
                    <a
                      key={file.id}
                      href={file.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2 rounded-lg border border-[#d7deeb] bg-white px-3 py-2 text-sm text-[#1f355d] transition-colors hover:bg-[#f3f7ff] hover:border-[#1f7bff]"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#3e69b0]" fill="none" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="truncate flex-1 min-w-0">{file.filename}</span>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#3e69b0]" fill="none" aria-hidden="true">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ))}
                </div>
              ) : null}

              {!audit || (!canPurchaseAudit && !requiresCompletedProfileForPurchase) ? (
                <Link
                  href="/contact"
                  className="mt-2 flex w-full items-center justify-center rounded-lg border border-[#d7deeb] bg-white px-3 py-2 text-sm font-semibold text-[#1f355d] transition-colors hover:bg-[#f3f7ff]"
                >
                  {t('detail.contactSales')}
                </Link>
              ) : null}
            </div>

            {showComingSoonNotice ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                {t('detail.comingSoonNotice')}
              </p>
            ) : null}
          </aside>
        </section>
      ) : null}

      {!loading && notFound ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
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
