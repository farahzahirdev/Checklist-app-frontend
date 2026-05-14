"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Edit,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  getAllPages,
  togglePublishPage,
  getPageBySlug,
  updatePage,
  updateSection,
  type PageDetail,
  type PageSection,
} from "@/lib/api/cms-api";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/auth";
import { toast } from "sonner";
import { translate, useLocale } from "@/lib/i18n";
import { adminCmsMessages } from "@/locales/admin-cms";
import {
  applyStringFieldUpdates,
  flattenStringFields,
} from "@/lib/cms-section-string-fields";
import {
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_TITLE_CLASS,
} from "@/app/(app)/admin/admin-page-title";

interface PageListItem {
  id: string;
  slug: string;
  language: string;
  title: string;
  status: "draft" | "published";
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

function contentTypeLabel(
  locale: "en" | "cs",
  raw: string,
  t: (key: string) => string,
): string {
  const map: Record<string, string> = {
    standard: "editor.contentType.standard",
    hero: "editor.contentType.hero",
    product_catalog: "editor.contentType.product_catalog",
    faq: "editor.contentType.faq",
    legal: "editor.contentType.legal",
  };
  const key = map[raw];
  return key ? t(key) : raw;
}

function sectionTypeLabel(type: string, t: (key: string) => string): string {
  const key = `sectionType.${type}.label`;
  const out = t(key);
  if (out !== key) return out;
  return type.replace(/-/g, " ").replace(/_/g, " ");
}

function pairKey(order: number, type: string) {
  return `${order}:${type}`;
}

function buildSectionPairs(
  cs: PageDetail | null,
  en: PageDetail | null,
): [string, SectionPair][] {
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
    .sort(
      (a, b) => a[1].order - b[1].order || a[1].type.localeCompare(b[1].type),
    );
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
    const cs = items.find((i) => i.language === "cs") ?? null;
    const en = items.find((i) => i.language === "en") ?? null;
    const other = items.filter(
      (i) => i.language !== "cs" && i.language !== "en",
    );
    groups.push({ slug, cs, en, other });
  }
  groups.sort((a, b) => a.slug.localeCompare(b.slug));
  return groups;
}

