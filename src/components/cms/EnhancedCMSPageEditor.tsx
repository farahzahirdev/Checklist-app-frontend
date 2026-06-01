'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { PageDetail, PageSection } from '@/lib/api/cms-api';
import { getPageBySlug, getPageById, updatePage, createPage, createSection } from '@/lib/api/cms-api';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';
import { toast } from 'sonner';
import { EnhancedSectionEditor } from './EnhancedSectionEditor';
import { Plus, Save, Eye, Edit3, Globe, FileText, Settings } from 'lucide-react';
import { CustomDropdown } from '@/components/admin/CustomDropdown';
import { translate, useLocale } from '@/lib/i18n';
import { adminCmsMessages } from '@/locales/admin-cms';
import {
  cmsAddSectionGridBtnClass,
  cmsBtnGhostClass,
  cmsBtnPreviewActiveClass,
  cmsBtnPrimaryClass,
  cmsBtnSecondaryClass,
  cmsInputClass,
  cmsLabelClass,
  cmsLabelUpperClass,
  cmsPanelClass,
  cmsTabActiveClass,
  cmsTabInactiveClass,
  cmsTextareaClass,
  cmsToolbarClass,
} from '@/components/cms/cms-editor-styles';

const LANGUAGE_CODES = [
  { code: 'cs' as const, flag: '🇨🇿' },
  { code: 'en' as const, flag: '🇬🇧' },
];

const SECTION_TYPE_IDS = [
  'hero',
  'cards',
  'faq',
  'cta',
  'trust',
  'how-it-works',
  'documentation-grid',
  'bundles',
  'why-choose',
  'legal',
] as const;

const CONTENT_TYPE_CODES = ['standard', 'hero', 'product_catalog', 'faq', 'legal'] as const;

interface EnhancedCMSPageEditorProps {
  pageId?: string;
}

