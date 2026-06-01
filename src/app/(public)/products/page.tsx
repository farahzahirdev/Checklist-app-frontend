'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { PublicFooter } from '@/components/public-footer';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';
import { translate, useLocale } from '@/lib/i18n';
import { productsMessages } from '@/locales/products';
import type { PageDetail } from '@/lib/api/cms-api';
import { useCMSPage } from '@/hooks/useCMSPage';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';
import {
  flattenPublicProducts,
  formatPublicProductPriceLabel,
  isPublicCatalogProductListable,
  isPublicProductPriceUnset,
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

function getCmsSectionData(page: PageDetail | null, sectionType: string): Record<string, any> {
  return page?.sections.find((section) => section.section_type === sectionType)?.data ?? {};
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

function productStatusSortRank(status: PublicProductStatus): number {
  if (status === 'published') return 0;
  if (status === 'coming_soon') return 1;
  return 2;
}

function ProductsPageContent({ cmsPage }: { cmsPage?: PageDetail | null } = {}) {
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
        const statusRankDiff = productStatusSortRank(a.status) - productStatusSortRank(b.status);
        if (statusRankDiff !== 0) return statusRankDiff;
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

  const cmsHero = getCmsSectionData(cmsPage ?? null, 'hero');
  const cmsHowItWorks = getCmsSectionData(cmsPage ?? null, 'how-it-works');
  const cmsDocumentationGrid = getCmsSectionData(cmsPage ?? null, 'documentation-grid');
  const cmsBundles = getCmsSectionData(cmsPage ?? null, 'bundles');
  const cmsWhyChoose = getCmsSectionData(cmsPage ?? null, 'why-choose');
  const cmsCta = getCmsSectionData(cmsPage ?? null, 'cta');

  const heroTitleLine1 = cmsHero.title_line1 || cmsHero.title || t('hero.title.line1');
  const heroTitleLine2 = cmsHero.title_line2 || t('hero.title.line2');
  const heroAccent = cmsHero.accent || t('hero.title.accent');
  const heroKicker = cmsHero.kicker || t('hero.kicker');
  const heroSubtitle = cmsHero.subtitle || t('hero.subtitle');
  const heroActionCards = Array.isArray(cmsHero.quick_links) && cmsHero.quick_links.length
    ? cmsHero.quick_links
    : [
        { title: t('hero.cat.audits.title'), subtitle: t('hero.cat.audits.subtitle'), url: '#audits-checklists', icon: 'shield' },
        { title: t('hero.cat.docs.title'), subtitle: t('hero.cat.docs.subtitle'), url: '#documentation', icon: 'document' },
        { title: t('hero.cat.plans.title'), subtitle: t('hero.cat.plans.subtitle'), url: '#plans', icon: 'stack' },
      ];

  const howTitle = cmsHowItWorks.title || t('how.title');
  const howSubtitle = cmsHowItWorks.subtitle || t('how.subtitle');
  const howSteps = Array.isArray(cmsHowItWorks.steps) && cmsHowItWorks.steps.length
    ? cmsHowItWorks.steps
    : [
        { title: t('how.step1.title'), body: t('how.step1.body') },
        { title: t('how.step2.title'), body: t('how.step2.body') },
        { title: t('how.step3.title'), body: t('how.step3.body') },
        { title: t('how.step4.title'), body: t('how.step4.body') },
      ];

  const auditsTitle = cmsDocumentationGrid.audits_title || t('audits.title');
  const auditsSubtitle = cmsDocumentationGrid.audits_subtitle || t('audits.subtitle');
  const documentationTitle =
    cmsDocumentationGrid.documentation_title || cmsDocumentationGrid.title || t('documentation.title');
  const documentationSubtitle =
    cmsDocumentationGrid.documentation_subtitle || cmsDocumentationGrid.subtitle || t('documentation.subtitle');
  const plansTitle = cmsBundles.title || t('plans.title');
  const plansSubtitle = cmsBundles.subtitle || t('plans.subtitle');
  const whyTitle = cmsWhyChoose.title || t('why.title');
  const whyPoints = Array.isArray(cmsWhyChoose.points) && cmsWhyChoose.points.length
    ? cmsWhyChoose.points
    : [t('why.0'), t('why.1'), t('why.2'), t('why.3'), t('why.4')];
  const ctaTitle = cmsCta.title || t('cta.title');
  const ctaSubtitle = cmsCta.subtitle || t('cta.subtitle');
  const ctaButtons = Array.isArray(cmsCta.buttons) && cmsCta.buttons.length
    ? cmsCta.buttons
    : [
        { text: t('cta.viewDetails'), url: '/products/audit-readiness-checklist' },
        { text: t('cta.createAccount'), url: '/register' },
      ];

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(4, 9, 22, 0.56), rgba(4, 9, 22, 0.72)), url(${heroBackground.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      <section className="px-4 py-8 text-white md:py-10" style={heroStyle}>
        <div className="mx-auto grid min-h-[400px] w-full max-w-6xl items-start gap-5 sm:min-h-[420px] md:gap-7 lg:min-h-[440px] lg:max-w-5xl lg:grid-cols-2 lg:items-center lg:gap-8 xl:max-w-6xl 2xl:max-w-[90rem]">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#5ea2ff] motion-safe:animate-fade-in motion-safe:delay-75">
              {heroKicker}
            </p>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight motion-safe:animate-fade-in-up motion-safe:delay-100 md:text-5xl">
              {heroTitleLine1}
              <br />
              {heroTitleLine2} <span className="text-[#2f7dff]">{heroAccent}</span>
            </h1>
            <p className="max-w-xl text-lg text-[#d4e2f6] motion-safe:animate-fade-in-up motion-safe:delay-200 md:text-xl">
              {heroSubtitle}
            </p>
            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
              {heroActionCards.map((card, index) => (
                <a
                  key={`${card.title}-${index}`}
                  href={card.url}
                  className="group inline-flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 px-3 py-2.5 text-left transition-colors hover:bg-[#143264] sm:min-w-[200px] sm:flex-initial"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1f3a6d] text-[#9ac3ff]">
                    {card.icon === 'document' ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                        <path d="M8 4h8l2 2v14H6V6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="M9 4v3h6V4M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    ) : card.icon === 'stack' ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                        <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                        <path d="M12 3l8 4v5c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V7l8-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold text-white">{card.title}</span>
                    <span className="text-xs text-[#a9c0e6]">{card.subtitle}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] lg:max-w-[640px] lg:justify-self-end motion-safe:animate-fade-in-right motion-safe:delay-150">
            <div className="overflow-hidden rounded-2xl border border-[#325a99]/80 bg-[#edf1f9] text-[#152948] shadow-[0_24px_70px_rgba(0,0,0,0.55)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_28px_80px_rgba(0,0,0,0.5)]">
              <div className="grid md:grid-cols-[180px_1fr]">
                <aside className="h-full bg-[#0b1a39] p-2.5 text-[#dce8ff]">
                  <p className="mb-2 text-sm font-semibold">{t('mock.brand')}</p>
                  <ul className="space-y-1.5 text-xs">
                    <li className="rounded-md px-2 py-1.5 text-[#a0b4d5]">{t('mock.nav.dashboard')}</li>
                    <li className="rounded-md bg-[#17376d] px-2 py-1.5">{t('mock.nav.checklist')}</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a0b4d5]">{t('mock.nav.evidence')}</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a0b4d5]">{t('mock.nav.reports')}</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a0b4d5]">{t('mock.nav.settings')}</li>
                  </ul>
                </aside>
                <div className="p-3 text-[#1f3253]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4e6c96]">{t('mock.library')}</p>
                  <div className="mt-2 space-y-1.5">
                    {(auditGridItems.length > 0
                      ? auditGridItems.slice(0, 4).map((item) => item.checklist.title)
                      : displayDocSections.slice(0, 4).map((doc) => doc.name)
                    ).map((name) => (
                      <div key={name} className="rounded-lg border border-[#e2e8f4] bg-white p-2.5 text-sm">
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6 md:px-6 md:py-14 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 md:p-6">
          <div className="grid gap-3 md:grid-cols-[1.1fr_3fr]">
            <div>
              <h3 className="text-3xl font-semibold text-[#1a2440]">{howTitle}</h3>
              <p className="mt-2 text-sm text-[#5e7293]">{howSubtitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {howSteps.map((step: any, index: number) => (
                <div key={`${step.title}-${index}`} className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                  <p className="text-sm font-semibold text-[#1f355d]">{step.title}</p>
                  <p className="mt-1 text-xs text-[#5e7293]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <section id="audits-checklists" className="space-y-4 scroll-mt-24">
          <div>
            <h3 className="text-4xl font-semibold text-[#1a2440]">{auditsTitle}</h3>
            <p className="mt-2 max-w-3xl text-base text-[#5e7293]">{auditsSubtitle}</p>
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
                const { checklist, slug } = item;
                const labels = priceLabels(t);
                const priceLabel = formatChecklistPrice(checklist.pricing, locale, labels);
                const iconKind = pickAuditIconKind(checklist.checklist_type?.code, index);
                const iconTheme = AUDIT_ICON_THEMES[iconKind];
                const href = (slug ? `/products/${encodeURIComponent(slug)}` : buildAuditProductHref(checklist.id)) as Route;
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
                        {t('cta.viewDetails')}
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

        <section id="documentation" className="space-y-4 scroll-mt-24">
          <div>
            <h3 className="text-4xl font-semibold text-[#1a2440]">{documentationTitle}</h3>
            <p className="mt-2 max-w-3xl text-base text-[#5e7293]">{documentationSubtitle}</p>
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
                        {t('cta.viewDetails')}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section id="plans" className="space-y-4 scroll-mt-24">
          <div>
            <h3 className="text-4xl font-semibold text-[#1a2440]">{plansTitle}</h3>
            <p className="mt-2 max-w-3xl text-base text-[#5e7293]">{plansSubtitle}</p>
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
                    <span className={PRODUCT_CARD_OUTLINE_CTA_CLASS}>{t('cta.viewDetails')}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md md:p-6">
          <h3 className="text-3xl font-semibold text-[#1f3a31]">{whyTitle}</h3>
          <ul className="mt-4 grid gap-2.5 text-base leading-7 text-[#2f7f57] md:grid-cols-2">
            {whyPoints.map((point: any, index: number) => (
              <li key={`${point}-${index}`} className="flex items-center gap-2.5"><CheckBadgeIcon />{point}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-[#17489b] bg-[linear-gradient(90deg,#0b2f73,#0e3f9d)] p-5 text-white transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:hover:shadow-[0_18px_34px_rgba(17,62,148,0.28)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-semibold">{ctaTitle}</h3>
              <p className="mt-1 text-sm text-[#d2e2ff]">{ctaSubtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {ctaButtons.map((button: any, index: number) => (
                <a
                  key={`${button.text}-${index}`}
                  href={button.url}
                  className={`rounded-xl border px-5 py-2.5 font-semibold transition-colors duration-200 active:scale-[0.98] motion-safe:active:transition-transform ${
                    index === 0
                      ? 'border-white/35 bg-white text-[#123e8b] hover:bg-[#e9f1ff]'
                      : 'border-[#1f7bff] bg-[#1f7bff] text-white hover:bg-[#2e87ff]'
                  }`}
                >
                  {button.text}
                </a>
              ))}
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

  return <ProductsPageContent cmsPage={page} />;
}

export default ProductsPageWithCMS;
