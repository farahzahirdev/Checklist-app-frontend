'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createQuestion } from '@/lib/checklist-api';

export default function NewQuestionPage() {
  const params = useParams<{ checklistId: string; sectionId: string }>();
  const router = useRouter();
  const checklistId = String(params.checklistId);
  const sectionId = String(params.sectionId);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const parsedPoints = Number.parseInt(points, 10);
    if (!questionId.trim() || !legalRequirement.trim() || !explanation.trim() || !expectedImplementation.trim()) {
      setError('All required fields must be filled.');
      return;
    }
    setLoading(true);
    try {
      await createQuestion(checklistId, sectionId, {
        questionId: questionId.trim(),
        securityLevel,
        legalRequirement: legalRequirement.trim(),
        explanation: explanation.trim(),
        expectedImplementation: expectedImplementation.trim(),
        points: derivedPoints,
        note: note.trim() || null,
      });
      router.push(`/admin/checklists/${checklistId}/sections/${sectionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-semibold">Create Question</h1>
      </header>
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
        {error ? <p className="rounded-lg bg-[#ffedf0] px-3 py-2 text-sm text-[#cc5163]">{error}</p> : null}
        <button disabled={loading} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
          {loading ? 'Creating...' : 'Create question'}
        </button>
      </form>
    </section>
  );
}
