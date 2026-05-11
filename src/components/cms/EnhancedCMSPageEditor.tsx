'use client';

import React, { useState, useEffect } from 'react';
import { PageDetail, PageSection } from '@/lib/api/cms-api';
import { getPageBySlug, getPageById, updatePage, createPage, createSection } from '@/lib/api/cms-api';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';
import { toast } from 'sonner';
import { EnhancedSectionEditor } from './EnhancedSectionEditor';
import { Plus, Save, Eye, Edit3, Globe, FileText, Settings } from 'lucide-react';

const LANGUAGES = [
  { code: 'cs', label: 'Czech', flag: '🇨🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const SECTION_TYPES = [
  { type: 'hero', label: 'Hero Section', description: 'Main hero banner with title and description' },
  { type: 'cards', label: 'Cards Grid', description: 'Grid of feature cards or information blocks' },
  { type: 'faq', label: 'FAQ Section', description: 'Frequently asked questions' },
  { type: 'cta', label: 'Call to Action', description: 'Call-to-action section with buttons' },
  { type: 'trust', label: 'Trust Badges', description: 'Trust indicators and credentials' },
  { type: 'how-it-works', label: 'How It Works', description: 'Step-by-step process explanation' },
  { type: 'documentation-grid', label: 'Documentation Grid', description: 'Product or document listings' },
  { type: 'bundles', label: 'Product Bundles', description: 'Product packages and pricing' },
  { type: 'why-choose', label: 'Why Choose Us', description: 'Benefits and advantages' },
  { type: 'legal', label: 'Legal Content', description: 'Legal pages and policies' },
];

interface EnhancedCMSPageEditorProps {
  pageId?: string;
}

export function EnhancedCMSPageEditor({ pageId }: EnhancedCMSPageEditorProps) {
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

  const handleSave = async () => {
    if (!slug || !title) {
      toast.error('Please fill in slug and title');
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
        toast.success('Page updated successfully');
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
        toast.success('Page created successfully');
      }
    } catch (error) {
      toast.error('Failed to save page');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSection = async (sectionType: string) => {
    if (!currentPage?.id) {
      toast.error('Please save the page first');
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
      toast.success(`Added ${sectionType} section`);
      setShowAddSection(false);
      loadPage(language); // Reload to show new section
    } catch (error) {
      toast.error('Failed to add section');
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
      default:
        return {};
    }
  };

  const currentLanguageData = pages[language];

  const renderPreview = () => {
    if (!currentPage) return null;

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            <strong>Preview Mode:</strong> This is how the page will appear on the frontend. 
            Language: <span className="font-semibold">{LANGUAGES.find(l => l.code === language)?.label}</span>
          </p>
        </div>

        {/* Preview Header */}
        <header className="mb-8 pb-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {metaDescription && (
            <p className="text-gray-600 italic">{metaDescription}</p>
          )}
          <div className="mt-4 flex gap-2">
            <span className={`px-2 py-1 text-xs rounded ${
              status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {status === 'published' ? 'Published' : 'Draft'}
            </span>
            <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
              {contentType}
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

      default:
        return (
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-4">Section Type: {section.section_type}</h3>
            <pre className="text-sm bg-white p-4 rounded border overflow-auto max-h-96">
              {JSON.stringify(section.data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              {pageId ? `Edit Page: ${pageId}` : 'Create New Page'}
            </h1>
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                isPreview 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreview ? 'Edit Mode' : 'Preview Mode'}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium disabled:bg-blue-400"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {isPreview ? (
          renderPreview()
        ) : (
          <div className="max-w-6xl mx-auto p-6">
            {/* Language Tabs */}
            <div className="mb-6 border-b">
              <div className="flex gap-6">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
                      language === lang.code
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                    {currentLanguageData && <span className="ml-2 text-xs text-green-600">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Page Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={!!currentPage?.id}
                    placeholder="e.g., home, faq, products"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-900 disabled:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for this page</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Page title"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Meta Description (SEO)</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Description for search engines"
                  rows={2}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="hero">Hero</option>
                    <option value="product_catalog">Product Catalog</option>
                    <option value="faq">FAQ</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sections */}
            {currentPage && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Page Sections</h2>
                  <button
                    onClick={() => setShowAddSection(!showAddSection)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                </div>

                {showAddSection && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                    <h3 className="font-medium mb-4">Choose Section Type</h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {SECTION_TYPES.map((type) => (
                        <button
                          key={type.type}
                          onClick={() => handleAddSection(type.type)}
                          className="p-4 border rounded-lg bg-white hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
                        >
                          <h4 className="font-medium mb-1">{type.label}</h4>
                          <p className="text-xs text-gray-600">{type.description}</p>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowAddSection(false)}
                      className="mt-4 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                )}

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
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                      <p className="text-gray-500 mb-4">No sections yet</p>
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Your First Section
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
