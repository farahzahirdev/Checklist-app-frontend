'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { PublicFooter } from '@/components/public-footer';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';
import { translate, useLocale } from '@/lib/i18n';
import { productsMessages } from '@/locales/products';
import { useCMSPage } from '@/hooks/useCMSPage';
import { PageRenderer } from '@/components/cms/PageRenderer';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';
import {
  flattenPublicProducts,
  formatPublicProductPriceLabel,
  isPublicCatalogProductListable,
  isPublicProductPriceUnset,
  canPurchasePublicCatalogProduct,
  listPublicProducts,
  publicChecklistProductToCustomerChecklist,
  type PublicProduct,
  type PublicProductStatus,
  type PublicProductsResponse,
} from '@/lib/public-products';
import {
  AuditIcon,
  AUDIT_ICON_THEMES,
  pickAuditIconKind,
  type AuditIconKind,
} from '@/components/products/audit-icon';
import {
  BUILDER_PRODUCTS,
  DOCUMENTATION_PRODUCTS,
  buildAuditProductHref,
  buildBuilderProductHref,
  buildDocumentationProductHref,
  type DocumentationCategory as CatalogDocumentationCategory,
} from '@/lib/products-catalog';

const DOCUMENT_CATEGORIES = ['All', 'Access & Identity', 'Devices & Endpoints', 'Data Protection', 'Operations', 'Governance', 'Response'] as const;

const DOC_FILTER_NAMES = new Set<string>([
  'Access & Identity',
  'Devices & Endpoints',
  'Data Protection',
  'Operations',
  'Governance',
  'Response',
]);

export type DocumentationCategory = (typeof DOCUMENT_CATEGORIES)[number];

/** Outline CTA on product grid cards (documentation, audits, builders). */
const PRODUCT_CARD_OUTLINE_CTA_CLASS =
  'inline-flex w-full items-center justify-center rounded-md border border-[#2563eb] bg-[#eff6ff] px-3 py-2 text-sm font-semibold text-[#2563eb] transition-colors group-hover:border-[#1d4ed8] group-hover:bg-[#dbeafe] group-hover:text-[#1d4ed8]';

