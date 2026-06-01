'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PageSection } from '@/lib/api/cms-api';
import { updateSection, deleteSection } from '@/lib/api/cms-api';
import { toast } from 'sonner';
import { Trash2, ChevronDown, ChevronUp, Eye, Edit3, Save, X } from 'lucide-react';
import { translate, useLocale } from '@/lib/i18n';
import { adminCmsMessages } from '@/locales/admin-cms';
import { cmsBtnGhostClass, cmsBtnPrimaryClass, cmsHintClass, cmsInputClass, cmsJsonTextareaClass, cmsLabelClass, cmsTextareaClass } from '@/components/cms/cms-editor-styles';

interface SectionEditorProps {
  section: PageSection;
  onUpdate?: () => void;
}

type CmsT = (key: string, values?: Record<string, string>) => string;

// Rich text editor component
function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  className = '',
  t,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  t: CmsT;
}) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);

  return (
    <div className={`overflow-hidden rounded-xl border border-[#dbe4f4] [color-scheme:light] ${className}`}>
      <div className="flex items-center justify-between border-b border-[#eef2fa] bg-[#f7f9fe] px-3 py-2">
        <span className="text-sm font-medium text-[#243555]">{t('sectionEditor.richText.toolbar')}</span>
        <button
          type="button"
          onClick={() => setIsHtmlMode(!isHtmlMode)}
          className="rounded-lg border border-[#d4dced] bg-white px-2 py-1 text-xs font-semibold text-[#425f8f] hover:bg-[#edf4ff]"
        >
          {isHtmlMode ? t('sectionEditor.richText.visual') : t('sectionEditor.richText.html')}
        </button>
      </div>
      
      {isHtmlMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className={`${cmsTextareaClass} rounded-none rounded-b-xl border-0 border-t border-[#eef2fa] font-mono`}
        />
      ) : (
        <div className="min-h-[150px]">
          <div className="flex gap-1 border-b border-[#eef2fa] bg-[#f9fbff] p-2">
            <button
              type="button"
              onClick={() => onChange(value + '<strong>Bold</strong>')}
              className="rounded border border-[#d4dced] px-2 py-1 text-xs font-bold hover:bg-white"
              title={t('sectionEditor.richText.title.bold')}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => onChange(value + '<em>Italic</em>')}
              className="rounded border border-[#d4dced] px-2 py-1 text-xs italic hover:bg-white"
              title={t('sectionEditor.richText.title.italic')}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => onChange(value + '<u>Underline</u>')}
              className="rounded border border-[#d4dced] px-2 py-1 text-xs underline hover:bg-white"
              title={t('sectionEditor.richText.title.underline')}
            >
              U
            </button>
            <div className="h-4 w-px bg-[#dbe4f4]" />
            <button
              type="button"
              onClick={() => onChange(value + '<h2>Heading</h2>')}
              className="rounded border border-[#d4dced] px-2 py-1 text-xs hover:bg-white"
              title={t('sectionEditor.richText.title.h2')}
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => onChange(value + '<p>Paragraph</p>')}
              className="rounded border border-[#d4dced] px-2 py-1 text-xs hover:bg-white"
              title={t('sectionEditor.richText.title.p')}
            >
              P
            </button>
            <button
              type="button"
              onClick={() => onChange(value + '<ul><li>List item</li></ul>')}
              className="rounded border border-[#d4dced] px-2 py-1 text-xs hover:bg-white"
              title={t('sectionEditor.richText.title.list')}
            >
              •
            </button>
            <div className="h-4 w-px bg-[#dbe4f4]" />
            <button
              type="button"
              onClick={() => onChange(value + '<a href="#">Link</a>')}
              className="rounded border border-[#d4dced] px-2 py-1 text-xs hover:bg-white"
              title={t('sectionEditor.richText.title.link')}
            >
              🔗
            </button>
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={8}
            className={`${cmsTextareaClass} rounded-none rounded-b-xl border-0 border-t border-[#eef2fa] resize-none`}
          />
        </div>
      )}
    </div>
  );
}

