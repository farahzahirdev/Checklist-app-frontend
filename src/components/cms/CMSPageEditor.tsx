'use client';

import React, { useState, useEffect } from 'react';
import { PageDetail, PageSection } from '@/lib/api/cms-api';
import { getPageBySlug, getPageById, updatePage, createPage } from '@/lib/api/cms-api';
import { toast } from 'sonner';
import { SectionEditor } from './SectionEditor';
import { CMSPreview } from './CMSPreview';
import { Plus, Save, Eye } from 'lucide-react';

const LANGUAGES = [
  { code: 'cs', label: 'Czech' },
  { code: 'en', label: 'English' },
];

interface CMSPageEditorProps {
  pageId?: string;
}

export function CMSPageEditor({ pageId }: CMSPageEditorProps) {
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
        page = await getPageBySlug(pageId, lang);
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

  const currentLanguageData = pages[language];

  return (
    <div className="space-y-6">
      {/* Language Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-4 py-2 font-medium border-b-2 ${
                language === lang.code
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang.label}
              {currentLanguageData && <span className="ml-2 text-xs text-green-600">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Page Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!!currentPage?.id}
              placeholder="e.g., home, faq, products"
              className="w-full border px-3 py-2 rounded disabled:bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Unique identifier for this page</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page title"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Meta Description (SEO)</label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Description for search engines"
            rows={2}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="standard">Standard</option>
              <option value="hero">Hero</option>
              <option value="product_catalog">Product Catalog</option>
              <option value="faq">FAQ</option>
              <option value="legal">Legal</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={() => setShowPreview(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:bg-blue-400"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
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
      {currentPage && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Page Sections</h2>
          <div className="space-y-3">
            {currentPage.sections?.length ? (
              currentPage.sections.map((section) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  onUpdate={() => {
                    // Reload page after section update
                    if (currentPage.id) {
                      loadPage(language);
                    }
                  }}
                />
              ))
            ) : (
              <p className="text-gray-500">No sections yet</p>
            )}
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      )}
    </div>
  );
}