export function EnhancedCMSPageEditor({ pageId }: EnhancedCMSPageEditorProps) {
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
  const [isPreview, setIsPreview] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  // Load page data when language changes
  useEffect(() => {
    if (pageId) {
      loadPage(language);
    }
  }, [language, pageId]);

  const loadPage = async (lang: string) => {
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
      setStatus('draft');
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
      setContentType('standard');
    } else {
      setTitle(page.title);
      setMetaDescription(page.meta_description || '');
      setStatus(page.status as 'draft' | 'published');
      setSlug(page.slug);
      setContentType(page.content_type);
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

  const handleAddSection = async (sectionType: string) => {
    if (!currentPage?.id) {
      toast.error(t('editor.toast.savePageFirst'));
      return;
    }

    try {
      const newSection = {
        page_id: currentPage.id,
        section_type: sectionType,
        order: (currentPage.sections?.length || 0) + 1,
        data: getDefaultSectionData(sectionType),
      };

      await createSection(newSection);
      const sectionLabelKey = `sectionType.${sectionType}.label`;
      const name = t(sectionLabelKey);
      toast.success(t('editor.toast.sectionAdded', { name }));
      setShowAddSection(false);
      loadPage(language); // Reload to show new section
    } catch (error) {
      toast.error(t('editor.toast.sectionAddFailed'));
      console.error(error);
    }
  };

  const getDefaultSectionData = (sectionType: string) => {
    switch (sectionType) {
      case 'hero':
        return {
          title: '',
          subtitle: '',
          description: '',
          kicker: '',
        };
      case 'cards':
        return {
          title: '',
          cards: [],
        };
      case 'faq':
        return {
          title: '',
          subtitle: '',
          questions: [],
        };
      case 'cta':
        return {
          title: '',
          subtitle: '',
          buttons: [],
        };
      case 'legal':
        return {
          content: '',
        };
      default:
        return {};
    }
  };

  const renderPreview = () => {
    if (!currentPage) return null;

    return (
      <div className="mx-auto w-full max-w-7xl bg-white p-6 xl:max-w-[90rem]">
        <div className="mb-6 rounded-xl border border-[#dbe4f4] bg-[#f9fbff] p-4">
          <p className="text-sm text-[#425f8f]">
            <strong className="text-[#1f2d45]">{t('editor.preview.lead')}</strong> {t('editor.preview.body')}{' '}
            {t('editor.preview.language')}{' '}
            <span className="font-semibold">{t(`editor.lang.${language}`)}</span>
          </p>
        </div>

        {/* Preview Header */}
        <header className="mb-8 border-b border-[#eef2fa] pb-6">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">{title}</h1>
          {metaDescription && <p className="italic text-[#607594]">{metaDescription}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                status === 'published'
                  ? 'border-[#b8e0c8] bg-[#e8f4ec] text-[#1d6b45]'
                  : 'border-[#cfe0ff] bg-[#edf4ff] text-[#2d5599]'
              }`}
            >
              {status === 'published' ? t('filter.published') : t('filter.draft')}
            </span>
            <span className="rounded-full border border-[#d4dced] bg-white px-2.5 py-0.5 text-xs font-semibold text-[#425f8f]">
              {(() => {
                const ctKey = `editor.contentType.${contentType}`;
                const lbl = t(ctKey);
                return lbl === ctKey ? contentType : lbl;
              })()}
            </span>
          </div>
        </header>

        {/* Preview Sections */}
        <main className="space-y-8">
          {currentPage.sections?.map((section) => (
            <SectionPreview key={section.id} section={section} />
          ))}
        </main>
      </div>
    );
  };

  const SectionPreview = ({ section }: { section: PageSection }) => {
    const data = section.data || {};
    switch (section.section_type) {
      case 'hero':
        return (
          <div className="space-y-4 p-8 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            {data.kicker && <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">{data.kicker}</p>}
            {data.title && <h1 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h1>}
            {data.subtitle && <p className="text-xl text-gray-600 mb-4">{data.subtitle}</p>}
            {data.accent && <p className="text-2xl text-blue-600 font-semibold">{data.accent}</p>}
            {data.description && (
              <div 
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            )}
          </div>
        );

      case 'cards':
        return (
          <div className="space-y-6 p-6">
            {data.title && <h2 className="text-2xl font-bold mb-6">{data.title}</h2>}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(data.cards || []).map((card: any, index: number) => (
                <div key={index} className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg mb-3">{card.title}</h3>
                  {card.content && (
                    <div 
                      className="prose max-w-none text-gray-600 mb-4"
                      dangerouslySetInnerHTML={{ __html: card.content }}
                    />
                  )}
                  {card.points && (
                    <ul className="space-y-2">
                      {card.points.map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1 text-sm">✓</span>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-6 p-6">
            {data.title && <h2 className="text-2xl font-bold mb-4">{data.title}</h2>}
            {data.subtitle && <p className="text-gray-600 mb-6">{data.subtitle}</p>}
            <div className="space-y-4">
              {(data.questions || []).map((qa: any, index: number) => (
                <div key={index} className="border rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="font-bold text-lg mb-3">{qa.question}</h3>
                  {qa.answer && (
                    <div 
                      className="prose max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{ __html: qa.answer }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-6 p-8 border rounded-xl bg-gradient-to-r from-green-50 to-blue-50">
            {data.title && <h2 className="text-2xl font-bold mb-4">{data.title}</h2>}
            {data.subtitle && (
              <div 
                className="prose prose-lg max-w-none text-gray-700 mb-6"
                dangerouslySetInnerHTML={{ __html: data.subtitle }}
              />
            )}
            <div className="flex gap-4 flex-wrap">
              {(data.buttons || []).map((button: any, index: number) => (
                <button
                  key={index}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    button.primary 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {button.text}
                </button>
              ))}
            </div>
          </div>
        );

      case 'legal':
        return (
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-3 text-lg font-semibold text-[#1f2d45]">
              {t('editor.contentType.legal')}
            </h3>
            {data.content ? (
              <div
                className="prose prose-lg max-w-none text-black"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            ) : (
              <p className="text-sm text-[#607594]">{t('sectionEditor.legal.previewEmpty')}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="rounded-lg border bg-gray-50 p-6">
            <h3 className="mb-4 font-medium">{t('editor.preview.sectionType', { type: section.section_type })}</h3>
            <pre className="text-sm bg-white p-4 rounded border overflow-auto max-h-96">
              {JSON.stringify(section.data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <div className={cmsToolbarClass}>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={isPreview ? cmsBtnPreviewActiveClass : cmsBtnSecondaryClass}
          >
            {isPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreview ? t('editor.toolbar.editMode') : t('editor.toolbar.preview')}
          </button>
          {loading ? <span className="text-sm text-[#607594]">{t('editor.loading')}</span> : null}
        </div>
        <button type="button" onClick={handleSave} disabled={isSaving} className={cmsBtnPrimaryClass}>
          <Save className="h-4 w-4" />
          {isSaving ? t('editor.saving') : t('editor.save')}
        </button>
      </div>

      <div className="min-h-0 flex-1">
        {isPreview ? (
          renderPreview()
        ) : (
          <div className="mx-auto w-full max-w-7xl space-y-6 xl:max-w-[90rem] 2xl:max-w-[100rem]">
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
                    <span className="mr-2">{lang.flag}</span>
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
                  <label className={`${cmsLabelClass} flex items-center gap-2`}>
                    <Globe className="h-4 w-4 text-[#5b6f91]" aria-hidden />
                    {t('editor.field.pageSlug')}
                  </label>
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
                  <label className={`${cmsLabelClass} flex items-center gap-2`}>
                    <FileText className="h-4 w-4 text-[#5b6f91]" aria-hidden />
                    {t('editor.field.title')}
                  </label>
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
                  <span className={`${cmsLabelUpperClass} flex items-center gap-2`}>
                    <Settings className="h-3.5 w-3.5 text-[#5b6f91]" aria-hidden />
                    {t('editor.field.contentType')}
                  </span>
                  <CustomDropdown
                    value={contentType}
                    onChange={(next) => setContentType(next)}
                    placeholder={t('editor.contentType.standard')}
                    options={contentTypeDropdownOptions}
                  />
                </label>
              </div>
            </div>

            {currentPage ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-[#243555]">{t('editor.sections.heading')}</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddSection(!showAddSection)}
                    className={cmsBtnPrimaryClass}
                  >
                    <Plus className="h-4 w-4" />
                    {t('editor.sections.add')}
                  </button>
                </div>

                {showAddSection ? (
                  <div className="rounded-2xl border-2 border-dashed border-[#dbe4f4] bg-[#f9fbff] p-6">
                    <h3 className="mb-4 font-semibold text-[#243555]">{t('editor.sections.chooseType')}</h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {SECTION_TYPE_IDS.map((typeId) => (
                        <button
                          key={typeId}
                          type="button"
                          onClick={() => handleAddSection(typeId)}
                          className={cmsAddSectionGridBtnClass}
                        >
                          <h4 className="mb-1 font-semibold text-[#1f2d45]">{t(`sectionType.${typeId}.label`)}</h4>
                          <p className="text-xs text-[#607594]">{t(`sectionType.${typeId}.description`)}</p>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setShowAddSection(false)} className={`${cmsBtnGhostClass} mt-4`}>
                      {t('editor.actions.cancel')}
                    </button>
                  </div>
                ) : null}

                <div className="space-y-4">
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
                    <div className="rounded-2xl border-2 border-dashed border-[#dbe4f4] py-12 text-center">
                      <p className="mb-4 text-[#607594]">{t('editor.sections.none')}</p>
                      <button
                        type="button"
                        onClick={() => setShowAddSection(true)}
                        className={cmsBtnPrimaryClass}
                      >
                        <Plus className="h-4 w-4" />
                        {t('editor.sections.addFirst')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
