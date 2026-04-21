'use client';

import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAdminAccess } from '@/lib/admin-access';
import {
  createSection,
  deleteChecklist,
  getAdminChecklists,
  getQuestionsBySection,
  getSectionsByChecklist,
  listPublishedCustomerChecklists,
  publishChecklist,
  updateChecklist,
  updateQuestion,
  updateSection,
} from '@/lib/checklist-api';
import type { Checklist, ChecklistQuestion, ChecklistSection } from '@/lib/checklist-types';

type ChecklistTree = {
  sections: ChecklistSection[];
  questionsBySectionId: Record<string, ChecklistQuestion[]>;
};

export default function AdminChecklistsPage() {
  const { isReadOnly } = useAdminAccess();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [checklistTrees, setChecklistTrees] = useState<Record<string, ChecklistTree>>({});
  const [loading, setLoading] = useState(true);
  const [expandedChecklistIds, setExpandedChecklistIds] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<'publish' | 'delete' | 'save-checklist' | 'save-section' | 'save-question' | ''>('');
  const [activeChecklistId, setActiveChecklistId] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState('');
  const [confirmDeleteChecklistId, setConfirmDeleteChecklistId] = useState<string | null>(null);
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editingChecklistTitle, setEditingChecklistTitle] = useState('');
  const [editingChecklistLawDecree, setEditingChecklistLawDecree] = useState('');
  const [editingChecklistVersion, setEditingChecklistVersion] = useState('');
  const [editingChecklistStatus, setEditingChecklistStatus] = useState<'draft' | 'published'>('draft');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [editingSectionOrder, setEditingSectionOrder] = useState('1');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
  const [editingQuestionSecurity, setEditingQuestionSecurity] = useState<'low' | 'medium' | 'high'>('low');
  const [editingQuestionLegalRequirement, setEditingQuestionLegalRequirement] = useState('');
  const [editingQuestionExplanation, setEditingQuestionExplanation] = useState('');
  const [editingQuestionExpectedImplementation, setEditingQuestionExpectedImplementation] = useState('');
  const [editingQuestionNote, setEditingQuestionNote] = useState('');
  const [addingSectionChecklistId, setAddingSectionChecklistId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionOrder, setNewSectionOrder] = useState('1');

  async function loadChecklists() {
    setLoading(true);
    try {
      let sourceChecklists: Checklist[];
      try {
        sourceChecklists = await getAdminChecklists();
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (isReadOnly && message.includes('insufficient_permissions')) {
          const published = await listPublishedCustomerChecklists();
          sourceChecklists = published.map((checklist) => ({
            id: checklist.id,
            title: checklist.title,
            auditType: 'compliance',
            lawDecree: checklist.checklist_type?.description ?? checklist.checklist_type?.name ?? '-',
            version: checklist.version,
            status: (checklist.status === 'published' ? 'published' : 'draft') as 'draft' | 'published',
            createdAt: checklist.created_at,
            updatedAt: checklist.updated_at,
          }));
        } else {
          throw err;
        }
      }
      const sortedChecklists = [...sourceChecklists].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
      setChecklists(sortedChecklists);
      const treeEntries = await Promise.all(
        sortedChecklists.map(async (checklist) => {
          let sections: ChecklistSection[] = [];
          try {
            sections = await getSectionsByChecklist(checklist.id);
          } catch {
            sections = [];
          }
          const questionsBySectionIdEntries = await Promise.all(
            sections.map(async (section) => {
              try {
                return [section.id, await getQuestionsBySection(checklist.id, section.id)] as const;
              } catch {
                return [section.id, []] as const;
              }
            }),
          );
          return [
            checklist.id,
            {
              sections,
              questionsBySectionId: Object.fromEntries(questionsBySectionIdEntries),
            },
          ] as const;
        }),
      );
      const nextTree = Object.fromEntries(treeEntries);
      setChecklistTrees(nextTree);
      setExpandedChecklistIds((previous) =>
        Object.fromEntries(
          sortedChecklists.map((checklist) => [
            checklist.id,
            previous[checklist.id] ?? false,
          ]),
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load checklists';
      if (isReadOnly && message.includes('insufficient_permissions')) {
        setChecklists([]);
        setChecklistTrees({});
      } else {
        toast.error(message);
      }
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

  function toggleChecklistExpanded(checklistId: string) {
    setExpandedChecklistIds((previous) => ({
      ...previous,
      [checklistId]: !previous[checklistId],
    }));
  }

  function startChecklistEdit(checklist: Checklist) {
    setEditingChecklistId(checklist.id);
    setEditingChecklistTitle(checklist.title);
    setEditingChecklistLawDecree(checklist.lawDecree);
    setEditingChecklistVersion(checklist.version);
    setEditingChecklistStatus(checklist.status);
  }

  function cancelChecklistEdit() {
    setEditingChecklistId(null);
    setEditingChecklistTitle('');
    setEditingChecklistLawDecree('');
    setEditingChecklistVersion('');
    setEditingChecklistStatus('draft');
  }

  async function onSaveChecklist(checklistId: string) {
    const title = editingChecklistTitle.trim();
    const lawDecree = editingChecklistLawDecree.trim();
    const version = editingChecklistVersion.trim();
    if (!title || !lawDecree || !version) {
      toast.error('Checklist title, law/decree and version are required.');
      return;
    }
    setActionLoading('save-checklist');
    setActiveChecklistId(checklistId);
    try {
      await updateChecklist(checklistId, {
        title,
        lawDecree,
        version,
        status: editingChecklistStatus,
      });
      toast.success('Checklist updated.');
      cancelChecklistEdit();
      await loadChecklists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update checklist');
    } finally {
      setActionLoading('');
      setActiveChecklistId('');
    }
  }

  function startSectionEdit(section: ChecklistSection) {
    setEditingSectionId(section.id);
    setEditingSectionTitle(section.title);
    setEditingSectionOrder(String(section.order));
  }

  function cancelSectionEdit() {
    setEditingSectionId(null);
    setEditingSectionTitle('');
    setEditingSectionOrder('1');
  }

  async function onSaveSection(checklistId: string, sectionId: string) {
    const trimmedTitle = editingSectionTitle.trim();
    const parsedOrder = Number(editingSectionOrder);
    if (!trimmedTitle) {
      toast.error('Section title is required.');
      return;
    }
    if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
      toast.error('Section order must be a number greater than 0.');
      return;
    }
    setActionLoading('save-section');
    setActiveSectionId(sectionId);
    try {
      await updateSection(checklistId, sectionId, { title: trimmedTitle, order: parsedOrder });
      toast.success('Section updated.');
      cancelSectionEdit();
      await loadChecklists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update section');
    } finally {
      setActionLoading('');
      setActiveSectionId('');
    }
  }

  function startQuestionEdit(question: ChecklistQuestion) {
    setEditingQuestionId(question.id);
    setEditingQuestionText(question.questionId);
    setEditingQuestionSecurity(question.securityLevel);
    setEditingQuestionLegalRequirement(question.legalRequirement);
    setEditingQuestionExplanation(question.explanation);
    setEditingQuestionExpectedImplementation(question.expectedImplementation);
    setEditingQuestionNote(question.note ?? '');
  }

  function cancelQuestionEdit() {
    setEditingQuestionId(null);
    setEditingQuestionText('');
    setEditingQuestionSecurity('low');
    setEditingQuestionLegalRequirement('');
    setEditingQuestionExplanation('');
    setEditingQuestionExpectedImplementation('');
    setEditingQuestionNote('');
  }

  async function onSaveQuestion(checklistId: string, sectionId: string, questionId: string) {
    const questionText = editingQuestionText.trim();
    const legalRequirement = editingQuestionLegalRequirement.trim();
    const explanation = editingQuestionExplanation.trim();
    const expectedImplementation = editingQuestionExpectedImplementation.trim();
    const points = editingQuestionSecurity === 'low' ? 1 : editingQuestionSecurity === 'medium' ? 3 : 4;
    if (!questionText || !legalRequirement || !explanation || !expectedImplementation) {
      toast.error('Question text, legal requirement, explanation and expected implementation are required.');
      return;
    }
    setActionLoading('save-question');
    setActiveQuestionId(questionId);
    try {
      await updateQuestion(checklistId, sectionId, questionId, {
        questionId: questionText,
        securityLevel: editingQuestionSecurity,
        legalRequirement,
        explanation,
        expectedImplementation,
        points,
        note: editingQuestionNote.trim() || null,
      });
      toast.success('Question updated.');
      cancelQuestionEdit();
      await loadChecklists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update question');
    } finally {
      setActionLoading('');
      setActiveQuestionId('');
    }
  }

  async function onAddSection(checklistId: string) {
    const title = newSectionTitle.trim();
    const order = Number(newSectionOrder);
    if (!title) {
      toast.error('Section title is required.');
      return;
    }
    if (!Number.isInteger(order) || order < 1) {
      toast.error('Section order must be a number greater than 0.');
      return;
    }
    setActionLoading('save-section');
    setActiveChecklistId(checklistId);
    try {
      await createSection(checklistId, { title, order });
      toast.success('Section created.');
      setAddingSectionChecklistId(null);
      setNewSectionTitle('');
      setNewSectionOrder('1');
      await loadChecklists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create section');
    } finally {
      setActionLoading('');
      setActiveChecklistId('');
    }
  }

  return (
    <section className="space-y-4 [&_*]:rounded-none">
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

      {loading ? <p className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-4 text-sm text-[#607594]">Loading checklists...</p> : null}
      {!loading && !checklists.length ? <p className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-4 text-sm text-[#607594]">No checklists found.</p> : null}
      {!loading ? (
        <div className="space-y-4">
          {checklists.map((checklist) => {
            const tree = checklistTrees[checklist.id];
            const sections = tree?.sections ?? [];
            const questionCount = sections.reduce((count, section) => count + (tree?.questionsBySectionId[section.id]?.length ?? 0), 0);
            const isExpanded = expandedChecklistIds[checklist.id] ?? true;

            return (
              <article key={checklist.id} className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
                <div className="space-y-3 border-b border-[#edf2f9] px-5 py-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleChecklistExpanded(checklist.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleChecklistExpanded(checklist.id);
                      }
                    }}
                    className="flex cursor-pointer flex-wrap items-center justify-between gap-2"
                  >
                    <h2 className="text-xl font-semibold text-[#25375a]">{checklist.title}</h2>
                    <span className="text-xs font-semibold text-[#3e69b0]">{isExpanded ? 'Collapse checklist' : 'Expand checklist'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#5f7395]">
                    <span>Law/Decree: {checklist.lawDecree}</span>
                    <span>Version: {checklist.version}</span>
                    <span className="rounded-md bg-[#edf1f8] px-2 py-1 font-semibold text-[#607594]">{checklist.status}</span>
                    <span>{sections.length} sections</span>
                    <span>{questionCount} questions</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/checklists/${checklist.id}?mode=view`}
                      className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                    >
                      View Details
                    </Link>
                    {!isReadOnly ? (
                      <button
                        type="button"
                        onClick={() => startChecklistEdit(checklist)}
                        className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                      >
                        Quick Edit Checklist
                      </button>
                    ) : null}
                    {!isReadOnly ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingSectionChecklistId(checklist.id);
                            setNewSectionTitle('');
                            setNewSectionOrder(String((sections[sections.length - 1]?.order ?? 0) + 1));
                          }}
                          className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2d4f83] hover:bg-[#edf4ff]"
                        >
                          Add Section
                        </button>
                        <button
                          type="button"
                          onClick={() => void onPublish(checklist.id)}
                          disabled={Boolean(actionLoading)}
                          className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2f9960] hover:bg-[#e9f8ef] disabled:opacity-60"
                        >
                          {actionLoading === 'publish' && activeChecklistId === checklist.id ? 'Publishing…' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteChecklistId(checklist.id)}
                          disabled={Boolean(actionLoading)}
                          className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#c43e53] hover:bg-[#fff3f5] disabled:opacity-60"
                        >
                          {actionLoading === 'delete' && activeChecklistId === checklist.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </>
                    ) : null}
                  </div>
                  {editingChecklistId === checklist.id ? (
                    <div className="rounded-lg border border-[#d9e3f6] bg-[#f9fbff] p-3">
                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="space-y-1 text-xs text-[#3b4d6c]">
                          <span className="font-medium">Title</span>
                          <input value={editingChecklistTitle} onChange={(event) => setEditingChecklistTitle(event.target.value)} className="w-full rounded-lg border border-[#d4dced] bg-white px-2.5 py-1.5" />
                        </label>
                        <label className="space-y-1 text-xs text-[#3b4d6c]">
                          <span className="font-medium">Law/Decree</span>
                          <input value={editingChecklistLawDecree} onChange={(event) => setEditingChecklistLawDecree(event.target.value)} className="w-full rounded-lg border border-[#d4dced] bg-white px-2.5 py-1.5" />
                        </label>
                        <label className="space-y-1 text-xs text-[#3b4d6c]">
                          <span className="font-medium">Version</span>
                          <input value={editingChecklistVersion} onChange={(event) => setEditingChecklistVersion(event.target.value)} className="w-full rounded-lg border border-[#d4dced] bg-white px-2.5 py-1.5" />
                        </label>
                        <label className="space-y-1 text-xs text-[#3b4d6c]">
                          <span className="font-medium">Status</span>
                          <select
                            value={editingChecklistStatus}
                            onChange={(event) => setEditingChecklistStatus(event.target.value as 'draft' | 'published')}
                            className="w-full rounded-lg border border-[#d4dced] bg-white px-2.5 py-1.5"
                          >
                            <option value="draft">draft</option>
                            <option value="published">published</option>
                          </select>
                        </label>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void onSaveChecklist(checklist.id)}
                          disabled={actionLoading === 'save-checklist'}
                          className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                        >
                          {actionLoading === 'save-checklist' && activeChecklistId === checklist.id ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelChecklistEdit}
                          disabled={actionLoading === 'save-checklist'}
                          className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#425f8f] hover:bg-[#edf4ff] disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {!isReadOnly && addingSectionChecklistId === checklist.id ? (
                    <div className="rounded-lg border border-[#d9e3f6] bg-[#f9fbff] p-3">
                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="space-y-1 text-xs text-[#3b4d6c]">
                          <span className="font-medium">Section title</span>
                          <input
                            value={newSectionTitle}
                            onChange={(event) => setNewSectionTitle(event.target.value)}
                            placeholder="New section title"
                            className="w-full rounded-lg border border-[#d4dced] bg-white px-2.5 py-1.5"
                          />
                        </label>
                        <label className="space-y-1 text-xs text-[#3b4d6c]">
                          <span className="font-medium">Display order</span>
                          <input
                            value={newSectionOrder}
                            onChange={(event) => setNewSectionOrder(event.target.value)}
                            type="number"
                            min={1}
                            className="w-full rounded-lg border border-[#d4dced] bg-white px-2.5 py-1.5"
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void onAddSection(checklist.id)}
                          disabled={actionLoading === 'save-section'}
                          className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                        >
                          {actionLoading === 'save-section' && activeChecklistId === checklist.id ? 'Adding…' : 'Create section'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingSectionChecklistId(null);
                            setNewSectionTitle('');
                            setNewSectionOrder('1');
                          }}
                          disabled={actionLoading === 'save-section'}
                          className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#425f8f] hover:bg-[#edf4ff] disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {isExpanded ? (
                  <div
                    className="max-h-[420px] overflow-y-auto px-5 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {!sections.length ? <p className="text-sm text-[#607594]">No sections created yet.</p> : null}
                    <div className="space-y-3">
                      {sections.map((section) => {
                        const questions = tree?.questionsBySectionId[section.id] ?? [];
                        return (
                          <div key={section.id} className="rounded-xl border border-[#e8edf8] bg-[#f9fbff] p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-[#2b4067]">
                                {section.order}. {section.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                {!isReadOnly ? (
                                  <button
                                    type="button"
                                    onClick={() => startSectionEdit(section)}
                                    className="rounded-lg border border-[#d4dced] px-2.5 py-1 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                                  >
                                    Quick Edit
                                  </button>
                                ) : null}
                                <Link
                                  href={`/admin/checklists/${checklist.id}/sections/${section.id}?mode=view`}
                                  className="rounded-lg border border-[#d4dced] px-2.5 py-1 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                                >
                                  Section Details
                                </Link>
                                <Link
                                  href={`/admin/checklists/${checklist.id}/sections/${section.id}/questions/new`}
                                  className="rounded-lg border border-[#d4dced] px-2.5 py-1 text-xs font-semibold text-[#2d4f83] hover:bg-[#edf4ff]"
                                >
                                  Add Question
                                </Link>
                              </div>
                            </div>
                            {editingSectionId === section.id ? (
                              <div className="mt-3 rounded-lg border border-[#d9e3f6] bg-white p-3">
                                <div className="grid gap-2 md:grid-cols-2">
                                  <label className="space-y-1 text-xs text-[#3b4d6c]">
                                    <span className="font-medium">Section title</span>
                                    <input
                                      value={editingSectionTitle}
                                      onChange={(event) => setEditingSectionTitle(event.target.value)}
                                      className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2.5 py-1.5"
                                    />
                                  </label>
                                  <label className="space-y-1 text-xs text-[#3b4d6c]">
                                    <span className="font-medium">Display order</span>
                                    <input
                                      value={editingSectionOrder}
                                      onChange={(event) => setEditingSectionOrder(event.target.value)}
                                      type="number"
                                      min={1}
                                      className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2.5 py-1.5"
                                    />
                                  </label>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void onSaveSection(checklist.id, section.id)}
                                    disabled={actionLoading === 'save-section'}
                                    className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                                  >
                                    {actionLoading === 'save-section' && activeSectionId === section.id ? 'Saving…' : 'Save'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelSectionEdit}
                                    disabled={actionLoading === 'save-section'}
                                    className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#425f8f] hover:bg-[#edf4ff] disabled:opacity-60"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : null}
                            <div className="mt-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                              <table className="min-w-full table-fixed text-xs">
                                <thead className="bg-[#f1f5fd] text-[#607594]">
                                  <tr>
                                    <th className="w-[52%] px-3 py-2 text-left">Question</th>
                                    <th className="w-[14%] px-3 py-2 text-left">Security</th>
                                    <th className="w-[10%] px-3 py-2 text-left">Points</th>
                                    <th className="w-[24%] px-3 py-2 text-left">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {questions.map((question) => (
                                    <Fragment key={question.id}>
                                      <tr className="border-t border-[#e5ecfa] bg-white">
                                        <td className="px-3 py-2 text-[#304568]">
                                          <span className="block truncate" title={question.questionId}>
                                            {question.questionId}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 text-[#5f7395]">{question.securityLevel}</td>
                                        <td className="px-3 py-2 text-[#5f7395]">{question.points}</td>
                                        <td className="px-3 py-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                              href={`/admin/checklists/${checklist.id}/sections/${section.id}/questions/${question.id}?mode=view`}
                                              className="rounded-lg border border-[#d4dced] px-2.5 py-1 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                                            >
                                              View
                                            </Link>
                                            {!isReadOnly ? (
                                              <button
                                                type="button"
                                                onClick={() => startQuestionEdit(question)}
                                                className="rounded-lg border border-[#d4dced] px-2.5 py-1 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                                              >
                                                Quick Edit
                                              </button>
                                            ) : null}
                                          </div>
                                        </td>
                                      </tr>
                                      {editingQuestionId === question.id ? (
                                        <tr className="border-t border-[#e5ecfa] bg-[#fcfdff]">
                                          <td colSpan={4} className="px-3 py-3">
                                            <div className="rounded-lg border border-[#d9e3f6] bg-white p-3">
                                              <div className="grid gap-2 md:grid-cols-2">
                                                <label className="space-y-1 text-xs text-[#3b4d6c] md:col-span-2">
                                                  <span className="font-medium">Question ID / text</span>
                                                  <input
                                                    value={editingQuestionText}
                                                    onChange={(event) => setEditingQuestionText(event.target.value)}
                                                    className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2.5 py-1.5"
                                                  />
                                                </label>
                                                <label className="space-y-1 text-xs text-[#3b4d6c]">
                                                  <span className="font-medium">Security level</span>
                                                  <select
                                                    value={editingQuestionSecurity}
                                                    onChange={(event) => setEditingQuestionSecurity(event.target.value as 'low' | 'medium' | 'high')}
                                                    className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2.5 py-1.5"
                                                  >
                                                    <option value="low">low</option>
                                                    <option value="medium">medium</option>
                                                    <option value="high">high</option>
                                                  </select>
                                                </label>
                                                <label className="space-y-1 text-xs text-[#3b4d6c]">
                                                  <span className="font-medium">Points</span>
                                                  <input
                                                    readOnly
                                                    value={editingQuestionSecurity === 'low' ? 1 : editingQuestionSecurity === 'medium' ? 3 : 4}
                                                    className="w-full cursor-not-allowed rounded-lg border border-[#d4dced] bg-[#f0f2f5] px-2.5 py-1.5 text-[#6b7280]"
                                                  />
                                                </label>
                                                <label className="space-y-1 text-xs text-[#3b4d6c] md:col-span-2">
                                                  <span className="font-medium">Legal requirement</span>
                                                  <input
                                                    value={editingQuestionLegalRequirement}
                                                    onChange={(event) => setEditingQuestionLegalRequirement(event.target.value)}
                                                    className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2.5 py-1.5"
                                                  />
                                                </label>
                                                <label className="space-y-1 text-xs text-[#3b4d6c]">
                                                  <span className="font-medium">Explanation</span>
                                                  <textarea
                                                    value={editingQuestionExplanation}
                                                    onChange={(event) => setEditingQuestionExplanation(event.target.value)}
                                                    className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2.5 py-1.5"
                                                  />
                                                </label>
                                                <label className="space-y-1 text-xs text-[#3b4d6c]">
                                                  <span className="font-medium">Expected implementation</span>
                                                  <textarea
                                                    value={editingQuestionExpectedImplementation}
                                                    onChange={(event) => setEditingQuestionExpectedImplementation(event.target.value)}
                                                    className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2.5 py-1.5"
                                                  />
                                                </label>
                                                <label className="space-y-1 text-xs text-[#3b4d6c] md:col-span-2">
                                                  <span className="font-medium">Note (optional)</span>
                                                  <input
                                                    value={editingQuestionNote}
                                                    onChange={(event) => setEditingQuestionNote(event.target.value)}
                                                    className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2.5 py-1.5"
                                                  />
                                                </label>
                                              </div>
                                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => void onSaveQuestion(checklist.id, section.id, editingQuestionId)}
                                                  disabled={actionLoading === 'save-question'}
                                                  className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                                                >
                                                  {actionLoading === 'save-question' && activeQuestionId === editingQuestionId ? 'Saving…' : 'Save'}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={cancelQuestionEdit}
                                                  disabled={actionLoading === 'save-question'}
                                                  className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#425f8f] hover:bg-[#edf4ff] disabled:opacity-60"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      ) : null}
                                    </Fragment>
                                  ))}
                                  {!questions.length ? (
                                    <tr>
                                      <td className="px-3 py-3 text-[#607594]" colSpan={4}>
                                        No questions in this section.
                                      </td>
                                    </tr>
                                  ) : null}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
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
