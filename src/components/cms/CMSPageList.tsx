'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2, Edit, Eye, EyeOff, Search } from 'lucide-react';
import {
  getAllPages,
  deletePage,
  togglePublishPage,
  getPageBySlug,
  updatePage,
  updateSection,
  type PageDetail,
  type PageSection,
} from '@/lib/api/cms-api';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';
import { toast } from 'sonner';
import { translate, useLocale } from '@/lib/i18n';
import { adminCmsMessages } from '@/locales/admin-cms';
import { CustomDropdown } from '@/components/admin/CustomDropdown';
import { applyStringFieldUpdates, flattenStringFields } from '@/lib/cms-section-string-fields';
import {
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_TITLE_CLASS,
} from '@/app/(app)/admin/admin-page-title';

interface PageListItem {
  id: string;
  slug: string;
  language: string;
  title: string;
  status: 'draft' | 'published';
  updated_at: string;
  content_type: string;
}

type PageGroup = {
  slug: string;
  cs: PageListItem | null;
  en: PageListItem | null;
  other: PageListItem[];
};

type SectionPair = {
  order: number;
  type: string;
  cs?: PageSection;
  en?: PageSection;
};

function contentTypeLabel(locale: 'en' | 'cs', raw: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    standard: 'editor.contentType.standard',
    hero: 'editor.contentType.hero',
    product_catalog: 'editor.contentType.product_catalog',
    faq: 'editor.contentType.faq',
    legal: 'editor.contentType.legal',
  };
  const key = map[raw];
  return key ? t(key) : raw;
}

function sectionTypeLabel(type: string, t: (key: string) => string): string {
  const key = `sectionType.${type}.label`;
  const out = t(key);
  if (out !== key) return out;
  return type.replace(/-/g, ' ').replace(/_/g, ' ');
}

function pairKey(order: number, type: string) {
  return `${order}:${type}`;
}

function buildSectionPairs(cs: PageDetail | null, en: PageDetail | null): [string, SectionPair][] {
  const map = new Map<string, SectionPair>();
  for (const s of [...(cs?.sections ?? [])].sort((a, b) => a.order - b.order)) {
    const k = pairKey(s.order, s.section_type);
    map.set(k, { order: s.order, type: s.section_type, cs: s });
  }
  for (const s of [...(en?.sections ?? [])].sort((a, b) => a.order - b.order)) {
    const k = pairKey(s.order, s.section_type);
    const cur = map.get(k);
    map.set(k, { order: s.order, type: s.section_type, cs: cur?.cs, en: s });
  }
  return [...map.entries()]
    .filter(([, v]) => v.cs || v.en)
    .sort((a, b) => a[1].order - b[1].order || a[1].type.localeCompare(b[1].type));
}

function buildGroups(pages: PageListItem[]): PageGroup[] {
  const bySlug = new Map<string, PageListItem[]>();
  for (const p of pages) {
    const list = bySlug.get(p.slug) ?? [];
    list.push(p);
    bySlug.set(p.slug, list);
  }
  const groups: PageGroup[] = [];
  for (const [slug, items] of bySlug) {
    const cs = items.find((i) => i.language === 'cs') ?? null;
    const en = items.find((i) => i.language === 'en') ?? null;
    const other = items.filter((i) => i.language !== 'cs' && i.language !== 'en');
    groups.push({ slug, cs, en, other });
  }
  groups.sort((a, b) => a.slug.localeCompare(b.slug));
  return groups;
}

