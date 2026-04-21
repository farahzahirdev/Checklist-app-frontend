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
        <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">Customer</p>
        <h1 className="text-3xl font-semibold text-[#1f2d45]">Assessment</h1>
        <p className="text-sm text-[#5f7395]">
          We load your current session automatically. If none exists, start one from{' '}
          <Link href="/access" className="font-medium text-[#2f4f83] underline">
            Access
          </Link>
          .
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-[#dbe4f4] bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-[#243555]">Sections</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {mockSections.map((section) => (
              <li key={section.id} className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-2 text-[#3f5677]">
                {section.order}. {section.title}
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-5">
          <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#243555]">Current Question</h3>
            <p className="mt-3 text-sm text-[#4f6281]">Question ID: {activeQuestion.questionId}</p>
            <p className="mt-2 text-sm text-[#4f6281]">Legal Requirement: {activeQuestion.legalRequirement}</p>
            <p className="mt-2 text-sm text-[#607594]">Expected Implementation: {activeQuestion.expectedImplementation}</p>

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
                      activeAnswer?.answer === value
                        ? 'border-[#7aa5e8] bg-[#edf4ff] text-[#2f4f83]'
                        : 'border-[#d4dced] bg-white text-[#3f5677] hover:bg-[#f6f9ff]'
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
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                rows={3}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onSaveAnswer()}
                disabled={loading}
                className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save Answer'}
              </button>
              <button
                type="button"
                onClick={() => void onSubmitAssessment()}
                disabled={loading}
                className="rounded-lg border border-[#2f9960] bg-[#e9f8ef] px-3 py-2 text-sm text-[#2f9960] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Submitting…' : 'Submit Assessment'}
              </button>
              {assessmentId ? <p className="self-center text-xs text-[#607594]">Session: {assessmentId}</p> : null}
            </div>

            {message ? <p className="mt-3 text-sm text-[#2f9960]">{message}</p> : null}
            {error ? <p className="mt-3 text-sm text-[#c43e53]">{error}</p> : null}
          </article>

          <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#243555]">Question Navigator</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {questionsInActiveSection.map((question, idx) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`rounded-md border px-2 py-1 ${
                    idx === activeQuestionIndex
                      ? 'border-[#7aa5e8] bg-[#edf4ff] text-[#2f4f83]'
                      : 'border-[#d4dced] bg-white text-[#3f5677] hover:bg-[#f6f9ff]'
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