function CheckBadgeIcon() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ddf5e8] text-[#2f9c65]">
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
        <path d="m4.2 8.1 2.2 2.2 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}


function formatChecklistPrice(
  pricing: CustomerChecklist['pricing'],
  locale: string,
  labels: { free: string; comingSoon: string },
): string {
  return formatPublicProductPriceLabel(pricing, locale, labels);
}

function formatCatalogPricing(
  pricing: PublicProduct['pricing'] | undefined,
  locale: string,
  labels: { free: string; comingSoon: string },
): string {
  return formatPublicProductPriceLabel(pricing, locale, labels);
}

function priceLabels(t: (key: string) => string) {
  return { free: t('audits.price.free'), comingSoon: t('detail.status.comingSoon') };
}

function mapApiCategoryNameToDocFilter(name: string | null | undefined): CatalogDocumentationCategory {
  const n = (name ?? '').trim();
  if (DOC_FILTER_NAMES.has(n)) return n as CatalogDocumentationCategory;
  return 'Operations';
}

function buildDocBulletLines(product: PublicProduct): string[] {
  const text = (product.short_description ?? product.description ?? '').trim();
  if (!text) return [product.name];
  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (lines.length >= 2) return lines.slice(0, 4);
  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  return (sentences.length ? sentences : [text]).slice(0, 4);
}

function ProductsPageContent() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(productsMessages, locale, key, values);
  const [activeCategory, setActiveCategory] = useState<DocumentationCategory>('All');
  const [publishedChecklists, setPublishedChecklists] = useState<CustomerChecklist[]>([]);
  const [checklistsLoading, setChecklistsLoading] = useState(true);
  const [checklistsError, setChecklistsError] = useState('');
  const [publicCatalog, setPublicCatalog] = useState<PublicProductsResponse | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    listPublicProducts()
      .then((data) => {
        if (cancelled) return;
        setPublicCatalog(data);
      })
      .catch(() => {
        if (cancelled) return;
        setPublicCatalog(null);
      })
      .finally(() => {
        if (cancelled) return;
        setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    setChecklistsLoading(true);
    setChecklistsError('');
    listPublishedCustomerChecklists({ sortBy: 'updated_at', sortOrder: 'desc', limit: 100 })
      .then((items) => {
        if (cancelled) return;
        setPublishedChecklists(items.filter((item) => item.status === 'published'));
      })
      .catch(() => {
        if (cancelled) return;
        setChecklistsError(t('audits.error'));
      })
      .finally(() => {
        if (cancelled) return;
        setChecklistsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const listableCatalogProducts = useMemo(() => {
    if (!publicCatalog) return [];
    return flattenPublicProducts(publicCatalog).filter(isPublicCatalogProductListable);
  }, [publicCatalog]);

  const catalogSucceeded = !catalogLoading && publicCatalog !== null;

  const apiDocumentationProducts = useMemo(
    () => listableCatalogProducts.filter((p) => p.product_kind === 'documentation'),
    [listableCatalogProducts],
  );

  const apiAuditRows = useMemo(() => {
    const checklistProducts = listableCatalogProducts
      .filter((p) => p.product_kind === 'checklist')
      .sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });
    const rows: { checklist: CustomerChecklist; slug: string; catalogStatus: PublicProductStatus }[] = [];
    for (const p of checklistProducts) {
      const ch = publicChecklistProductToCustomerChecklist(p);
      if (ch) rows.push({ checklist: ch, slug: p.slug, catalogStatus: p.status });
    }
    return rows;
  }, [listableCatalogProducts]);

  const apiModuleProducts = useMemo(
    () => listableCatalogProducts.filter((p) => p.product_kind === 'module'),
    [listableCatalogProducts],
  );

  const auditGridItems = useMemo(() => {
    if (catalogSucceeded) return apiAuditRows;
    return publishedChecklists.map((checklist) => ({
      checklist,
      slug: null as string | null,
      catalogStatus: 'published' as PublicProductStatus,
    }));
  }, [catalogSucceeded, apiAuditRows, publishedChecklists]);

  const auditsLoading = catalogLoading || (!catalogSucceeded && checklistsLoading);
  const auditsError = !catalogSucceeded ? checklistsError : '';

  const staticDocSections = useMemo(() => {
    return DOCUMENTATION_PRODUCTS.map((doc) => ({
      id: doc.id,
      slug: doc.slug,
      name: t(`doc.${doc.id}.name`),
      subtitle: t(`doc.${doc.id}.subtitle`),
      price: doc.price,
      iconKind: doc.iconKind,
      category: doc.category as CatalogDocumentationCategory,
      points: doc.points.map((p) => t(`docPoint.${p}`)),
      badge: doc.badge ? t('common.popular') : undefined,
      statusLabel: 'comingSoon' as const,
    }));
  }, [locale, t]);

  const apiDocSections = useMemo(() => {
    return apiDocumentationProducts.map((p, idx) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      subtitle: (p.short_description ?? '').trim() || t('browse.apiSubtitleFallback'),
      price: formatCatalogPricing(p.pricing, locale, priceLabels(t)),
      iconKind: pickAuditIconKind(p.checklist_type?.checklist_type_code, idx) as AuditIconKind,
      category: mapApiCategoryNameToDocFilter(p.category?.name),
      points: buildDocBulletLines(p),
      badge: p.is_featured ? t('common.popular') : undefined,
      statusLabel: p.status === 'published' ? ('available' as const) : ('comingSoon' as const),
    }));
  }, [apiDocumentationProducts, locale, t]);

  const displayDocSections = apiDocSections.length > 0 ? apiDocSections : staticDocSections;

  const filteredSections = useMemo(() => {
    if (apiDocSections.length > 0) return displayDocSections;
    if (activeCategory === 'All') return displayDocSections;
    return displayDocSections.filter((doc) => doc.category === (activeCategory as CatalogDocumentationCategory));
  }, [activeCategory, apiDocSections.length, displayDocSections]);

  const categoryLabel = (category: DocumentationCategory) => {
    if (category === 'All') return t('filters.all');
    if (category === 'Access & Identity') return t('filters.accessIdentity');
    if (category === 'Devices & Endpoints') return t('filters.devicesEndpoints');
    if (category === 'Data Protection') return t('filters.dataProtection');
    if (category === 'Operations') return t('filters.operations');
    if (category === 'Governance') return t('filters.governance');
    return t('filters.response');
  };

  const heroStyle = {
    backgroundImage: `radial-gradient(circle at 20% 20%, rgba(16, 55, 114, 0.62) 0%, rgba(7, 22, 47, 0.72) 45%, rgba(4, 16, 34, 0.78) 100%), url(${heroBackground.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      <section className="relative overflow-hidden border-b border-[#12315b]" style={heroStyle}>
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#2262d9]/40 blur-3xl" />
          <div className="absolute right-24 top-6 h-72 w-72 rounded-full bg-[#143f8f]/40 blur-3xl" />
        </div>
        <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:px-6 md:py-12 lg:max-w-6xl lg:grid-cols-[1.05fr_0.95fr] xl:max-w-7xl 2xl:max-w-[90rem]">
          <div>
            <p className="inline-flex rounded-full border border-[#255da8] bg-[#12366c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ac3ff] motion-safe:animate-fade-in motion-safe:delay-75">
              {t('hero.kicker')}
            </p>
            <h1 className="public-hero-title mt-4 text-white motion-safe:animate-fade-in-up motion-safe:delay-100">
              {t('hero.title.line1')}
              <br />
              {t('hero.title.line2')} <span className="text-[#3f8bff]">{t('hero.title.accent')}</span>
            </h1>
            <p className="public-hero-subtitle mt-4 max-w-xl text-[#c7d8f8] motion-safe:animate-fade-in-up motion-safe:delay-200">
              {t('hero.subtitle')}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 motion-safe:animate-fade-in-up motion-safe:delay-250">
              <Link
                href="#browse-docs"
                className="group inline-flex min-w-[220px] items-center gap-3 rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 px-4 py-3 text-left transition-colors hover:bg-[#143264]"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1f3a6d] text-[#9ac3ff]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M8 4h8l2 2v14H6V6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9 4v3h6V4M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{t('hero.cat.docs.title')}</span>
                  <span className="text-xs text-[#a9c0e6]">{t('hero.cat.docs.subtitle')}</span>
                </span>
              </Link>
              <Link
                href="#audits-checklists"
                className="group inline-flex min-w-[220px] items-center gap-3 rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 px-4 py-3 text-left transition-colors hover:bg-[#143264]"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1f3a6d] text-[#9ac3ff]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M12 3l8 4v5c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V7l8-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{t('hero.cat.audits.title')}</span>
                  <span className="text-xs text-[#a9c0e6]">{t('hero.cat.audits.subtitle')}</span>
                </span>
              </Link>
            </div>
            <div className="mt-7 grid gap-3 motion-safe:animate-fade-in-up motion-safe:delay-300 sm:grid-cols-3">
              <article className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-white">{t('hero.highlight1.title')}</p>
                <p className="mt-1 text-xs text-[#a9c0e6]">{t('hero.highlight1.body')}</p>
              </article>
              <article className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-white">{t('hero.highlight2.title')}</p>
                <p className="mt-1 text-xs text-[#a9c0e6]">{t('hero.highlight2.body')}</p>
              </article>
              <article className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-white">{t('hero.highlight3.title')}</p>
                <p className="mt-1 text-xs text-[#a9c0e6]">{t('hero.highlight3.body')}</p>
              </article>
            </div>
          </div>

          <div className="relative motion-safe:animate-fade-in-right motion-safe:delay-200">
            <div className="overflow-hidden rounded-2xl border border-[#2f4f86] bg-[#f8fbff] shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
              <div className="grid md:grid-cols-[175px_1fr]">
                <aside className="min-h-[340px] bg-[#091d3f] p-4 text-[#d7e6ff]">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em]">{t('mock.brand')}</p>
                  <ul className="space-y-2.5 text-sm">
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">{t('mock.nav.dashboard')}</li>
                    <li className="rounded-md bg-[#163f7d] px-2 py-1.5">{t('mock.nav.checklist')}</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">{t('mock.nav.evidence')}</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">{t('mock.nav.reports')}</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">{t('mock.nav.settings')}</li>
                  </ul>
                </aside>
                <div className="p-5 text-[#1f3253]">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4e6c96]">{t('mock.library')}</p>
                  <div className="mt-3 space-y-2.5">
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">{t('doc.mobileDevice.name')}</div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">{t('doc.accessControl.name')}</div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">{t('doc.incidentResponse.name')}</div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">{t('doc.dataClassification.name')}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 hidden w-56 rounded-2xl border border-[#d7e2f5] bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.2)] sm:block">
              <p className="text-sm font-semibold text-[#2a3e63]">{t('doc.mobileDevice.name')}</p>
              <ul className="mt-2 space-y-1 text-xs text-[#4c5f80]">
                <li>{t('docPoint.pdf.policyDocument')}</li>
                <li>{t('docPoint.pdf.userGuidelines')}</li>
                <li>{t('docPoint.pdf.adminGuidelines')}</li>
              </ul>
              <p className="mt-3 text-lg font-bold text-[#1f355d]">€149</p>
              <Link
                href="/register"
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#1f7bff] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2e87ff]"
              >
                {t('common.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6 md:px-6 md:py-14 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 md:p-6">
          <div className="grid gap-3 md:grid-cols-[1.1fr_3fr]">
            <div>
              <h3 className="text-3xl font-semibold text-[#1a2440]">{t('how.title')}</h3>
              <p className="mt-2 text-sm text-[#5e7293]">{t('how.subtitle')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">{t('how.step1.title')}</p>
                <p className="mt-1 text-xs text-[#5e7293]">{t('how.step1.body')}</p>
              </div>
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">{t('how.step2.title')}</p>
                <p className="mt-1 text-xs text-[#5e7293]">{t('how.step2.body')}</p>
              </div>
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">{t('how.step3.title')}</p>
                <p className="mt-1 text-xs text-[#5e7293]">{t('how.step3.body')}</p>
              </div>
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">{t('how.step4.title')}</p>
                <p className="mt-1 text-xs text-[#5e7293]">{t('how.step4.body')}</p>
              </div>
            </div>
          </div>
        </article>

        <div id="browse-docs" className="scroll-mt-24">
          <h3 className="text-4xl font-semibold text-[#1a2440]">{t('browse.title')}</h3>
          <p className="mt-2 text-base text-[#5e7293]">{t('browse.subtitle')}</p>
          {apiDocSections.length === 0 ? (
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Documentation categories">
              {DOCUMENT_CATEGORIES.map((chip) => {
                const selected = activeCategory === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveCategory(chip)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      selected
                        ? 'border-[#1f7bff] bg-[#1f7bff] text-white'
                        : 'border-[#d7deeb] bg-white text-[#5e7293] hover:bg-[#f7f9ff]'
                    }`}
                  >
                    {categoryLabel(chip)}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {filteredSections.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-[#d7deeb] bg-white px-4 py-10 text-center text-sm text-[#5e7293]">
              {t('empty', {
                all: t('filters.all'),
              })}{' '}
              <button type="button" className="font-semibold text-[#1f7bff] underline hover:no-underline" onClick={() => setActiveCategory('All')}>
                {t('filters.all')}
              </button>
              .
            </p>
          ) : (
            filteredSections.map((doc) => {
              const docIconTheme = AUDIT_ICON_THEMES[doc.iconKind];
              return (
                <Link
                  key={doc.id}
                  href={`/products/${doc.slug}` as Route}
                  className="group flex h-full flex-col rounded-2xl border border-[#d7deeb] bg-white p-4 shadow-sm transition-shadow duration-300 ease-out hover:border-[#1f7bff] motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${docIconTheme.bg} ${docIconTheme.fg}`}
                      aria-hidden="true"
                    >
                      <AuditIcon kind={doc.iconKind} className="h-6 w-6" />
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        doc.statusLabel === 'available'
                          ? 'border-[#1f8a4b]/70 bg-emerald-50 text-emerald-800'
                          : 'border-amber-300/60 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {doc.statusLabel === 'available' ? t('detail.status.available') : t('detail.status.comingSoon')}
                    </span>
                  </div>
                  <h2 className="mt-3 text-base font-semibold text-[#1f2741]">{doc.name}</h2>
                  <p className="mt-1 text-sm text-[#5e7293]">{doc.subtitle}</p>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#5f7394]">
                    {doc.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <CheckBadgeIcon />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex w-full flex-col gap-3 border-t border-[#eef1f7] pt-4">
                    <p className="text-2xl font-semibold text-[#1f355d]">{doc.price}</p>
                    <span className={PRODUCT_CARD_OUTLINE_CTA_CLASS}>
                      {t('browse.getStarted')}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <section id="audits-checklists" className="space-y-4 scroll-mt-24">
          <div>
            <h3 className="text-4xl font-semibold text-[#1a2440]">{t('audits.title')}</h3>
            <p className="mt-2 max-w-3xl text-base text-[#5e7293]">{t('audits.subtitle')}</p>
          </div>

          {auditsLoading ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-44 animate-pulse rounded-2xl border border-[#e2e8f5] bg-white"
                />
              ))}
            </div>
          ) : auditsError ? (
            <p className="rounded-2xl border border-[#f0c7cf] bg-[#fff2f4] px-4 py-3 text-sm text-[#b63d51]">
              {auditsError}
            </p>
          ) : auditGridItems.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#d7deeb] bg-white px-4 py-10 text-center text-sm text-[#5e7293]">
              {t('audits.empty')}
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {auditGridItems.map((item, index) => {
                const { checklist, slug, catalogStatus } = item;
                const labels = priceLabels(t);
                const priceLabel = formatChecklistPrice(checklist.pricing, locale, labels);
                const iconKind = pickAuditIconKind(checklist.checklist_type?.code, index);
                const iconTheme = AUDIT_ICON_THEMES[iconKind];
                const href = (slug ? `/products/${encodeURIComponent(slug)}` : buildAuditProductHref(checklist.id)) as Route;
                const ctaLabel =
                  catalogStatus === 'coming_soon' || isPublicProductPriceUnset(checklist.pricing)
                    ? t('cta.viewDetails')
                    : t('detail.buy');
                return (
                  <Link
                    key={slug ?? checklist.id}
                    href={href}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d7deeb] bg-white shadow-sm transition-shadow duration-300 ease-out hover:border-[#1f7bff] motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md"
                  >
                    <div className="flex flex-1 gap-4 p-4">
                      <div
                        className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-xl ${iconTheme.bg} ${iconTheme.fg}`}
                        aria-hidden="true"
                      >
                        <AuditIcon kind={iconKind} className="h-12 w-12" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-semibold text-[#1f2741]">{checklist.title}</h4>
                        {checklist.checklist_type?.description ? (
                          <p className="mt-1.5 line-clamp-3 text-sm text-[#5e7293]">
                            {checklist.checklist_type.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-auto flex w-full flex-col gap-3 border-t border-[#eef1f7] px-4 pb-4 pt-4">
                      <p className="text-2xl font-semibold text-[#1f355d]">{priceLabel}</p>
                      <span className={PRODUCT_CARD_OUTLINE_CTA_CLASS}>
                        {ctaLabel}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!auditsLoading && !auditsError && auditGridItems.length > 0 ? (
            <p className="flex items-start gap-2 rounded-xl border border-[#dde6f5] bg-[#f4f7fc] px-4 py-3 text-sm text-[#4a5b7c]">
              <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#dceaff] text-[#1f5fb8]" aria-hidden="true">
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                  <path d="m4.2 8.1 2.2 2.2 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{t('audits.footerNote')}</span>
            </p>
          ) : null}
        </section>

        <section id="builders" className="space-y-4 scroll-mt-24">
          <div>
            <h3 className="text-4xl font-semibold text-[#1a2440]">{t('builders.title')}</h3>
            <p className="mt-2 max-w-3xl text-base text-[#5e7293]">{t('builders.subtitle')}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {BUILDER_PRODUCTS.map((builder) => {
              const theme = AUDIT_ICON_THEMES[builder.iconKind];
              return (
                <Link
                  key={builder.id}
                  href={buildBuilderProductHref(builder) as Route}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d7deeb] bg-white shadow-sm transition-shadow duration-300 ease-out hover:border-[#1f7bff] motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md"
                >
                  <div className="flex flex-1 gap-4 p-4">
                    <div
                      className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-xl ${theme.bg} ${theme.fg}`}
                      aria-hidden="true"
                    >
                      <AuditIcon kind={builder.iconKind} className="h-12 w-12" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-[#1f2741]">
                          {t(`builders.${builder.id}.title`)}
                        </h4>
                        <span className="inline-flex rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                          {t('detail.status.comingSoon')}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-3 text-sm text-[#5e7293]">
                        {t(`builders.${builder.id}.subtitle`)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto flex w-full flex-col gap-3 border-t border-[#eef1f7] px-4 pb-4 pt-4">
                    <span className={PRODUCT_CARD_OUTLINE_CTA_CLASS}>{t('cta.viewDetails')}</span>
                  </div>
                </Link>
              );
            })}
            {apiModuleProducts.map((mod, modIdx) => {
              const iconKind = pickAuditIconKind(mod.checklist_type?.checklist_type_code, modIdx) as AuditIconKind;
              const theme = AUDIT_ICON_THEMES[iconKind];
              const statusLabel = mod.status === 'published' ? 'available' : 'comingSoon';
              const modCtaLabel = canPurchasePublicCatalogProduct(mod.status, mod.pricing)
                ? t('detail.buy')
                : t('cta.viewDetails');
              return (
                <Link
                  key={mod.id}
                  href={`/products/${encodeURIComponent(mod.slug)}` as Route}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d7deeb] bg-white shadow-sm transition-shadow duration-300 ease-out hover:border-[#1f7bff] motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md"
                >
                  <div className="flex flex-1 gap-4 p-4">
                    <div
                      className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-xl ${theme.bg} ${theme.fg}`}
                      aria-hidden="true"
                    >
                      <AuditIcon kind={iconKind} className="h-12 w-12" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-[#1f2741]">{mod.name}</h4>
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                            statusLabel === 'available'
                              ? 'border-[#1f8a4b]/70 bg-emerald-50 text-emerald-800'
                              : 'border-amber-300/60 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {statusLabel === 'available' ? t('detail.status.available') : t('detail.status.comingSoon')}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-3 text-sm text-[#5e7293]">
                        {(mod.short_description ?? '').trim() || t('browse.apiSubtitleFallback')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto flex w-full flex-col gap-3 border-t border-[#eef1f7] px-4 pb-4 pt-4">
                    {mod.status === 'published' && !isPublicProductPriceUnset(mod.pricing) ? (
                      <p className="text-2xl font-semibold text-[#1f355d]">
                        {formatCatalogPricing(mod.pricing, locale, priceLabels(t))}
                      </p>
                    ) : mod.status === 'published' ? (
                      <p className="text-lg font-semibold text-[#5e7293]">{t('detail.status.comingSoon')}</p>
                    ) : null}
                    <span className={PRODUCT_CARD_OUTLINE_CTA_CLASS}>{modCtaLabel}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md md:p-6">
          <h3 className="text-3xl font-semibold text-[#1f3a31]">{t('why.title')}</h3>
          <ul className="mt-4 grid gap-2.5 text-base leading-7 text-[#2f7f57] md:grid-cols-2">
            <li className="flex items-center gap-2.5"><CheckBadgeIcon />{t('why.0')}</li>
            <li className="flex items-center gap-2.5"><CheckBadgeIcon />{t('why.1')}</li>
            <li className="flex items-center gap-2.5"><CheckBadgeIcon />{t('why.2')}</li>
            <li className="flex items-center gap-2.5"><CheckBadgeIcon />{t('why.3')}</li>
            <li className="flex items-center gap-2.5"><CheckBadgeIcon />{t('why.4')}</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-[#17489b] bg-[linear-gradient(90deg,#0b2f73,#0e3f9d)] p-5 text-white transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:hover:shadow-[0_18px_34px_rgba(17,62,148,0.28)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-semibold">{t('cta.title')}</h3>
              <p className="mt-1 text-sm text-[#d2e2ff]">{t('cta.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products/audit-readiness-checklist"
                className="rounded-xl border border-white/35 bg-white px-5 py-2.5 font-semibold text-[#123e8b] transition-colors duration-200 hover:bg-[#e9f1ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                {t('cta.viewDetails')}
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                {t('cta.createAccount')}
              </Link>
            </div>
          </div>
        </article>
      </section>

      <PublicFooter />
    </main>
  );
}

// CMS Integration Wrapper: Renders CMS page for "products" slug if available, otherwise shows hardcoded content
function ProductsPageWithCMS() {
  const { page, loading } = useCMSPage('products');
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f5fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d6e2f7] border-t-[#2f7dff]" />
      </div>
    );
  }

  // Footer: PageRenderer appends it for CMS pages; ProductsPageContent includes it for fallback.
  return <PageRenderer page={page} fallback={<ProductsPageContent />} />;
}

export default ProductsPageWithCMS;