export function CMSPageList() {
  const { locale } = useLocale();
  const t = useCallback(
    (key: string, values?: Record<string, string>) => translate(adminCmsMessages, locale, key, values),
    [locale],
  );
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [slugFilter, setSlugFilter] = useState('');
  const [sectionKey, setSectionKey] = useState('');
  const [detailCs, setDetailCs] = useState<PageDetail | null>(null);
  const [detailEn, setDetailEn] = useState<PageDetail | null>(null);
  const [pageDetailLoading, setPageDetailLoading] = useState(false);
  const [editCs, setEditCs] = useState<Record<string, string>>({});
  const [editEn, setEditEn] = useState<Record<string, string>>({});
  const [savingTranslations, setSavingTranslations] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draftCsTitle, setDraftCsTitle] = useState('');
  const [draftEnTitle, setDraftEnTitle] = useState('');
  const [savingTitles, setSavingTitles] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PageListItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPages(undefined, undefined, 0, 500);
      setPages(data.items as PageListItem[]);
    } catch (error) {
      toast.error(t('toast.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  const loadSlugDetails = useCallback(async (slug: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) : null;
    const [csRes, enRes] = await Promise.allSettled([
      getPageBySlug(slug, 'cs', token),
      getPageBySlug(slug, 'en', token),
    ]);
    setDetailCs(csRes.status === 'fulfilled' ? csRes.value : null);
    setDetailEn(enRes.status === 'fulfilled' ? enRes.value : null);
  }, []);

  useEffect(() => {
    setSectionKey('');
    if (!slugFilter) {
      setDetailCs(null);
      setDetailEn(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setPageDetailLoading(true);
      try {
        await loadSlugDetails(slugFilter);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setPageDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slugFilter, loadSlugDetails]);

  useEffect(() => {
    if (!pendingDelete) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPendingDelete(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pendingDelete]);

  const sectionPairs = useMemo(() => buildSectionPairs(detailCs, detailEn), [detailCs, detailEn]);

  useEffect(() => {
    if (!sectionKey) return;
    if (!sectionPairs.some(([k]) => k === sectionKey)) setSectionKey('');
  }, [sectionPairs, sectionKey]);

  const sectionOptions = useMemo(
    () => [
      { value: '', label: t('translationList.allSections') },
      ...sectionPairs.map(([key, pair]) => ({
        value: key,
        label: `${pair.order + 1}. ${sectionTypeLabel(pair.type, t)}`,
      })),
    ],
    [sectionPairs, t],
  );

  const activeSection = useMemo(() => {
    if (!sectionKey) return null;
    const hit = sectionPairs.find(([k]) => k === sectionKey);
    return hit ? hit[1] : null;
  }, [sectionPairs, sectionKey]);

  useEffect(() => {
    if (!activeSection) {
      setEditCs({});
      setEditEn({});
      return;
    }
    const d0 = (activeSection.cs?.data as Record<string, unknown>) ?? {};
    const d1 = (activeSection.en?.data as Record<string, unknown>) ?? {};
    setEditCs(Object.fromEntries(flattenStringFields(d0).map((x) => [x.path, x.value])));
    setEditEn(Object.fromEntries(flattenStringFields(d1).map((x) => [x.path, x.value])));
  }, [activeSection]);

  const translationPaths = useMemo(() => {
    const paths = new Set<string>([...Object.keys(editCs), ...Object.keys(editEn)]);
    return [...paths].sort((a, b) => a.localeCompare(b));
  }, [editCs, editEn]);

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages.filter((item) => {
      if (slugFilter && item.slug !== slugFilter) return false;
      if (!q) return true;
      const typeLabel = contentTypeLabel(locale, item.content_type, t).toLowerCase();
      return (
        item.slug.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.content_type.toLowerCase().includes(q) ||
        typeLabel.includes(q)
      );
    });
  }, [pages, search, slugFilter, locale, t]);

  const grouped = useMemo(() => buildGroups(filteredPages), [filteredPages]);

  const slugOptions = useMemo(() => {
    const slugs = [...new Set(pages.map((p) => p.slug))].sort((a, b) => a.localeCompare(b));
    return [{ value: '', label: t('translationList.allPages') }, ...slugs.map((s) => ({ value: s, label: s }))];
  }, [pages, t]);

  const languageCount = useMemo(() => new Set(filteredPages.map((p) => p.language)).size, [filteredPages]);

  const confirmDeletePage = async () => {
    if (!pendingDelete) return;
    setDeleteSubmitting(true);
    try {
      await deletePage(pendingDelete.id);
      toast.success(t('toast.deleteSuccess'));
      setPendingDelete(null);
      void loadPages();
      if (slugFilter === pendingDelete.slug) void loadSlugDetails(slugFilter);
    } catch (error) {
      toast.error(t('toast.deleteError'));
      console.error(error);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleTogglePublish = async (pageId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await togglePublishPage(pageId, newStatus as 'draft' | 'published');
      toast.success(newStatus === 'published' ? t('toast.published') : t('toast.unpublished'));
      void loadPages();
      if (slugFilter) void loadSlugDetails(slugFilter);
    } catch (error) {
      toast.error(t('toast.toggleError'));
      console.error(error);
    }
  };

  const handleSaveTranslations = async () => {
    if (!activeSection || !slugFilter) return;
    setSavingTranslations(true);
    try {
      const baseCs = (activeSection.cs?.data as Record<string, unknown>) ?? {};
      const baseEn = (activeSection.en?.data as Record<string, unknown>) ?? {};
      const nextCs = applyStringFieldUpdates(baseCs, editCs);
      const nextEn = applyStringFieldUpdates(baseEn, editEn);
      const tasks: Promise<unknown>[] = [];
      if (activeSection.cs) tasks.push(updateSection(activeSection.cs.id, { data: nextCs }));
      if (activeSection.en) tasks.push(updateSection(activeSection.en.id, { data: nextEn }));
      if (tasks.length === 0) {
        toast.error(t('translationList.translationsSaveError'));
        return;
      }
      await Promise.all(tasks);
      toast.success(t('translationList.translationsSaved'));
      await loadSlugDetails(slugFilter);
    } catch (error) {
      toast.error(t('translationList.translationsSaveError'));
      console.error(error);
    } finally {
      setSavingTranslations(false);
    }
  };

  const openTitleEdit = (g: PageGroup) => {
    setEditingSlug(g.slug);
    setDraftCsTitle(g.cs?.title ?? '');
    setDraftEnTitle(g.en?.title ?? '');
  };

  const cancelTitleEdit = () => {
    setEditingSlug(null);
  };

  const handleSaveTitles = async (g: PageGroup) => {
    if (editingSlug !== g.slug) return;
    const csTrim = draftCsTitle.trim();
    const enTrim = draftEnTitle.trim();
    if (g.cs && !csTrim) {
      toast.error(t('translationList.titleRequired'));
      return;
    }
    if (g.en && !enTrim) {
      toast.error(t('translationList.titleRequired'));
      return;
    }
    setSavingTitles(true);
    try {
      const tasks: Promise<unknown>[] = [];
      if (g.cs && csTrim !== g.cs.title) tasks.push(updatePage(g.cs.id, { title: csTrim }));
      if (g.en && enTrim !== g.en.title) tasks.push(updatePage(g.en.id, { title: enTrim }));
      if (tasks.length === 0) {
        setEditingSlug(null);
        return;
      }
      await Promise.all(tasks);
      toast.success(t('translationList.titlesSaved'));
      setEditingSlug(null);
      void loadPages();
      if (slugFilter === g.slug) void loadSlugDetails(g.slug);
    } catch (error) {
      toast.error(t('translationList.titlesSaveError'));
      console.error(error);
    } finally {
      setSavingTitles(false);
    }
  };

  const dateFmt = locale === 'cs' ? 'cs-CZ' : 'en-US';

  const badgeTypesForGroup = (g: PageGroup): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of [g.cs, g.en, ...g.other]) {
      if (!p) continue;
      const raw = p.content_type;
      const ct = typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();
      if (!ct || seen.has(ct)) continue;
      seen.add(ct);
      out.push(ct);
    }
    return out;
  };

  function LangColumn({
    label,
    flag,
    row,
    editingTitle,
    titleValue,
    onTitleChange,
  }: {
    label: string;
    flag: string;
    row: PageListItem | null;
    editingTitle: boolean;
    titleValue: string;
    onTitleChange: (value: string) => void;
  }) {
    if (!row) {
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#6f82a3]">
            <span className="text-base" aria-hidden>
              {flag}
            </span>
            {label}
          </div>
          <p className="min-h-[36px] border border-dashed border-[#dbe4f4] py-2 text-sm italic text-[#9aa8c4]">
            {t('translationList.missingLocale')}
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#6f82a3]">
          <span className="text-base" aria-hidden>
            {flag}
          </span>
          {label}
        </div>
        {editingTitle ? (
          <textarea
            value={titleValue}
            onChange={(e) => onTitleChange(e.target.value)}
            rows={2}
            className="min-h-[44px] w-full resize-y rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[15px] leading-relaxed text-[#1f2d45] outline-none focus:border-[#7ea6e7]"
            aria-label={`${label} ${t('editor.field.title')}`}
          />
        ) : (
          <p className="min-h-[36px] text-[15px] leading-relaxed text-[#1f2d45]">{row.title}</p>
        )}
        <p className="text-xs text-[#6f82a3]">{t('translationList.updated', { date: new Date(row.updated_at).toLocaleDateString(dateFmt) })}</p>
        <div className="flex flex-wrap items-center gap-1 pt-1">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${
              row.status === 'published'
                ? 'border-[#b8e0c8] bg-[#e8f4ec] text-[#1d6b45]'
                : 'border-[#cfe0ff] bg-[#edf4ff] text-[#2d5599]'
            }`}
          >
            {t(`status.${row.status}`)}
          </span>
          <button
            type="button"
            onClick={() => handleTogglePublish(row.id, row.status)}
            title={row.status === 'published' ? t('actions.unpublish') : t('actions.publish')}
            className="inline-flex rounded-md p-1.5 text-[#5b6f91] transition-colors hover:bg-[#eef2fa] hover:text-[#2a3d5f]"
          >
            {row.status === 'published' ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            title={t('actions.delete')}
            className="inline-flex rounded-md p-1.5 text-[#c44f5f] transition-colors hover:bg-[#fff1f3] hover:text-[#a73a46]"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-0 text-[#182843]">
      <h2 className="sr-only">{t('translationList.srOnly')}</h2>

      <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-transparent px-4 pb-4 pt-1 md:-mx-5 md:px-5">
        <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
          <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>{t('list.heroEyebrow')}</p>
          <h1 className={ADMIN_PAGE_HERO_TITLE_CLASS}>{t('translationList.title')}</h1>
          <div className="mt-2 flex flex-wrap gap-6 text-sm text-[#c4d6f7]">
            <span>
              <span className="mr-1 font-semibold text-white">{loading ? '—' : grouped.length}</span>
              {t('translationList.statPages')}
            </span>
            <span>
              <span className="mr-1 font-semibold text-white">{loading ? '—' : languageCount}</span>
              {t('translationList.statLanguages')}
            </span>
          </div>
        </header>

        <div className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9aa8c4]" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('translationList.searchPlaceholder')}
              className="w-full rounded-xl border border-[#d4dced] bg-white py-2 pl-10 pr-3 text-sm text-[#1f2d45] outline-none ring-[#7ea6e7] placeholder:text-[#9aa8c4] focus:border-[#7ea6e7] focus:ring-1"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#607594]">{t('translationList.filterPage')}</span>
            <div className="min-w-[140px] flex-1 sm:max-w-[240px]">
              <CustomDropdown
                value={slugFilter}
                onChange={setSlugFilter}
                placeholder={t('translationList.allPages')}
                options={slugOptions}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#607594]">{t('translationList.filterSection')}</span>
            <div className="min-w-[180px] flex-1 sm:max-w-[280px]">
              <CustomDropdown
                value={sectionKey}
                onChange={setSectionKey}
                placeholder={slugFilter ? t('translationList.allSections') : t('translationList.pickPageFirst')}
                options={sectionOptions}
                disabled={!slugFilter || pageDetailLoading}
              />
            </div>
            {pageDetailLoading && slugFilter ? (
              <span className="text-xs text-[#6f82a3]">{t('translationList.loadingSections')}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="w-full py-6">
        {slugFilter ? (
          <div className="mb-6">
            {!sectionKey ? (
              <p className="rounded-xl border border-dashed border-[#cfd8ea] bg-[#f9fbff] px-4 py-3 text-sm text-[#607594]">{t('translationList.chooseSection')}</p>
            ) : activeSection ? (
              <div className="rounded-xl border border-[#7ea6e7] bg-[#f5f8ff] p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-[#1f2d45]">
                    {t('translationList.sectionStringsTitle')}
                    <span className="ml-2 font-mono text-sm font-normal text-[#607594]">
                      ({sectionTypeLabel(activeSection.type, t)})
                    </span>
                  </h3>
                  <button
                    type="button"
                    disabled={savingTranslations || translationPaths.length === 0}
                    onClick={() => void handleSaveTranslations()}
                    className="rounded-lg bg-[#1f2d45] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingTranslations ? t('translationList.savingTranslations') : t('translationList.saveTranslations')}
                  </button>
                </div>
                {translationPaths.length === 0 ? (
                  <p className="text-sm text-[#607594]">{t('translationList.noStringFields')}</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-[#dbe4f4] bg-white">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="border-b border-[#eef2fa] bg-[#f7f9fe]">
                        <tr>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#5b6f91]">{t('translationList.fieldPath')}</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#5b6f91]">{t('editor.lang.cs')}</th>
                          <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#5b6f91]">{t('editor.lang.en')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eef2fa]">
                        {translationPaths.map((path) => (
                          <tr key={`${sectionKey}-${path}`}>
                            <td className="align-top px-3 py-2 font-mono text-xs text-[#425f8f]">{path}</td>
                            <td className="px-3 py-2">
                              <textarea
                                value={editCs[path] ?? ''}
                                onChange={(e) => setEditCs((prev) => ({ ...prev, [path]: e.target.value }))}
                                rows={2}
                                className="w-full min-h-[44px] resize-y rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#1f2d45] outline-none focus:border-[#7ea6e7]"
                                disabled={!activeSection.cs}
                                aria-label={`${t('editor.lang.cs')} ${path}`}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <textarea
                                value={editEn[path] ?? ''}
                                onChange={(e) => setEditEn((prev) => ({ ...prev, [path]: e.target.value }))}
                                rows={2}
                                className="w-full min-h-[44px] resize-y rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#1f2d45] outline-none focus:border-[#7ea6e7]"
                                disabled={!activeSection.en}
                                aria-label={`${t('editor.lang.en')} ${path}`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-[#e2e8f5] bg-white px-6 py-16 text-center text-sm font-medium text-[#607594]">{t('loading')}</div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-[#e2e8f5] bg-white px-8 py-16 text-center text-[#607594]">
            <Search className="mb-4 h-12 w-12 opacity-30" aria-hidden />
            <p className="text-sm">{pages.length === 0 ? t('empty') : t('translationList.emptySearch')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {grouped.map((g) => {
              const types = badgeTypesForGroup(g);
              return (
                <article
                  key={g.slug}
                  className={`rounded-xl border bg-white p-4 pr-5 transition-colors sm:p-5 ${
                    editingSlug === g.slug ? 'border-[#7ea6e7] bg-[#f5f8ff]' : 'border-[#e2e8f5] hover:border-[#cfd8ea]'
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <code className="rounded bg-[#f1f4fb] px-2 py-1 font-mono text-[13px] text-[#425f8f]">{g.slug}</code>
                      {types.map((ct, idx) => (
                        <span
                          key={`${g.slug}-content-type-${idx}-${ct}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#f1f4fb] px-2 py-0.5 text-[11px] text-[#607594]"
                        >
                          {contentTypeLabel(locale, ct, t)}
                        </span>
                      ))}
                      {g.other.length > 0 ? (
                        <span className="inline-flex rounded-xl bg-[#fff8e6] px-2 py-0.5 text-[11px] font-medium text-[#8a6d1d]">
                          {t('translationList.moreLocales', { count: String(g.other.length) })}
                        </span>
                      ) : null}
                    </div>
                    {editingSlug === g.slug ? (
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={savingTitles}
                          onClick={() => void handleSaveTitles(g)}
                          className="rounded-lg bg-[#1f2d45] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          {savingTitles ? t('translationList.savingTitles') : t('translationList.saveTitles')}
                        </button>
                        <button
                          type="button"
                          disabled={savingTitles}
                          onClick={cancelTitleEdit}
                          className="rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm font-medium text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-50"
                        >
                          {t('editor.actions.cancel')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openTitleEdit(g)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-transparent p-2 text-[#3e69b0] transition-colors hover:border-[#d4dced] hover:bg-[#edf4ff] hover:text-[#1f4a8a]"
                      >
                        <Edit className="h-[18px] w-[18px]" aria-hidden />
                        <span className="text-sm font-medium">{t('actions.edit')}</span>
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <LangColumn
                      label={t('editor.lang.cs')}
                      flag="🇨🇿"
                      row={g.cs}
                      editingTitle={editingSlug === g.slug}
                      titleValue={draftCsTitle}
                      onTitleChange={setDraftCsTitle}
                    />
                    <LangColumn
                      label={t('editor.lang.en')}
                      flag="🇬🇧"
                      row={g.en}
                      editingTitle={editingSlug === g.slug}
                      titleValue={draftEnTitle}
                      onTitleChange={setDraftEnTitle}
                    />
                  </div>
                  {g.other.length > 0 ? (
                    <ul className="mt-3 border-t border-[#eef2fa] pt-3 text-sm text-[#607594]">
                      {g.other.map((row) => (
                        <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-1">
                          <span className="font-mono text-xs uppercase text-[#425f8f]">{row.language}</span>
                          <span className="min-w-0 flex-1 truncate font-medium text-[#1f2d45]">{row.title}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(row.id, row.status)}
                              title={row.status === 'published' ? t('actions.unpublish') : t('actions.publish')}
                              className="inline-flex rounded-md p-1.5 text-[#5b6f91] transition-colors hover:bg-[#eef2fa]"
                            >
                              {row.status === 'published' ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDelete(row)}
                              title={t('actions.delete')}
                              className="inline-flex rounded-md p-1.5 text-[#c44f5f] transition-colors hover:bg-[#fff1f3]"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4">
          <div
            className="w-full max-w-md rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-delete-modal-title"
          >
            <h2 id="cms-delete-modal-title" className="text-lg font-semibold text-[#1f2d45]">
              {t('modal.delete.title')}
            </h2>
            <p className="mt-2 text-sm text-[#607594]">
              {t('modal.delete.body', { title: pendingDelete.title, slug: pendingDelete.slug })}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleteSubmitting}
                className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
              >
                {t('modal.delete.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void confirmDeletePage()}
                disabled={deleteSubmitting}
                className="rounded-lg border border-[#d45f6b] bg-[#fff1f3] px-3 py-1.5 text-sm font-semibold text-[#a73a46] hover:bg-[#ffe6ea] disabled:opacity-60"
              >
                {deleteSubmitting ? t('modal.delete.deleting') : t('modal.delete.confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
