'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { deleteQuestion, getQuestionById, updateQuestion } from '@/lib/checklist-api';
import type { ChecklistQuestion } from '@/lib/checklist-types';

export default function QuestionDetailPage() {
  const params = useParams<{ checklistId: string; sectionId: string; questionId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const checklistId = String(params.checklistId);
  const sectionId = String(params.sectionId);
  const questionIdParam = String(params.questionId);
  const isViewOnly = searchParams.get('mode') === 'view';
  const [question, setQuestion] = useState<ChecklistQuestion | null>(null);
  const [questionId, setQuestionId] = useState('');
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [legalRequirement, setLegalRequirement] = useState('');
  const [explanation, setExplanation] = useState('');
  const [expectedImplementation, setExpectedImplementation] = useState('');
  const [points, setPoints] = useState('1');

  // Derive points from security level
  const derivedPoints = securityLevel === 'low' ? 1 : securityLevel === 'medium' ? 3 : 4;

  // Update points when security level changes
  useEffect(() => {
    setPoints(String(derivedPoints));
  }, [derivedPoints]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'save' | 'delete' | ''>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function loadQuestion() {
    setLoading(true);
    try {
      const response = await getQuestionById(checklistId, sectionId, questionIdParam);
      setQuestion(response);
      setQuestionId(response.questionId);
      setSecurityLevel(response.securityLevel);
      setLegalRequirement(response.legalRequirement);
      setExplanation(response.explanation);
      setExpectedImplementation(response.expectedImplementation);
      setPoints(String(response.points));
      setNote(response.note ?? '');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load question');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuestion();
  }, [checklistId, sectionId, questionIdParam]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedPoints = Number.parseInt(points, 10);
    if (!questionId.trim() || !legalRequirement.trim() || !explanation.trim() || !expectedImplementation.trim()) {
      toast.error('All required fields must be filled.');
      return;
    }
    setActionLoading('save');
    try {
      await updateQuestion(checklistId, sectionId, questionIdParam, {
        questionId: questionId.trim(),
        securityLevel,
        legalRequirement: legalRequirement.trim(),
        explanation: explanation.trim(),
        expectedImplementation: expectedImplementation.trim(),
        points: derivedPoints,
        note: note.trim() || null,
      });
      toast.success('Question updated.');
      router.push(`/admin/checklists/${checklistId}/sections/${sectionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update question');
    } finally {
      setActionLoading('');
    }
  }

  async function onDelete() {
    setActionLoading('delete');
    try {
      await deleteQuestion(checklistId, sectionId, questionIdParam);
      toast.success('Question deleted.');
      router.push(`/admin/checklists/${checklistId}/sections/${sectionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete question');
    } finally {
      setActionLoading('');
      setShowDeleteConfirm(false);
    }
  }

  return (
    <section className="space-y-5">
      <header>
        <Link href={`/admin/checklists/${checklistId}/sections/${sectionId}`} className="inline-flex items-center gap-1 text-sm font-medium text-[#425f8f] hover:text-[#223a63]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="M15 6 9 12l6 6M9 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-semibold">Question Detail</h1>
      </header>
      {loading ? <p className="text-sm text-[#607594]">Loading question...</p> : null}
      {question ? (
        isViewOnly ? (
          <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm space-y-3">
            <div className="space-y-2 text-sm text-[#3b4d6c]">
              <p className="font-medium">Question ID / text</p>
              <p className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">{questionId}</p>
            </div>
            <div className="space-y-2 text-sm text-[#3b4d6c]">
              <p className="font-medium">Security level</p>
              <p className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">{securityLevel}</p>
            </div>
            <div className="space-y-2 text-sm text-[#3b4d6c]">
              <p className="font-medium">Legal requirement</p>
              <p className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">{legalRequirement}</p>
            </div>
            <div className="space-y-2 text-sm text-[#3b4d6c]">
              <p className="font-medium">Explanation</p>
              <p className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">{explanation}</p>
            </div>
            <div className="space-y-2 text-sm text-[#3b4d6c]">
              <p className="font-medium">Expected implementation</p>
              <p className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">{expectedImplementation}</p>
            </div>
            <div className="space-y-2 text-sm text-[#3b4d6c]">
              <p className="font-medium">Points</p>
              <p className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">{points}</p>
            </div>
            <div className="space-y-2 text-sm text-[#3b4d6c]">
              <p className="font-medium">Note</p>
              <p className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">{note || '-'}</p>
            </div>
          </article>
        ) : (
        <form onSubmit={onSubmit} className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm space-y-3">
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Question ID / text <span className="text-[#c43e53]">*</span></span>
            <input value={questionId} onChange={(e) => setQuestionId(e.target.value)} placeholder="Question ID / text" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Security level <span className="text-[#c43e53]">*</span></span>
            <select value={securityLevel} onChange={(e) => setSecurityLevel(e.target.value as 'low' | 'medium' | 'high')} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Legal requirement <span className="text-[#c43e53]">*</span></span>
            <input value={legalRequirement} onChange={(e) => setLegalRequirement(e.target.value)} placeholder="Legal requirement" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Explanation <span className="text-[#c43e53]">*</span></span>
            <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Expected implementation <span className="text-[#c43e53]">*</span></span>
            <textarea value={expectedImplementation} onChange={(e) => setExpectedImplementation(e.target.value)} placeholder="Expected implementation" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Points (derived from security level)</span>
            <input value={derivedPoints} readOnly className="w-full rounded-xl border border-[#d4dced] bg-[#f0f2f5] px-3 py-2 text-[#6b7280] cursor-not-allowed" />
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Note (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" />
          </label>
          <div className="flex gap-2">
            <button disabled={Boolean(actionLoading)} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60">
              {actionLoading === 'save' ? 'Saving…' : 'Save question'}
            </button>
            <button type="button" disabled={Boolean(actionLoading)} onClick={() => setShowDeleteConfirm(true)} className="rounded-xl border border-[#d45f6b] bg-[#fff1f3] px-4 py-2 text-sm font-semibold text-[#a73a46] disabled:opacity-60">
              {actionLoading === 'delete' ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </form>
        )
      ) : null}
      {!isViewOnly && showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-[#243555]">Delete question?</h3>
            <p className="mt-2 text-sm text-[#607594]">This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={Boolean(actionLoading)}
                className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm font-semibold text-[#2a3d5f]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onDelete()}
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