// Section type-specific editors
function SectionDataEditor({
  sectionType,
  data,
  onChange,
  t,
}: {
  sectionType: string;
  data: any;
  onChange: (data: any) => void;
  t: CmsT;
}) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    onChange({ 
      ...data, 
      [parent]: { 
        ...data[parent], 
        [field]: value 
      } 
    });
  };

  const updateNestedArrayField = (parent: string, index: number, field: string, value: any) => {
    const newArray = [...(data[parent] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    onChange({ 
      ...data, 
      [parent]: newArray
    });
  };

  switch (sectionType) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.hero.kicker')}</label>
            <input
              type="text"
              value={data.kicker || ''}
              onChange={(e) => updateField('kicker', e.target.value)}
              className={cmsInputClass}
              placeholder={t('sectionEditor.hero.kickerPh')}
            />
          </div>
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.hero.title')}</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className={cmsInputClass}
              placeholder={t('sectionEditor.hero.titlePh')}
            />
          </div>
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.hero.subtitle')}</label>
            <input
              type="text"
              value={data.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className={cmsInputClass}
              placeholder={t('sectionEditor.hero.subtitlePh')}
            />
          </div>
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.hero.accent')}</label>
            <input
              type="text"
              value={data.accent || ''}
              onChange={(e) => updateField('accent', e.target.value)}
              className={cmsInputClass}
              placeholder={t('sectionEditor.hero.accentPh')}
            />
          </div>
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.hero.description')}</label>
            <RichTextEditor
              value={data.description || ''}
              onChange={(value) => updateField('description', value)}
              placeholder={t('sectionEditor.hero.descriptionPh')}
              t={t}
            />
          </div>
        </div>
      );

    case 'cards':
      return (
        <div className="space-y-4">
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.cards.sectionTitle')}</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className={cmsInputClass}
              placeholder={t('sectionEditor.cards.sectionTitlePh')}
            />
          </div>
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.cards.cardsLabel')}</label>
            <div className="space-y-3">
              {(data.cards || []).map((card: any, index: number) => (
                <div key={index} className="rounded-xl border border-[#dbe4f4] bg-[#f9fbff] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-[#243555]">{t('sectionEditor.cards.cardN', { n: String(index + 1) })}</h4>
                    <button
                      onClick={() => {
                        const newCards = [...(data.cards || [])];
                        newCards.splice(index, 1);
                        updateField('cards', newCards);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => updateNestedArrayField('cards', index, 'title', e.target.value)}
                      className={cmsInputClass}
                      placeholder={t('sectionEditor.cards.cardTitlePh')}
                    />
                    <RichTextEditor
                      value={card.content || ''}
                      onChange={(value) => updateNestedArrayField('cards', index, 'content', value)}
                      placeholder={t('sectionEditor.cards.cardContentPh')}
                      className="text-sm"
                      t={t}
                    />
                    {card.points && (
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#5b6f91]">
                          {t('sectionEditor.cards.pointsLabel')}
                        </label>
                        <textarea
                          value={card.points.join('\n') || ''}
                          onChange={(e) => {
                            const newCards = [...(data.cards || [])];
                            newCards[index] = { ...newCards[index], points: e.target.value.split('\n').filter(p => p.trim()) };
                            updateField('cards', newCards);
                          }}
                          rows={3}
                          className={`${cmsInputClass} py-1.5 text-xs`}
                          placeholder={t('sectionEditor.cards.pointsPh')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => updateField('cards', [...(data.cards || []), { title: '', content: '', points: [] }])}
                className="w-full rounded-xl border-2 border-dashed border-[#dbe4f4] py-2.5 text-sm font-semibold text-[#607594] transition-colors hover:border-[#b8c9e8] hover:bg-[#f9fbff] hover:text-[#2a3d5f]"
              >
                {t('sectionEditor.cards.addCard')}
              </button>
            </div>
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-4">
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.faq.sectionTitle')}</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className={cmsInputClass}
              placeholder={t('sectionEditor.faq.sectionTitlePh')}
            />
          </div>
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.faq.subtitle')}</label>
            <input
              type="text"
              value={data.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className={cmsInputClass}
              placeholder={t('sectionEditor.faq.subtitlePh')}
            />
          </div>
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.faq.qaLabel')}</label>
            <div className="space-y-3">
              {(data.questions || []).map((qa: any, index: number) => (
                <div key={index} className="rounded-xl border border-[#dbe4f4] bg-[#f9fbff] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-[#243555]">{t('sectionEditor.faq.qaN', { n: String(index + 1) })}</h4>
                    <button
                      onClick={() => {
                        const newQuestions = [...(data.questions || [])];
                        newQuestions.splice(index, 1);
                        updateField('questions', newQuestions);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={qa.question || ''}
                      onChange={(e) => updateNestedArrayField('questions', index, 'question', e.target.value)}
                      className={cmsInputClass}
                      placeholder={t('sectionEditor.faq.questionPh')}
                    />
                    <RichTextEditor
                      value={qa.answer || ''}
                      onChange={(value) => updateNestedArrayField('questions', index, 'answer', value)}
                      placeholder={t('sectionEditor.faq.answerPh')}
                      className="text-sm"
                      t={t}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => updateField('questions', [...(data.questions || []), { question: '', answer: '' }])}
                className="w-full rounded-xl border-2 border-dashed border-[#dbe4f4] py-2.5 text-sm font-semibold text-[#607594] transition-colors hover:border-[#b8c9e8] hover:bg-[#f9fbff] hover:text-[#2a3d5f]"
              >
                {t('sectionEditor.faq.addPair')}
              </button>
            </div>
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="space-y-4">
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.cta.title')}</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className={cmsInputClass}
              placeholder={t('sectionEditor.cta.titlePh')}
            />
          </div>
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.cta.subtitle')}</label>
            <RichTextEditor
              value={data.subtitle || ''}
              onChange={(value) => updateField('subtitle', value)}
              placeholder={t('sectionEditor.cta.subtitlePh')}
              t={t}
            />
          </div>
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.cta.buttons')}</label>
            <div className="space-y-2">
              {(data.buttons || []).map((button: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={button.text || ''}
                    onChange={(e) => updateNestedArrayField('buttons', index, 'text', e.target.value)}
                    className={`${cmsInputClass} flex-1 min-w-0`}
                    placeholder={t('sectionEditor.cta.buttonTextPh')}
                  />
                  <input
                    type="text"
                    value={button.url || ''}
                    onChange={(e) => updateNestedArrayField('buttons', index, 'url', e.target.value)}
                    className={`${cmsInputClass} flex-1 min-w-0`}
                    placeholder={t('sectionEditor.cta.urlPh')}
                  />
                  <select
                    value={button.primary ? 'true' : 'false'}
                    onChange={(e) => updateNestedArrayField('buttons', index, 'primary', e.target.value === 'true')}
                    className={`${cmsInputClass} min-w-[100px] flex-1`}
                  >
                    <option value="true">{t('sectionEditor.cta.primary')}</option>
                    <option value="false">{t('sectionEditor.cta.secondary')}</option>
                  </select>
                  <button
                    onClick={() => {
                      const newButtons = [...(data.buttons || [])];
                      newButtons.splice(index, 1);
                      updateField('buttons', newButtons);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateField('buttons', [...(data.buttons || []), { text: '', url: '', primary: false }])}
                className="w-full rounded-xl border-2 border-dashed border-[#dbe4f4] py-2.5 text-sm font-semibold text-[#607594] transition-colors hover:border-[#b8c9e8] hover:bg-[#f9fbff] hover:text-[#2a3d5f]"
              >
                {t('sectionEditor.cta.addButton')}
              </button>
            </div>
          </div>
        </div>
      );

    case 'legal':
      return (
        <div className="space-y-4">
          <div>
            <label className={cmsLabelClass}>{t('sectionEditor.legal.content')}</label>
            <RichTextEditor
              value={data.content || ''}
              onChange={(value) => updateField('content', value)}
              placeholder={t('sectionEditor.legal.contentPh')}
              className="min-h-[320px]"
              t={t}
            />
          </div>
        </div>
      );

    default:
      return (
        <div>
          <label className={cmsLabelClass}>{t('sectionEditor.json.label')}</label>
          <textarea
            value={JSON.stringify(data, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                // Let user fix JSON
              }
            }}
            rows={10}
            spellCheck={false}
            className={cmsJsonTextareaClass}
            placeholder={t('sectionEditor.json.placeholder')}
          />
          <p className={cmsHintClass}>{t('sectionEditor.json.hint')}</p>
        </div>
      );
  }
}

export function EnhancedSectionEditor({ section, onUpdate }: SectionEditorProps) {
  const { locale } = useLocale();
  const t = useCallback(
    (key: string, values?: Record<string, string>) => translate(adminCmsMessages, locale, key, values),
    [locale]
  );

  const sectionTypeLabel = useMemo(() => {
    const key = `sectionType.${section.section_type}.label`;
    const resolved = translate(adminCmsMessages, locale, key);
    return resolved === key ? section.section_type : resolved;
  }, [locale, section.section_type]);

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sectionData, setSectionData] = useState(section.data || {});
  const [isPreview, setIsPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (!showDeleteModal) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !deleteSubmitting) {
        setShowDeleteModal(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showDeleteModal, deleteSubmitting]);

  const confirmDeleteSection = async () => {
    try {
      setDeleteSubmitting(true);
      await deleteSection(section.id);
      toast.success(t('sectionEditor.toast.deleted'));
      setShowDeleteModal(false);
      onUpdate?.();
    } catch (error) {
      toast.error(t('sectionEditor.toast.deleteFailed'));
      console.error(error);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateSection(section.id, { data: sectionData });
      toast.success(t('sectionEditor.toast.updated'));
      onUpdate?.();
    } catch (error) {
      toast.error(t('sectionEditor.toast.updateFailed'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePreviewOrEdit = () => {
    if (!expanded) {
      setExpanded(true);
    }
    setIsPreview((p) => !p);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#eef2fa] bg-[linear-gradient(160deg,#ffffff_0%,#f7f9fe_100%)] px-4 py-3">
        <div>
          <h3 className="font-semibold text-[#243555]">{sectionTypeLabel}</h3>
          <p className="text-sm text-[#607594]">{t('sectionEditor.order', { order: String(section.order) })}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={togglePreviewOrEdit}
            className={`rounded-lg p-2 ${
              isPreview
                ? 'border border-[#2f7dff] bg-[#edf4ff] text-[#10284f]'
                : 'border border-[#d4dced] bg-white text-[#425f8f] hover:bg-[#f7f9fe]'
            }`}
            title={isPreview ? t('editor.toolbar.editMode') : t('editor.toolbar.preview')}
          >
            {isPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg p-2 text-[#c44f5f] transition-colors hover:bg-[#fff1f3]"
            title={t('sectionEditor.actions.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-2 text-[#607594] hover:bg-[#eef2fa]"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-[#eef2fa]">
          {isPreview ? (
            <div className="p-6">
              <div className="mb-4 rounded-xl border border-[#dbe4f4] bg-[#f9fbff] p-3">
                <p className="text-sm text-[#425f8f]">
                  <strong className="text-[#1f2d45]">{t('sectionEditor.preview.lead')}</strong>{' '}
                  {t('sectionEditor.preview.body')}
                </p>
              </div>
              <SectionPreview sectionType={section.section_type} data={sectionData} t={t} />
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <SectionDataEditor sectionType={section.section_type} data={sectionData} onChange={setSectionData} t={t} />

              <div className="flex justify-end gap-2 border-t border-[#eef2fa] pt-4">
                <button type="button" onClick={() => setExpanded(false)} className={cmsBtnGhostClass}>
                  {t('editor.actions.cancel')}
                </button>
                <button type="button" onClick={handleSave} disabled={loading} className={cmsBtnPrimaryClass}>
                  <Save className="h-4 w-4" />
                  {loading ? t('sectionEditor.saving') : t('sectionEditor.saveChanges')}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4">
          <div
            className="w-full max-w-md rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-delete-section-modal-title"
          >
            <h2 id="cms-delete-section-modal-title" className="text-lg font-semibold text-[#1f2d45]">
              {t('modal.deleteSection.title')}
            </h2>
            <p className="mt-2 text-sm text-[#607594]">
              {t('modal.deleteSection.body', {
                name: sectionTypeLabel,
                order: String(section.order),
              })}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteSubmitting}
                className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
              >
                {t('modal.deleteSection.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteSection()}
                disabled={deleteSubmitting}
                className="rounded-lg border border-[#d45f6b] bg-[#fff1f3] px-3 py-1.5 text-sm font-semibold text-[#a73a46] hover:bg-[#ffe6ea] disabled:opacity-60"
              >
                {deleteSubmitting ? t('modal.deleteSection.deleting') : t('modal.deleteSection.confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// Simple preview component
function SectionPreview({
  sectionType,
  data,
  t,
}: {
  sectionType: string;
  data: any;
  t: CmsT;
}) {
  switch (sectionType) {
    case 'hero':
      return (
        <div className="space-y-4 p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          {data.kicker && <p className="text-sm text-blue-600 font-medium">{data.kicker}</p>}
          {data.title && <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>}
          {data.subtitle && <p className="text-lg text-gray-600">{data.subtitle}</p>}
          {data.accent && <p className="text-xl text-blue-600 font-semibold">{data.accent}</p>}
          {data.description && (
            <div 
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}
        </div>
      );

    case 'cards':
      return (
        <div className="space-y-4 p-6">
          {data.title && <h2 className="text-xl font-bold mb-4">{data.title}</h2>}
          <div className="grid gap-4 md:grid-cols-2">
            {(data.cards || []).map((card: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold mb-2">{card.title}</h3>
                {card.content && (
                  <div 
                    className="prose prose-sm max-w-none text-gray-600 mb-3"
                    dangerouslySetInnerHTML={{ __html: card.content }}
                  />
                )}
                {card.points && (
                  <ul className="space-y-1">
                    {card.points.map((point: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
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
        <div className="space-y-4 p-6">
          {data.title && <h2 className="text-xl font-bold mb-2">{data.title}</h2>}
          {data.subtitle && <p className="text-gray-600 mb-4">{data.subtitle}</p>}
          <div className="space-y-3">
            {(data.questions || []).map((qa: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-2">{qa.question}</h3>
                {qa.answer && (
                  <div 
                    className="prose prose-sm max-w-none text-gray-600"
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
        <div className="space-y-4 p-6 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
          {data.title && <h2 className="text-xl font-bold">{data.title}</h2>}
          {data.subtitle && (
            <div 
              className="prose prose-sm max-w-none text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: data.subtitle }}
            />
          )}
          <div className="flex gap-3">
            {(data.buttons || []).map((button: any, index: number) => (
              <button
                key={index}
                className={`px-4 py-2 rounded ${
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
            {t('sectionEditor.legal.previewTitle')}
          </h3>
          {data.content ? (
            <div
              className="prose prose-sm max-w-none text-black"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          ) : (
            <p className="text-sm text-[#607594]">{t('sectionEditor.legal.previewEmpty')}</p>
          )}
        </div>
      );

    default: {
      const typeKey = `sectionType.${sectionType}.label`;
      const resolved = t(typeKey);
      const displayType = resolved === typeKey ? sectionType : resolved;
      return (
        <div className="p-6 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-2">{t('editor.preview.sectionType', { type: displayType })}</h3>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-60">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }
  }
}