export function CMSPageList() {
  const { locale } = useLocale();
  const t = useCallback(
    (key: string, values?: Record<string, string>) =>
      translate(adminCmsMessages, locale, key, values),
    [locale],
  );
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [slugFilter, setSlugFilter] = useState("home");
  const [expandedSectionKey, setExpandedSectionKey] = useState("");
  const [detailCs, setDetailCs] = useState<PageDetail | null>(null);
  const [detailEn, setDetailEn] = useState<PageDetail | null>(null);
  const [pageDetailLoading, setPageDetailLoading] = useState(false);
  const [editCs, setEditCs] = useState<Record<string, string>>({});
  const [editEn, setEditEn] = useState<Record<string, string>>({});
  const [savingTranslations, setSavingTranslations] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draftCsTitle, setDraftCsTitle] = useState("");
  const [draftEnTitle, setDraftEnTitle] = useState("");
  const [savingTitles, setSavingTitles] = useState(false);
  const sectionRowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPages(undefined, undefined, 0, 500);
      setPages(data.items as PageListItem[]);
    } catch (error) {
      toast.error(t("toast.loadError"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  useEffect(() => {
    if (loading || pages.length === 0) return;
    const slugs = [...new Set(pages.map((p) => p.slug))].sort((a, b) =>
      a.localeCompare(b),
    );
    if (slugs.length === 0) return;
    setSlugFilter((prev) =>
      slugs.includes(prev) ? prev : slugs.includes("home") ? "home" : slugs[0],
    );
  }, [loading, pages]);

  const loadSlugDetails = useCallback(async (slug: string) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
        : null;
    const [csRes, enRes] = await Promise.allSettled([
      getPageBySlug(slug, "cs", token),
      getPageBySlug(slug, "en", token),
    ]);
    setDetailCs(csRes.status === "fulfilled" ? csRes.value : null);
    setDetailEn(enRes.status === "fulfilled" ? enRes.value : null);
  }, []);

  useEffect(() => {
    setExpandedSectionKey("");
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

  const sectionPairs = useMemo(
    () => buildSectionPairs(detailCs, detailEn),
    [detailCs, detailEn],
  );

  useEffect(() => {
    if (!expandedSectionKey) return;
    if (!sectionPairs.some(([k]) => k === expandedSectionKey))
      setExpandedSectionKey("");
  }, [sectionPairs, expandedSectionKey]);

  const activeSection = useMemo(() => {
    if (!expandedSectionKey) return null;
    const hit = sectionPairs.find(([k]) => k === expandedSectionKey);
    return hit ? hit[1] : null;
  }, [sectionPairs, expandedSectionKey]);

  useEffect(() => {
    if (!activeSection) {
      setEditCs({});
      setEditEn({});
      return;
    }
    const d0 = (activeSection.cs?.data as Record<string, unknown>) ?? {};
    const d1 = (activeSection.en?.data as Record<string, unknown>) ?? {};
    setEditCs(
      Object.fromEntries(flattenStringFields(d0).map((x) => [x.path, x.value])),
    );
    setEditEn(
      Object.fromEntries(flattenStringFields(d1).map((x) => [x.path, x.value])),
    );
  }, [activeSection]);

  useLayoutEffect(() => {
    if (!expandedSectionKey) return;
    const el = sectionRowRefs.current.get(expandedSectionKey);
    if (!el) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [expandedSectionKey]);

  const translationPaths = useMemo(() => {
    const paths = new Set<string>([
      ...Object.keys(editCs),
      ...Object.keys(editEn),
    ]);
    return [...paths].sort((a, b) => a.localeCompare(b));
  }, [editCs, editEn]);

  const filteredPages = useMemo(
    () => pages.filter((item) => !slugFilter || item.slug === slugFilter),
    [pages, slugFilter],
  );

  const grouped = useMemo(() => buildGroups(filteredPages), [filteredPages]);

  const pageTabSlugs = useMemo(
    () =>
      [...new Set(pages.map((p) => p.slug))].sort((a, b) => a.localeCompare(b)),
    [pages],
  );

  const languageCount = useMemo(
    () => new Set(filteredPages.map((p) => p.language)).size,
    [filteredPages],
  );

  const handleTogglePublish = async (pageId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      await togglePublishPage(pageId, newStatus as "draft" | "published");
      toast.success(
        newStatus === "published"
          ? t("toast.published")
          : t("toast.unpublished"),
      );
      void loadPages();
      if (slugFilter) void loadSlugDetails(slugFilter);
    } catch (error) {
      toast.error(t("toast.toggleError"));
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
      if (activeSection.cs)
        tasks.push(updateSection(activeSection.cs.id, { data: nextCs }));
      if (activeSection.en)
        tasks.push(updateSection(activeSection.en.id, { data: nextEn }));
      if (tasks.length === 0) {
        toast.error(t("translationList.translationsSaveError"));
        return;
      }
      await Promise.all(tasks);
      toast.success(t("translationList.translationsSaved"));
      await loadSlugDetails(slugFilter);
    } catch (error) {
      toast.error(t("translationList.translationsSaveError"));
      console.error(error);
    } finally {
      setSavingTranslations(false);
    }
  };

  const cancelTranslationEdit = useCallback(() => {
    setExpandedSectionKey("");
  }, []);

  const openTitleEdit = (g: PageGroup) => {
    setEditingSlug(g.slug);
    setDraftCsTitle(g.cs?.title ?? "");
    setDraftEnTitle(g.en?.title ?? "");
  };

  const cancelTitleEdit = () => {
    setEditingSlug(null);
  };

  const handleSaveTitles = async (g: PageGroup) => {
    if (editingSlug !== g.slug) return;
    const csTrim = draftCsTitle.trim();
    const enTrim = draftEnTitle.trim();
    if (g.cs && !csTrim) {
      toast.error(t("translationList.titleRequired"));
      return;
    }
    if (g.en && !enTrim) {
      toast.error(t("translationList.titleRequired"));
      return;
    }
    setSavingTitles(true);
    try {
      const tasks: Promise<unknown>[] = [];
      if (g.cs && csTrim !== g.cs.title)
        tasks.push(updatePage(g.cs.id, { title: csTrim }));
      if (g.en && enTrim !== g.en.title)
        tasks.push(updatePage(g.en.id, { title: enTrim }));
      if (tasks.length === 0) {
        setEditingSlug(null);
        return;
      }
      await Promise.all(tasks);
      toast.success(t("translationList.titlesSaved"));
      setEditingSlug(null);
      void loadPages();
      if (slugFilter === g.slug) void loadSlugDetails(g.slug);
    } catch (error) {
      toast.error(t("translationList.titlesSaveError"));
      console.error(error);
    } finally {
      setSavingTitles(false);
    }
  };

  const dateFmt = locale === "cs" ? "cs-CZ" : "en-US";

  const badgeTypesForGroup = (g: PageGroup): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of [g.cs, g.en, ...g.other]) {
      if (!p) continue;
      const raw = p.content_type;
      const ct =
        typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
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
            {t("translationList.missingLocale")}
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
            aria-label={`${label} ${t("editor.field.title")}`}
          />
        ) : (
          <p className="min-h-[36px] text-[15px] leading-relaxed text-[#1f2d45]">
            {row.title}
          </p>
        )}
        <p className="text-xs text-[#6f82a3]">
          {t("translationList.updated", {
            date: new Date(row.updated_at).toLocaleDateString(dateFmt),
          })}
        </p>
        <div className="flex flex-wrap items-center gap-1 pt-1">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${
              row.status === "published"
                ? "border-[#b8e0c8] bg-[#e8f4ec] text-[#1d6b45]"
                : "border-[#cfe0ff] bg-[#edf4ff] text-[#2d5599]"
            }`}
          >
            {t(`status.${row.status}`)}
          </span>
          <button
            type="button"
            onClick={() => handleTogglePublish(row.id, row.status)}
            title={
              row.status === "published"
                ? t("actions.unpublish")
                : t("actions.publish")
            }
            className="inline-flex rounded-md p-1.5 text-[#5b6f91] transition-colors hover:bg-[#eef2fa] hover:text-[#2a3d5f]"
          >
            {row.status === "published" ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-0 text-[#182843]">
      <h2 className="sr-only">{t("translationList.srOnly")}</h2>

      <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-transparent px-4 pb-4 pt-1 md:-mx-5 md:px-5">
        <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
          <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>
            {t("list.heroEyebrow")}
          </p>
          <h1 className={ADMIN_PAGE_HERO_TITLE_CLASS}>
            {t("translationList.title")}
          </h1>
          <div className="mt-2 flex flex-wrap gap-6 text-sm text-[#c4d6f7]">
            <span>
              <span className="mr-1 font-semibold text-white">
                {loading ? "—" : pageTabSlugs.length}
              </span>
              {t("translationList.statPages")}
            </span>
            <span>
              <span className="mr-1 font-semibold text-white">
                {loading ? "—" : languageCount}
              </span>
              {t("translationList.statLanguages")}
            </span>
          </div>
        </header>

        <nav
          className="flex w-full gap-1 overflow-x-auto rounded-2xl border border-[#e2e8f5] bg-white px-2 py-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={t("translationList.filterPage")}
        >
          {loading ? (
            <span className="px-3 py-2 text-sm text-[#607594]">—</span>
          ) : pageTabSlugs.length === 0 ? (
            <span className="px-3 py-2 text-sm text-[#607594]">—</span>
          ) : (
            pageTabSlugs.map((slug) => {
              const selected = slugFilter === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setSlugFilter(slug)}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    selected
                      ? "bg-[#1f2d45] text-white shadow-sm"
                      : "text-[#425f8f] hover:bg-[#f1f4fb]"
                  }`}
                >
                  {slug}
                </button>
              );
            })
          )}
        </nav>
      </div>

      <div className="w-full py-6">
        {slugFilter ? (
          <div className="mb-8">
            {pageDetailLoading ? (
              <p className="rounded-xl border border-dashed border-[#cfd8ea] bg-[#f9fbff] px-4 py-3 text-sm text-[#607594]">
                {t("translationList.loadingSections")}
              </p>
            ) : sectionPairs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#cfd8ea] bg-[#f9fbff] px-4 py-3 text-sm text-[#607594]">
                {t("editor.sections.none")}
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#607594]">
                  {t("editor.sections.heading")}
                </p>
                <div className="flex w-full flex-col gap-3">
                  {sectionPairs.map(([key, pair]) => {
                    const expanded = expandedSectionKey === key;
                    return (
                      <div
                        key={key}
                        ref={(el) => {
                          if (el) sectionRowRefs.current.set(key, el);
                          else sectionRowRefs.current.delete(key);
                        }}
                        className="flex scroll-mt-36 flex-col gap-2"
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-expanded={expanded}
                          aria-selected={expanded}
                          onClick={() =>
                            setExpandedSectionKey((cur) =>
                              cur === key ? "" : key,
                            )
                          }
                          className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                            expanded
                              ? "border-[#1f2d45] bg-[#1f2d45] text-white"
                              : "border-[#dbe4f4] bg-white text-[#1f2d45] hover:border-[#7ea6e7] hover:bg-[#f5f8ff]"
                          }`}
                        >
                          {expanded ? (
                            <ChevronDown
                              className="h-4 w-4 shrink-0"
                              aria-hidden
                            />
                          ) : (
                            <ChevronRight
                              className="h-4 w-4 shrink-0"
                              aria-hidden
                            />
                          )}
                          <span className="min-w-0 flex-1">
                            {sectionTypeLabel(pair.type, t)}
                          </span>
                        </button>
                        {expanded ? (
                          <div
                            role="tabpanel"
                            className="rounded-xl border border-[#7ea6e7] bg-[#f5f8ff] p-4 sm:p-5"
                          >
                            <h3 className="text-lg font-semibold text-[#1f2d45]">
                              {sectionTypeLabel(pair.type, t)}
                            </h3>
                            <p className="mt-1 text-sm text-[#607594]">
                              {t("translationList.sectionStringsTitle")}
                            </p>
                            {translationPaths.length === 0 ? (
                              <p className="mt-4 text-sm text-[#607594]">
                                {t("translationList.noStringFields")}
                              </p>
                            ) : (
                              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                <div className="min-w-0 space-y-2">
                                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#5b6f91]">
                                    <span aria-hidden>🇨🇿</span>
                                    {t("editor.lang.cs")}
                                  </div>
                                  <div className="space-y-3 rounded-lg border border-[#dbe4f4] bg-white p-3">
                                    {translationPaths.map((path) => (
                                      <label
                                        key={`cs-${key}-${path}`}
                                        className="block space-y-1"
                                      >
                                        <span className="font-mono text-[11px] text-[#425f8f]">
                                          {path}
                                        </span>
                                        <textarea
                                          value={editCs[path] ?? ""}
                                          onChange={(e) =>
                                            setEditCs((prev) => ({
                                              ...prev,
                                              [path]: e.target.value,
                                            }))
                                          }
                                          rows={2}
                                          className="w-full min-h-[44px] resize-y rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#1f2d45] outline-none focus:border-[#7ea6e7]"
                                          disabled={!pair.cs}
                                          aria-label={`${t("editor.lang.cs")} ${path}`}
                                        />
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <div className="min-w-0 space-y-2">
                                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#5b6f91]">
                                    <span aria-hidden>🇬🇧</span>
                                    {t("editor.lang.en")}
                                  </div>
                                  <div className="space-y-3 rounded-lg border border-[#dbe4f4] bg-white p-3">
                                    {translationPaths.map((path) => (
                                      <label
                                        key={`en-${key}-${path}`}
                                        className="block space-y-1"
                                      >
                                        <span className="font-mono text-[11px] text-[#425f8f]">
                                          {path}
                                        </span>
                                        <textarea
                                          value={editEn[path] ?? ""}
                                          onChange={(e) =>
                                            setEditEn((prev) => ({
                                              ...prev,
                                              [path]: e.target.value,
                                            }))
                                          }
                                          rows={2}
                                          className="w-full min-h-[44px] resize-y rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#1f2d45] outline-none focus:border-[#7ea6e7]"
                                          disabled={!pair.en}
                                          aria-label={`${t("editor.lang.en")} ${path}`}
                                        />
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={savingTranslations}
                                onClick={cancelTranslationEdit}
                                className="rounded-lg border border-[#d4dced] bg-white px-4 py-2 text-sm font-medium text-[#3e69b0] transition-colors hover:bg-[#edf4ff] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {t("editor.actions.cancel")}
                              </button>
                              <button
                                type="button"
                                disabled={
                                  savingTranslations ||
                                  translationPaths.length === 0
                                }
                                onClick={() => void handleSaveTranslations()}
                                className="rounded-lg bg-[#1f2d45] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {savingTranslations
                                  ? t("translationList.savingTranslations")
                                  : t("translationList.saveTranslations")}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-[#e2e8f5] bg-white px-6 py-16 text-center text-sm font-medium text-[#607594]">
            {t("loading")}
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-[#e2e8f5] bg-white px-8 py-16 text-center text-[#607594]">
            <Search className="mb-4 h-12 w-12 opacity-30" aria-hidden />
            <p className="text-sm">
              {pages.length === 0
                ? t("empty")
                : t("translationList.emptySearch")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {grouped.map((g) => {
              const types = badgeTypesForGroup(g);
              return (
                <article
                  key={g.slug}
                  className={`rounded-xl border bg-white p-4 pr-5 transition-colors sm:p-5 ${
                    editingSlug === g.slug
                      ? "border-[#7ea6e7] bg-[#f5f8ff]"
                      : "border-[#e2e8f5] hover:border-[#cfd8ea]"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <code className="rounded bg-[#f1f4fb] px-2 py-1 font-mono text-[13px] text-[#425f8f]">
                        {g.slug}
                      </code>
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
                          {t("translationList.moreLocales", {
                            count: String(g.other.length),
                          })}
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
                          {savingTitles
                            ? t("translationList.savingTitles")
                            : t("translationList.saveTitles")}
                        </button>
                        <button
                          type="button"
                          disabled={savingTitles}
                          onClick={cancelTitleEdit}
                          className="rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm font-medium text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-50"
                        >
                          {t("editor.actions.cancel")}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openTitleEdit(g)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-transparent p-2 text-[#3e69b0] transition-colors hover:border-[#d4dced] hover:bg-[#edf4ff] hover:text-[#1f4a8a]"
                      >
                        <Edit className="h-[18px] w-[18px]" aria-hidden />
                        <span className="text-sm font-medium">
                          {t("actions.edit")}
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <LangColumn
                      label={t("editor.lang.cs")}
                      flag="🇨🇿"
                      row={g.cs}
                      editingTitle={editingSlug === g.slug}
                      titleValue={draftCsTitle}
                      onTitleChange={setDraftCsTitle}
                    />
                    <LangColumn
                      label={t("editor.lang.en")}
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
                        <li
                          key={row.id}
                          className="flex flex-wrap items-center justify-between gap-2 py-1"
                        >
                          <span className="font-mono text-xs uppercase text-[#425f8f]">
                            {row.language}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium text-[#1f2d45]">
                            {row.title}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleTogglePublish(row.id, row.status)
                              }
                              title={
                                row.status === "published"
                                  ? t("actions.unpublish")
                                  : t("actions.publish")
                              }
                              className="inline-flex rounded-md p-1.5 text-[#5b6f91] transition-colors hover:bg-[#eef2fa]"
                            >
                              {row.status === "published" ? (
                                <EyeOff className="h-4 w-4" aria-hidden />
                              ) : (
                                <Eye className="h-4 w-4" aria-hidden />
                              )}
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
    </div>
  );
}
