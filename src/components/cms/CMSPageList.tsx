'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { getAllPages, deletePage, togglePublishPage } from '@/lib/api/cms-api';
import { toast } from 'sonner';
import { translate, useLocale } from '@/lib/i18n';
import { adminCmsMessages } from '@/locales/admin-cms';
import { CustomDropdown } from '@/components/admin/CustomDropdown';
import {
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_SUBTITLE_CLASS,
  ADMIN_PAGE_HERO_TITLE_CLASS,
} from '@/app/(app)/admin/admin-page-title';

const panelCardClass =
  'rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm';
const tableShellClass = 'overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm';

interface PageListItem {
  id: string;
  slug: string;
  language: string;
  title: string;
  status: 'draft' | 'published';
  updated_at: string;
}

export function CMSPageList() {
  const { locale } = useLocale();
  const t = useCallback(
    (key: string, values?: Record<string, string>) => translate(adminCmsMessages, locale, key, values),
    [locale],
  );
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PageListItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const languageOptions = useMemo(
    () => [
      { value: '', label: t('filter.allLanguages') },
      { value: 'cs', label: t('filter.lang.cs') },
      { value: 'en', label: t('filter.lang.en') },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: t('filter.allStatus') },
      { value: 'draft', label: t('filter.draft') },
      { value: 'published', label: t('filter.published') },
    ],
    [t],
  );

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPages(language || undefined, status || undefined);
      setPages(data.items);
    } catch (error) {
      toast.error(t('toast.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [language, status, t]);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

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

  const confirmDeletePage = async () => {
    if (!pendingDelete) return;
    setDeleteSubmitting(true);
    try {
      await deletePage(pendingDelete.id);
      toast.success(t('toast.deleteSuccess'));
      setPendingDelete(null);
      void loadPages();
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
      loadPages();
    } catch (error) {
      toast.error(t('toast.toggleError'));
      console.error(error);
    }
  };

  return (
    <section className="space-y-5">
      <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
        <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>{t('list.heroEyebrow')}</p>
        <h1 className={ADMIN_PAGE_HERO_TITLE_CLASS}>{t('list.title')}</h1>
        <p className={ADMIN_PAGE_HERO_SUBTITLE_CLASS}>{t('list.subtitle')}</p>
      </header>

      <div className={panelCardClass}>
        <p className="mb-4 text-sm font-semibold text-[#243555]">{t('filter.panelTitle')}</p>
        <div className="flex flex-wrap items-end gap-4 md:gap-6">
          <label className="min-w-[200px] flex-1 space-y-1 sm:max-w-[280px]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('filter.language')}</span>
            <CustomDropdown
              value={language ?? ''}
              onChange={(next) => setLanguage(next || null)}
              placeholder={t('filter.allLanguages')}
              options={languageOptions}
            />
          </label>
          <label className="min-w-[200px] flex-1 space-y-1 sm:max-w-[280px]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('filter.status')}</span>
            <CustomDropdown
              value={status ?? ''}
              onChange={(next) => setStatus(next || null)}
              placeholder={t('filter.allStatus')}
              options={statusOptions}
            />
          </label>
        </div>
      </div>

      <div className={tableShellClass}>
        {loading ? (
          <div className="px-6 py-12 text-center text-sm font-medium text-[#607594]">{t('loading')}</div>
        ) : pages.length === 0 ? (
          <div className="mx-5 my-6 rounded-xl border border-[#dbe4f4] bg-[#f9fbff] px-4 py-8 text-center text-sm text-[#607594]">
            {t('empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-[#eef2fa] bg-[#f7f9fe]">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6f91]">
                    {t('table.title')}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6f91]">
                    {t('table.slug')}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6f91]">
                    {t('table.language')}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6f91]">
                    {t('table.status')}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6f91]">
                    {t('table.updated')}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6f91]">
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2fa]">
                {pages.map((page) => (
                  <tr key={page.id} className="transition-colors hover:bg-[#f7f9fe]/90">
                    <td className="px-5 py-4 text-sm font-semibold text-[#1f2d45]">{page.title}</td>
                    <td className="px-5 py-4 font-mono text-sm text-[#607594]">{page.slug}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-[#d4dced] bg-white px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#425f8f]">
                        {page.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          page.status === 'published'
                            ? 'border-[#b8e0c8] bg-[#e8f4ec] text-[#1d6b45]'
                            : 'border-[#cfe0ff] bg-[#edf4ff] text-[#2d5599]'
                        }`}
                      >
                        {t(`status.${page.status}`)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#607594]">
                      {new Date(page.updated_at).toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-US')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/cms/${page.slug}`}
                          title={t('actions.edit')}
                          className="inline-flex rounded-lg p-2 text-[#3e69b0] transition-colors hover:bg-[#edf4ff] hover:text-[#1f4a8a]"
                        >
                          <Edit className="h-4 w-4" aria-hidden />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(page.id, page.status)}
                          title={page.status === 'published' ? t('actions.unpublish') : t('actions.publish')}
                          className="inline-flex rounded-lg p-2 text-[#5b6f91] transition-colors hover:bg-[#eef2fa] hover:text-[#2a3d5f]"
                        >
                          {page.status === 'published' ? (
                            <EyeOff className="h-4 w-4" aria-hidden />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(page)}
                          title={t('actions.delete')}
                          className="inline-flex rounded-lg p-2 text-[#c44f5f] transition-colors hover:bg-[#fff1f3] hover:text-[#a73a46]"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </section>
  );
}
