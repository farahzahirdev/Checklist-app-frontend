'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { deleteChecklist, getAdminChecklists, publishChecklist } from '@/lib/checklist-api';
import type { Checklist } from '@/lib/checklist-types';

export default function AdminChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadChecklists() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await getAdminChecklists();
      setChecklists(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load checklists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadChecklists();
  }, []);

  async function onPublish(checklistId: string) {
    setError('');
    setMessage('');
    try {
      await publishChecklist(checklistId);
      setMessage('Checklist published.');
      await loadChecklists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish checklist');
    }
  }

  async function onDelete(checklistId: string) {
    setError('');
    setMessage('');
    try {
      await deleteChecklist(checklistId);
      setMessage('Checklist deleted.');
      await loadChecklists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete checklist');
    }
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Checklist Content</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Checklist Schemas</h1>
          <p className="mt-1 text-sm text-[#607594]">Create and manage checklist templates used by customer assessments.</p>
        </div>
        <Link href="/admin/checklists/new" className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
          New Checklist
        </Link>
      </header>

      {error ? (
        <p className="rounded-xl border border-[#ffccd3] bg-[#fff3f5] px-3 py-2 text-sm text-[#c43e53]">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-[#bde7cd] bg-[#e9f8ef] px-3 py-2 text-sm text-[#2f9960]">{message}</p>
      ) : null}

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f3f6fc] text-[#607594]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Law/Decree</th>
                <th className="px-4 py-3 text-left font-semibold">Version</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-[#607594]" colSpan={5}>
                    Loading checklists...
                  </td>
                </tr>
              ) : null}
              {!loading && !checklists.length ? (
                <tr>
                  <td className="px-4 py-4 text-[#607594]" colSpan={5}>
                    No checklists found.
                  </td>
                </tr>
              ) : null}
              {checklists.map((checklist) => (
                <tr key={checklist.id} className="border-t border-[#edf2f9]">
                  <td className="px-4 py-3 font-semibold text-[#25375a]">{checklist.title}</td>
                  <td className="px-4 py-3 text-[#5f7395]">{checklist.lawDecree}</td>
                  <td className="px-4 py-3 text-[#5f7395]">{checklist.version}</td>
                  <td className="px-4 py-3 text-[#5f7395]">
                    <span className="rounded-md bg-[#edf1f8] px-2 py-1 text-xs font-semibold text-[#607594]">{checklist.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/checklists/${checklist.id}`}
                        className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => void onPublish(checklist.id)}
                        className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2f9960] hover:bg-[#e9f8ef]"
                      >
                        Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(checklist.id)}
                        className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#c43e53] hover:bg-[#fff3f5]"
                      >
                        Delete
                      </button>
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
