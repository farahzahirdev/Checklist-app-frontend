'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import {
  createSection,
  deleteSection,
  getChecklistById,
  getSectionsByChecklist,
  updateChecklist,
  updateSection,
} from '@/lib/checklist-api';
import type { Checklist, ChecklistSection } from '@/lib/checklist-types';

export default function ChecklistDetailPage() {
  const params = useParams<{ checklistId: string }>();
  const checklistId = String(params.checklistId);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [title, setTitle] = useState('');
  const [lawDecree, setLawDecree] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionOrder, setNewSectionOrder] = useState('1');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [checklistResponse, sectionsResponse] = await Promise.all([
        getChecklistById(checklistId),
        getSectionsByChecklist(checklistId),
      ]);
      setChecklist(checklistResponse);
      setTitle(checklistResponse.title);
      setLawDecree(checklistResponse.lawDecree);
      setStatus(checklistResponse.status);
      setSections(sectionsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load checklist.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [checklistId]);

  async function onUpdateChecklist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await updateChecklist(checklistId, { title, lawDecree, status });
      setMessage('Checklist updated.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update checklist.');
    }
  }

  async function onCreateSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await createSection(checklistId, { title: newSectionTitle, order: Number(newSectionOrder) });
      setNewSectionTitle('');
      setNewSectionOrder('1');
      setMessage('Section created.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create section.');
    }
  }

  async function onDeleteSection(sectionId: string) {
    setError('');
    setMessage('');
    try {
      await deleteSection(checklistId, sectionId);
      setMessage('Section deleted.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete section.');
    }
  }

  async function onSaveSection(section: ChecklistSection) {
    setError('');
    setMessage('');
    try {
      await updateSection(checklistId, section.id, { title: editingSectionTitle, order: section.order });
      setEditingSectionId(null);
      setEditingSectionTitle('');
      setMessage('Section updated.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update section.');
    }
  }

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin/checklists" className="inline-flex items-center gap-1 text-sm font-medium text-[#425f8f] hover:text-[#223a63]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M15 6 9 12l6 6M9 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
          <h1 className="text-3xl font-semibold">Checklist Detail</h1>
        </div>
      </header>

      {error ? <p className="rounded-lg bg-[#ffedf0] px-3 py-2 text-sm text-[#cc5163]">{error}</p> : null}
      {message ? <p className="rounded-lg bg-[#e9f8ef] px-3 py-2 text-sm text-[#2f9960]">{message}</p> : null}

      <form onSubmit={onUpdateChecklist} className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-[#243555]">Checklist Metadata</h2>
        <label className="block space-y-2 text-sm text-[#3b4d6c]">
          <span className="font-medium">Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" />
        </label>
        <label className="block space-y-2 text-sm text-[#3b4d6c]">
          <span className="font-medium">Law decree</span>
          <input value={lawDecree} onChange={(e) => setLawDecree(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" />
        </label>
        <label className="block space-y-2 text-sm text-[#3b4d6c]">
          <span className="font-medium">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <button disabled={loading} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
          Save checklist
        </button>
      </form>

      <form onSubmit={onCreateSection} className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-[#243555]">Create Section</h2>
        <label className="block space-y-2 text-sm text-[#3b4d6c]">
          <span className="font-medium">Section title</span>
          <input value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} placeholder="Section title" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
        </label>
        <label className="block space-y-2 text-sm text-[#3b4d6c]">
          <span className="font-medium">Display order</span>
          <input value={newSectionOrder} onChange={(e) => setNewSectionOrder(e.target.value)} type="number" min={1} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
        </label>
        <button className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">Add section</button>
      </form>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f3f6fc] text-[#607594]">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id} className="border-t border-[#edf2f9]">
                  <td className="px-4 py-3">{section.order}</td>
                  <td className="px-4 py-3">
                    {editingSectionId === section.id ? (
                      <input
                        value={editingSectionTitle}
                        onChange={(e) => setEditingSectionTitle(e.target.value)}
                        className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-1"
                      />
                    ) : (
                      section.title
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/checklists/${checklistId}/sections/${section.id}`} className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]">View</Link>
                      {editingSectionId === section.id ? (
                        <button type="button" onClick={() => void onSaveSection(section)} className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2f9960] hover:bg-[#e9f8ef]">Save</button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSectionId(section.id);
                            setEditingSectionTitle(section.title);
                          }}
                          className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                        >
                          Edit
                        </button>
                      )}
                      <button type="button" onClick={() => void onDeleteSection(section.id)} className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#c43e53] hover:bg-[#fff3f5]">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
