'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteQuestion, getQuestionById, updateQuestion } from '@/lib/checklist-api';
import type { ChecklistQuestion } from '@/lib/checklist-types';

export default function QuestionDetailPage() {
  const params = useParams<{ checklistId: string; sectionId: string; questionId: string }>();
  const router = useRouter();
  const checklistId = String(params.checklistId);
  const sectionId = String(params.sectionId);
  const questionIdParam = String(params.questionId);
  const [question, setQuestion] = useState<ChecklistQuestion | null>(null);
  const [questionId, setQuestionId] = useState('');
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [legalRequirement, setLegalRequirement] = useState('');
  const [explanation, setExplanation] = useState('');
  const [expectedImplementation, setExpectedImplementation] = useState('');
  const [points, setPoints] = useState('1');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadQuestion() {
    setLoading(true);
    setError('');
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
      setError(err instanceof Error ? err.message : 'Failed to load question');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuestion();
  }, [checklistId, sectionId, questionIdParam]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await updateQuestion(checklistId, sectionId, questionIdParam, {
        questionId,
        securityLevel,
        legalRequirement,
        explanation,
        expectedImplementation,
        points: Number(points),
        note: note || null,
      });
      setMessage('Question updated.');
      await loadQuestion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question');
    }
  }

  async function onDelete() {
    setError('');
    setMessage('');
    try {
      await deleteQuestion(checklistId, sectionId, questionIdParam);
      router.push(`/admin/checklists/${checklistId}/sections/${sectionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
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
      {error ? <p className="rounded-lg bg-[#ffedf0] px-3 py-2 text-sm text-[#cc5163]">{error}</p> : null}
      {message ? <p className="rounded-lg bg-[#e9f8ef] px-3 py-2 text-sm text-[#2f9960]">{message}</p> : null}
      {loading ? <p className="text-sm text-[#607594]">Loading question...</p> : null}
      {question ? (
        <form onSubmit={onSubmit} className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm space-y-3">
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Question ID / text</span>
            <input value={questionId} onChange={(e) => setQuestionId(e.target.value)} placeholder="Question ID / text" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Security level</span>
            <select value={securityLevel} onChange={(e) => setSecurityLevel(e.target.value as 'low' | 'medium' | 'high')} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Legal requirement</span>
            <input value={legalRequirement} onChange={(e) => setLegalRequirement(e.target.value)} placeholder="Legal requirement" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Explanation</span>
            <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Expected implementation</span>
            <textarea value={expectedImplementation} onChange={(e) => setExpectedImplementation(e.target.value)} placeholder="Expected implementation" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Points</span>
            <input value={points} onChange={(e) => setPoints(e.target.value)} type="number" min={1} placeholder="Points" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm text-[#3b4d6c]">
            <span className="font-medium">Note (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" />
          </label>
          <div className="flex gap-2">
            <button className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
              Save question
            </button>
            <button type="button" onClick={() => void onDelete()} className="rounded-xl border border-[#d45f6b] bg-[#fff1f3] px-4 py-2 text-sm font-semibold text-[#a73a46]">
              Delete
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
