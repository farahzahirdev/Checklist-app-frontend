'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { deleteQuestion, getQuestionsBySection, getSectionsByChecklist, updateSection } from '@/lib/checklist-api';
import type { ChecklistQuestion } from '@/lib/checklist-types';

export default function SectionDetailPage() {
  const params = useParams<{ checklistId: string; sectionId: string }>();
  const checklistId = String(params.checklistId);
  const sectionId = String(params.sectionId);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionOrder, setSectionOrder] = useState('1');
  const [previousSectionTitle, setPreviousSectionTitle] = useState('');
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadQuestions() {
    setLoading(true);
    setError('');
    try {
      const [questionsResponse, sectionsResponse] = await Promise.all([
        getQuestionsBySection(checklistId, sectionId),
        getSectionsByChecklist(checklistId),
      ]);
      setQuestions(questionsResponse);
      const currentSection = sectionsResponse.find((section) => section.id === sectionId);
      if (currentSection) {
        setPreviousSectionTitle(currentSection.title);
        setSectionTitle(currentSection.title);
        setSectionOrder(String(currentSection.order));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuestions();
  }, [checklistId, sectionId]);

  async function onUpdateSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await updateSection(checklistId, sectionId, { title: sectionTitle, order: Number(sectionOrder) });
      setMessage('Section updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update section.');
    }
  }

  async function onDeleteQuestion(questionId: string) {
    setError('');
    setMessage('');
    try {
      await deleteQuestion(checklistId, sectionId, questionId);
      setMessage('Question deleted.');
      await loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question.');
    }
  }

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <Link href={`/admin/checklists/${checklistId}`} className="inline-flex items-center gap-1 text-sm font-medium text-[#425f8f] hover:text-[#223a63]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M15 6 9 12l6 6M9 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
          <h1 className="text-3xl font-semibold">Section Detail</h1>
        </div>
        <Link
          href={`/admin/checklists/${checklistId}/sections/${sectionId}/questions/new`}
          className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]"
        >
          Add Question
        </Link>
      </header>

      {error ? <p className="rounded-lg bg-[#ffedf0] px-3 py-2 text-sm text-[#cc5163]">{error}</p> : null}
      {message ? <p className="rounded-lg bg-[#e9f8ef] px-3 py-2 text-sm text-[#2f9960]">{message}</p> : null}

      <form onSubmit={onUpdateSection} className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-[#243555]">Edit Section</h2>
        {previousSectionTitle ? <p className="text-sm text-[#607594]">Current title: {previousSectionTitle}</p> : null}
        <label className="block space-y-2 text-sm text-[#3b4d6c]">
          <span className="font-medium">Section title</span>
          <input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Section title" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" />
        </label>
        <label className="block space-y-2 text-sm text-[#3b4d6c]">
          <span className="font-medium">Display order</span>
          <input value={sectionOrder} onChange={(e) => setSectionOrder(e.target.value)} type="number" min={1} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" />
        </label>
        <button className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">Save section</button>
      </form>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f3f6fc] text-[#607594]">
              <tr>
                <th className="px-4 py-3 text-left">Question</th>
                <th className="px-4 py-3 text-left">Security</th>
                <th className="px-4 py-3 text-left">Points</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-3 text-[#607594]" colSpan={4}>
                    Loading questions...
                  </td>
                </tr>
              ) : null}
              {!loading &&
                questions.map((question) => (
                  <tr key={question.id} className="border-t border-[#edf2f9]">
                    <td className="px-4 py-3 text-[#25375a]">{question.questionId}</td>
                    <td className="px-4 py-3 text-[#5f7395]">{question.securityLevel}</td>
                    <td className="px-4 py-3 text-[#5f7395]">{question.points}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/checklists/${checklistId}/sections/${sectionId}/questions/${question.id}`}
                          className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => void onDeleteQuestion(question.id)}
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
