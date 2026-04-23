'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createChecklist, deleteChecklist, getAdminChecklists, publishChecklist, updateChecklist } from '@/lib/checklist-api';
import type { Checklist } from '@/lib/checklist-types';

type ChecklistStatus = 'draft' | 'published';

type ChecklistCardItem = {
  id: string;
  title: string;
  lawDecree: string;
  status: ChecklistStatus;
  description: string;
  version: string;
};

export default function ChecklistPanelListPage() {
  const router = useRouter();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ChecklistStatus>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'create' | 'publish' | 'delete' | ''>('');
  const [activeChecklistId, setActiveChecklistId] = useState('');
  const [confirmDeleteChecklistId, setConfirmDeleteChecklistId] = useState<string | null>(null);
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);
  const [isCreateChecklistModalOpen, setIsCreateChecklistModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createLawDecree, setCreateLawDecree] = useState('');
  const [createStatus, setCreateStatus] = useState<'draft' | 'published'>('draft');
  const [editChecklistId, setEditChecklistId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLawDecree, setEditLawDecree] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'published'>('draft');
  const [editLoading, setEditLoading] = useState(false);

  async function loadChecklists() {
    setLoading(true);
    try {
      const data = await getAdminChecklists();
      setChecklists(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load checklists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadChecklists();
  }, []);

  const filtered = useMemo(
    () =>
      checklists.filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(search.toLowerCase()) || item.lawDecree.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || item.status === filter;
        return matchesSearch && matchesFilter;
      }),
    [checklists, search, filter],
  );

  const publishedCount = checklists.filter((item) => item.status === 'published').length;
  const draftCount = checklists.filter((item) => item.status === 'draft').length;

  function openCreateChecklistModal() {
    setCreateTitle('');
    setCreateLawDecree('');
    setCreateStatus('draft');
    setIsCreateChecklistModalOpen(true);
  }

  async function handleCreateChecklist() {
    if (!createTitle.trim() || !createLawDecree.trim()) {
      toast.error('Title and law decree are required.');
      return;
    }
    setActionLoading('create');
    try {
      const created = await createChecklist({
        title: createTitle.trim(),
        lawDecree: createLawDecree.trim(),
        status: createStatus,
      });
      toast.success('Checklist created.');
      setChecklists((previous) => [created, ...previous]);
      setIsCreateChecklistModalOpen(false);
      router.replace(`/admin/checklists/${created.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create checklist');
    } finally {
      setActionLoading('');
    }
  }

  async function handlePublish(checklistId: string) {
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

  async function handleDelete(checklistId: string) {
    setActionLoading('delete');
    setActiveChecklistId(checklistId);
    try {
      await deleteChecklist(checklistId);
      toast.success('Checklist deleted.');
      setChecklists((previous) => previous.filter((item) => item.id !== checklistId));
      setConfirmDeleteChecklistId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete checklist');
    } finally {
      setActionLoading('');
      setActiveChecklistId('');
    }
  }

  function openEditModal(checklist: Checklist) {
    setEditChecklistId(checklist.id);
    setEditTitle(checklist.title);
    setEditLawDecree(checklist.lawDecree);
    setEditStatus(checklist.status);
    setOpenCardMenuId(null);
  }

  async function handleUpdateChecklist() {
    if (!editChecklistId) return;
    if (!editTitle.trim() || !editLawDecree.trim()) {
      toast.error('Title and law decree are required.');
      return;
    }
    setEditLoading(true);
    try {
      const updated = await updateChecklist(editChecklistId, {
        title: editTitle.trim(),
        lawDecree: editLawDecree.trim(),
        status: editStatus,
      });
      setChecklists((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
      setEditChecklistId(null);
      toast.success('Checklist updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update checklist');
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <section className="relative min-h-screen bg-[linear-gradient(160deg,#eef3fb_0%,#f8fbff_45%,#eef4ff_100%)] text-[#1f2d45]">
      <div className="w-full px-6 py-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#1f2d45]">Checklist Dashboard</h1>
            <p className="mt-1 text-sm text-[#607594]">Create and manage checklist content.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateChecklistModal}
              disabled={actionLoading === 'create'}
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657]"
            >
              {actionLoading === 'create' ? 'Creating...' : '+ New checklist'}
            </button>
          </div>
        </header>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9db8e6]">Total checklists</p>
            <p className="mt-2 text-2xl font-semibold text-white">{checklists.length}</p>
          </div>
          <div className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9db8e6]">Published</p>
            <p className="mt-2 text-2xl font-semibold text-[#7cf0aa]">{publishedCount}</p>
          </div>
          <div className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9db8e6]">Drafts</p>
            <p className="mt-2 text-2xl font-semibold text-[#a9c7ff]">{draftCount}</p>
          </div>
          <div className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9db8e6]">Published ratio</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {checklists.length ? `${Math.round((publishedCount / checklists.length) * 100)}%` : '0%'}
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search checklists..."
            className="min-w-[280px] flex-1 rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]"
          />
          <div className="flex rounded-xl border border-[#d4dced] bg-[linear-gradient(130deg,#ffffff_0%,#f2f7ff_100%)] p-1">
            {(['all', 'draft', 'published'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${
                  filter === value ? 'bg-[#182843] text-white' : 'text-[#5f7395] hover:bg-[#edf4ff]'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-h-[220px]">
          {filtered.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-white">{item.title}</h2>
                    <div className="relative flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                          item.status === 'published'
                            ? 'bg-[#1f5b3d] text-[#9bf5be]'
                            : 'bg-[#163a72] text-[#c4d6f7]'
                        }`}
                      >
                        {item.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenCardMenuId((prev) => (prev === item.id ? null : item.id))}
                        className="rounded-md border border-[#2d4f83] bg-[#10284f] px-2 py-1 text-xs font-semibold text-[#dce8ff] hover:bg-[#16345f]"
                        aria-label="Checklist options"
                      >
                        ...
                      </button>
                      {openCardMenuId === item.id ? (
                        <div className="absolute right-0 top-8 z-20 min-w-[120px] rounded-lg border border-[#d4dced] bg-white p-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="w-full rounded-md px-3 py-1.5 text-left text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteChecklistId(item.id);
                              setOpenCardMenuId(null);
                            }}
                            className="w-full rounded-md px-3 py-1.5 text-left text-xs font-semibold text-[#a73a46] hover:bg-[#fff1f3]"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-[#9db8e6]">{item.lawDecree}</p>
                  <p className="mb-4 text-sm text-[#d8e6ff]">Version: {item.version}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/checklists/${item.id}`)}
                      className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657]"
                    >
                      Open panel
                    </button>
                    {item.status === 'draft' ? (
                      <button
                        type="button"
                        onClick={() => void handlePublish(item.id)}
                        disabled={actionLoading === 'publish' && activeChecklistId === item.id}
                        className="rounded-lg border border-[#2d4f83] bg-[#10284f] px-3 py-2 text-xs font-semibold text-[#9bf5be] hover:bg-[#16345f] disabled:opacity-60"
                      >
                        {actionLoading === 'publish' && activeChecklistId === item.id ? 'Publishing...' : 'Publish'}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#cad5ea] bg-[linear-gradient(160deg,#ffffff_0%,#f3f7ff_100%)] p-10 text-center shadow-sm">
              <p className="text-base font-semibold text-[#25375a]">No checklists found</p>
              <p className="mt-1 text-sm text-[#607594]">Try a different search or filter.</p>
            </div>
          )}
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/65 backdrop-blur-[1px]">
              <div className="flex items-center gap-3 rounded-xl border border-[#dbe4f4] bg-white px-4 py-3 shadow-sm">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2d4f83] border-t-transparent" />
                <span className="text-sm font-medium text-[#1f2d45]">Loading checklists...</span>
              </div>
            </div>
          ) : null}
        </div>

        {confirmDeleteChecklistId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-[#1f2d45]">Delete checklist?</h2>
              <p className="mt-2 text-sm text-[#607594]">
                This action cannot be undone. Are you sure you want to delete this checklist?
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteChecklistId(null)}
                  disabled={actionLoading === 'delete'}
                  className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(confirmDeleteChecklistId)}
                  disabled={actionLoading === 'delete'}
                  className="rounded-lg border border-[#d45f6b] bg-[#fff1f3] px-3 py-1.5 text-sm font-semibold text-[#a73a46] disabled:opacity-60"
                >
                  {actionLoading === 'delete' ? 'Deleting...' : 'Confirm delete'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isCreateChecklistModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-[#1f2d45]">New checklist</h2>
              <p className="mt-1 text-sm text-[#607594]">Fill checklist details before creating.</p>
              <div className="mt-4 space-y-3">
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Title *</span>
                  <input
                    value={createTitle}
                    onChange={(event) => setCreateTitle(event.target.value)}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                    placeholder="Checklist title"
                  />
                </label>
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Law decree *</span>
                  <input
                    value={createLawDecree}
                    onChange={(event) => setCreateLawDecree(event.target.value)}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                    placeholder="Law decree"
                  />
                </label>
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Status *</span>
                  <select
                    value={createStatus}
                    onChange={(event) => setCreateStatus(event.target.value as 'draft' | 'published')}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </label>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateChecklistModalOpen(false)}
                  disabled={actionLoading === 'create'}
                  className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreateChecklist()}
                  disabled={actionLoading === 'create'}
                  className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                >
                  {actionLoading === 'create' ? 'Creating...' : 'Create checklist'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {editChecklistId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-[#1f2d45]">Edit checklist</h2>
              <p className="mt-1 text-sm text-[#607594]">Update checklist metadata.</p>
              <div className="mt-4 space-y-3">
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Title *</span>
                  <input
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                  />
                </label>
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Law decree *</span>
                  <input
                    value={editLawDecree}
                    onChange={(event) => setEditLawDecree(event.target.value)}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                  />
                </label>
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Status *</span>
                  <select
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value as 'draft' | 'published')}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </label>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditChecklistId(null)}
                  disabled={editLoading}
                  className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleUpdateChecklist()}
                  disabled={editLoading}
                  className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                >
                  {editLoading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
