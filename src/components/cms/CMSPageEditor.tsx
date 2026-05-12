'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { PageDetail } from '@/lib/api/cms-api';
import { getPageBySlug, getPageById, updatePage, createPage } from '@/lib/api/cms-api';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';
import { toast } from 'sonner';
import { EnhancedSectionEditor } from './EnhancedSectionEditor';
import { CMSPreview } from './CMSPreview';
import { Plus, Save, Eye } from 'lucide-react';
import { CustomDropdown } from '@/components/admin/CustomDropdown';
import { translate, useLocale } from '@/lib/i18n';
import { adminCmsMessages } from '@/locales/admin-cms';
import {
  cmsBtnPrimaryClass,
  cmsBtnSecondaryClass,
  cmsInputClass,
  cmsLabelClass,
  cmsLabelUpperClass,
  cmsPanelClass,
  cmsTabActiveClass,
  cmsTabInactiveClass,
  cmsTextareaClass,
} from '@/components/cms/cms-editor-styles';

const LANGUAGE_CODES = [{ code: 'cs' as const }, { code: 'en' as const }];

const CONTENT_TYPE_CODES = ['standard', 'hero', 'product_catalog', 'faq', 'legal'] as const;

interface CMSPageEditorProps {
  pageId?: string;
}

export function CMSPageEditor({ pageId }: CMSPageEditorProps) {
  const { locale } = useLocale();
  const t = useCallback(
    (key: string, values?: Record<string, string>) => translate(adminCmsMessages, locale, key, values),
    [locale],
  );

  const [language, setLanguage] = useState('cs');
  const [pages, setPages] = useState<Record<string, PageDetail | null>>({});
  const [currentPage, setCurrentPage] = useState<PageDetail | null>(null);
  const [title, setTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [contentType, setContentType] = useState('standard');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load page data when language changes
  useEffect(() => {
    if (pageId) {
      loadPage(language);
    }
  }, [language, pageId]);

  const loadPage = async (lang: string) => {
    // For new page mode, we derive slug from pageId
    // For existing pages, pageId would be actual page ID
    if (!pageId) return;

    if (pages[lang]) {
      setCurrentPage(pages[lang]);
      syncPageState(pages[lang]);
      return;
    }

    try {
      setLoading(true);
      // Check if pageId is a UUID (existing page) or a slug (new page)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(pageId);
      
      let page;
      if (isUuid) {
        // Load existing page by ID
        page = await getPageById(pageId, lang);
      } else {
        // Load page by slug (for new pages)
        page = await getPageBySlug(pageId, lang, localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY));
      }
      
      setPages((prev) => ({ ...prev, [lang]: page }));
      setCurrentPage(page);
      syncPageState(page);
    } catch (error) {
      // Page doesn't exist yet in this language
      setCurrentPage(null);
      setTitle('');
      setMetaDescription('');
      setSlug(pageId);
    } finally {
      setLoading(false);
    }
  };

  const syncPageState = (page: PageDetail | null) => {
    if (!page) {
      setTitle('');
      setMetaDescription('');
      setStatus('draft');
      setSlug('');
    } else {
      setTitle(page.title);
      setMetaDescription(page.meta_description || '');
      setStatus(page.status as 'draft' | 'published');
      setSlug(page.slug);
      setContentType(page.content_type);
    }
  };

  const handleSave = async () => {
    if (!slug || !title) {
      toast.error(t('editor.toast.slugTitleRequired'));
      return;
    }

    try {
      setIsSaving(true);

      if (currentPage?.id) {
        // Update existing page
        const updated = await updatePage(currentPage.id, {
          title,
          meta_description: metaDescription,
          status,
          content_type: contentType,
        });
        setPages((prev) => ({ ...prev, [language]: updated }));
        setCurrentPage(updated);
        toast.success(t('editor.toast.updated'));
      } else {
        // Create new page
        const created = await createPage({
          slug,
          language,
          title,
          meta_description: metaDescription,
          status,
          content_type: contentType,
        });
        setPages((prev) => ({ ...prev, [language]: created }));
        setCurrentPage(created);
        toast.success(t('editor.toast.created'));
      }
    } catch (error) {
      toast.error(t('editor.toast.saveFailed'));
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const statusDropdownOptions = useMemo(
    () => [
      { value: 'draft', label: t('filter.draft') },
      { value: 'published', label: t('filter.published') },
    ],
    [t],
  );

  const contentTypeDropdownOptions = useMemo(
    () =>
      CONTENT_TYPE_CODES.map((code) => ({
        value: code,
        label: t(`editor.contentType.${code}`),
      })),
    [t],
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-[#eef2fa]">
        <div className="flex gap-8">
          {LANGUAGE_CODES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-1 pb-3 text-sm font-semibold transition-colors ${
                language === lang.code ? cmsTabActiveClass : cmsTabInactiveClass
              }`}
            >
              {t(`editor.lang.${lang.code}`)}
              {pages[lang.code] ? (
                <span className="ml-2 text-xs font-medium text-[#1d6b45]">✓</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className={`${cmsPanelClass} space-y-6`}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={cmsLabelClass}>{t('editor.field.pageSlug')}</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!!currentPage?.id}
              placeholder={t('editor.field.slugPlaceholder')}
              className={cmsInputClass}
            />
            <p className="mt-1 text-xs text-[#607594]">{t('editor.field.slugHint')}</p>
          </div>
          <div>
            <label className={cmsLabelClass}>{t('editor.field.title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('editor.field.titlePlaceholder')}
              className={cmsInputClass}
            />
          </div>
        </div>

        <div>
          <label className={cmsLabelClass}>{t('editor.field.metaDescription')}</label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={t('editor.field.metaPlaceholder')}
            rows={2}
            className={cmsTextareaClass}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-1">
            <span className={cmsLabelUpperClass}>{t('filter.status')}</span>
            <CustomDropdown
              value={status}
              onChange={(next) => setStatus(next as 'draft' | 'published')}
              placeholder={t('filter.draft')}
              options={statusDropdownOptions}
            />
          </label>
          <label className="space-y-1">
            <span className={cmsLabelUpperClass}>{t('editor.field.contentType')}</span>
            <CustomDropdown
              value={contentType}
              onChange={(next) => setContentType(next)}
              placeholder={t('editor.contentType.standard')}
              options={contentTypeDropdownOptions}
            />
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[#eef2fa] pt-4">
          <button type="button" onClick={() => setShowPreview(true)} className={cmsBtnSecondaryClass}>
            <Eye className="h-4 w-4" />
            {t('editor.toolbar.preview')}
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving} className={cmsBtnPrimaryClass}>
            <Save className="h-4 w-4" />
            {isSaving ? t('editor.saving') : t('editor.save')}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      <CMSPreview
        page={currentPage}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />

      {/* Sections */}
      {currentPage ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#243555]">{t('editor.sections.heading')}</h2>
          <div className="space-y-3">
            {currentPage.sections?.length ? (
              currentPage.sections.map((section) => (
                <EnhancedSectionEditor
                  key={section.id}
                  section={section}
                  onUpdate={() => {
                    if (currentPage.id) {
                      loadPage(language);
                    }
                  }}
                />
              ))
            ) : (
              <p className="text-[#607594]">{t('editor.sections.none')}</p>
            )}
          </div>
          <button type="button" className={cmsBtnPrimaryClass}>
            <Plus className="h-4 w-4" />
            {t('editor.sections.add')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
