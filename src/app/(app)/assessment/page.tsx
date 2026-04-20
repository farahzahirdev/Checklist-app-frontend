'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EvidenceUploadHint } from '@/components/evidence/evidence-upload-hint';
import { mockQuestions, mockSections } from '@/lib/checklist-mocks';
import { getCurrentAssessment, saveAssessmentAnswer, submitAssessment } from '@/lib/assessment';

type LocalAnswer = {
  answer: string;
  note_text: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function AssessmentPage() {
  const [assessmentId, setAssessmentId] = useState('');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const activeQuestion = mockQuestions[activeQuestionIndex] ?? mockQuestions[0];
  const activeAnswer = activeQuestion ? answers[activeQuestion.id] : undefined;

  const questionsInActiveSection = useMemo(() => {
    const activeSection = mockSections[0];
    return mockQuestions.filter((item) => item.sectionId === activeSection.id);
  }, []);

  async function ensureCurrentAssessmentId() {
    if (assessmentId) {
      return assessmentId;
    }
    const current = await getCurrentAssessment();
    setAssessmentId(current.assessment_id);
    return current.assessment_id;
  }

  async function onSaveAnswer() {
    if (!activeQuestion) {
      setError('No active question found.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const currentAssessmentId = await ensureCurrentAssessmentId();
      const payload = answers[activeQuestion.id];
      if (!payload?.answer) {
        throw new Error('Select an answer before saving.');
      }
      if (!isUuid(activeQuestion.id)) {
        throw new Error(
          'Question ID is not a backend UUID yet. Connect assessment questions from backend before saving answers.',
        );
      }
      const result = await saveAssessmentAnswer(currentAssessmentId, {
        question_id: activeQuestion.id,
        answer: payload.answer,
        note_text: payload.note_text || undefined,
      });
      setMessage(`Answer saved. Completion: ${result.completion_percent}%`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save answer.');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitAssessment() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const currentAssessmentId = await ensureCurrentAssessmentId();
      const result = await submitAssessment(currentAssessmentId);
      setMessage(`Assessment submitted. Completion: ${result.completion_percent}%`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Customer</p>
        <h1 className="text-3xl font-semibold">Assessment</h1>
        <p className="text-sm text-zinc-300">
          We load your current session automatically. If none exists, start one from <Link href="/access" className="underline">Access</Link>.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-white/15 bg-black/25 p-4">
          <h3 className="text-lg font-semibold">Sections</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {mockSections.map((section) => (
              <li key={section.id} className="rounded-lg border border-white/15 p-2">
                {section.order}. {section.title}
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-5">
          <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
            <h3 className="text-lg font-semibold">Current Question</h3>
            <p className="mt-3 text-sm text-zinc-300">Question ID: {activeQuestion.questionId}</p>
            <p className="mt-2 text-sm text-zinc-300">Legal Requirement: {activeQuestion.legalRequirement}</p>
            <p className="mt-2 text-sm text-zinc-400">Expected Implementation: {activeQuestion.expectedImplementation}</p>

            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2 text-sm">
                {['yes', 'partial', 'no', 'na'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [activeQuestion.id]: {
                          answer: value,
                          note_text: prev[activeQuestion.id]?.note_text ?? '',
                        },
                      }))
                    }
                    className={`rounded-lg border px-3 py-1.5 ${
                      activeAnswer?.answer === value ? 'border-cyan-300/60 bg-cyan-500/20 text-cyan-100' : 'border-white/20 text-zinc-200'
                    }`}
                  >
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>

              <textarea
                value={activeAnswer?.note_text ?? ''}
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [activeQuestion.id]: {
                      answer: prev[activeQuestion.id]?.answer ?? '',
                      note_text: event.target.value,
                    },
                  }))
                }
                placeholder="Optional note for auditor context"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-300/50 focus:ring"
                rows={3}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onSaveAnswer()}
                disabled={loading}
                className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save Answer'}
              </button>
              <button
                type="button"
                onClick={() => void onSubmitAssessment()}
                disabled={loading}
                className="rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Submitting…' : 'Submit Assessment'}
              </button>
              {assessmentId ? <p className="self-center text-xs text-zinc-400">Session: {assessmentId}</p> : null}
            </div>

            {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
          </article>

          <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
            <h3 className="text-sm font-semibold text-zinc-200">Question Navigator</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {questionsInActiveSection.map((question, idx) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`rounded-md border px-2 py-1 ${
                    idx === activeQuestionIndex ? 'border-cyan-300/60 bg-cyan-500/20 text-cyan-100' : 'border-white/20 text-zinc-200'
                  }`}
                >
                  {question.questionId}
                </button>
              ))}
            </div>
          </article>

          <EvidenceUploadHint />
        </div>
      </section>
    </section>
  );
}
