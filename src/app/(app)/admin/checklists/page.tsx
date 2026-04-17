'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccess } from '@/lib/admin-access';
import { deleteChecklist, getAdminChecklists, publishChecklist } from '@/lib/checklist-api';
import type { Checklist } from '@/lib/checklist-types';

export default function AdminChecklistsPage() {
  const { isReadOnly } = useAdminAccess();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'publish' | 'delete' | ''>('');
  const [activeChecklistId, setActiveChecklistId] = useState('');
  const [confirmDeleteChecklistId, setConfirmDeleteChecklistId] = useState<string | null>(null);

  async function loadChecklists() {
    setLoading(true);
    try {
      const response = await getAdminChecklists();
      setChecklists(response);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load checklists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadChecklists();
  }, []);

  async function onPublish(checklistId: string) {
    setActionLoading('publish');
    setActiveChecklistId(checklistId);
    try {
      await publishChecklist(checklistId);
      toast.success('Checklist published.');
      await loadChecklists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish checklist');
    } finally {
      setActionLoading('');
      setActiveChecklistId('');
    }
  }

  async function onDelete(checklistId: string) {
    setActionLoading('delete');
    setActiveChecklistId(checklistId);
    try {
      await deleteChecklist(checklistId);
      toast.success('Checklist deleted.');
      await loadChecklists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete checklist');
    } finally {
      setActionLoading('');
      setActiveChecklistId('');
      setConfirmDeleteChecklistId(null);
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
        {!isReadOnly ? (
          <Link href="/admin/checklists/new" className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
            New Checklist
          </Link>
        ) : null}
      </header>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f3f6fc] text-[#607594]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Law/Decree</th>
                <th className="px-4 py-3 text-left font-semibold">Version</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                {!isReadOnly ? <th className="px-4 py-3 text-left font-semibold">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-[#607594]" colSpan={isReadOnly ? 4 : 5}>
                    Loading checklists...
                  </td>
                </tr>
              ) : null}
              {!loading && !checklists.length ? (
                <tr>
                  <td className="px-4 py-4 text-[#607594]" colSpan={isReadOnly ? 4 : 5}>
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
                  {!isReadOnly ? (
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
                          disabled={Boolean(actionLoading)}
                          className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2f9960] hover:bg-[#e9f8ef]"
                        >
                          {actionLoading === 'publish' && activeChecklistId === checklist.id ? 'Publishing…' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteChecklistId(checklist.id)}
                          disabled={Boolean(actionLoading)}
                          className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#c43e53] hover:bg-[#fff3f5]"
                        >
                          {actionLoading === 'delete' && activeChecklistId === checklist.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      {confirmDeleteChecklistId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-[#243555]">Delete checklist?</h3>
            <p className="mt-2 text-sm text-[#607594]">This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteChecklistId(null)}
                disabled={Boolean(actionLoading)}
                className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm font-semibold text-[#2a3d5f]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onDelete(confirmDeleteChecklistId)}
                disabled={Boolean(actionLoading)}
                className="rounded-lg border border-[#d45f6b] bg-[#fff1f3] px-3 py-2 text-sm font-semibold text-[#a73a46]"
              >
                {actionLoading === 'delete' ? 'Deleting…' : 'Confirm delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
