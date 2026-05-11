'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Eye, Plus } from 'lucide-react';
import { getAllPages, deletePage, togglePublishPage } from '@/lib/api/cms-api';
import { toast } from 'sonner';

interface PageListItem {
  id: string;
  slug: string;
  language: string;
  title: string;
  status: 'draft' | 'published';
  updated_at: string;
}

export function CMSPageList() {
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, [language, status]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await getAllPages(language || undefined, status || undefined);
      setPages(data.items);
    } catch (error) {
      toast.error('Failed to load pages');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      await deletePage(pageId);
      toast.success('Page deleted successfully');
      loadPages();
    } catch (error) {
      toast.error('Failed to delete page');
      console.error(error);
    }
  };

  const handleTogglePublish = async (pageId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await togglePublishPage(pageId, newStatus as 'draft' | 'published');
      toast.success(`Page ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      loadPages();
    } catch (error) {
      toast.error('Failed to update page status');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">CMS Pages</h1>
        <Link
          href="/admin/cms/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Page
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg border">
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            value={language || ''}
            onChange={(e) => setLanguage(e.target.value || null)}
            className="border px-3 py-2 rounded"
          >
            <option value="">All Languages</option>
            <option value="cs">Czech (cs)</option>
            <option value="en">English (en)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={status || ''}
            onChange={(e) => setStatus(e.target.value || null)}
            className="border px-3 py-2 rounded"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pages found. <Link href="/admin/cms/new" className="text-blue-600 hover:underline">Create one</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Language</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Updated</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{page.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{page.slug}</td>
                  <td className="px-6 py-4 text-sm">{page.language.toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Link
                      href={`/admin/cms/${page.id}`}
                      title="Edit"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(page.id, page.status)}
                      title={page.status === 'published' ? 'Unpublish' : 'Publish'}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      title="Delete"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
