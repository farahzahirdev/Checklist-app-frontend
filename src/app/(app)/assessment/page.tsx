'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { EvidenceUploadHint } from '@/components/evidence/evidence-upload-hint';
import {
  getCurrentAssessment,
  getCurrentAssessmentDetail,
  saveAssessmentAnswer,
  submitAssessment,
  uploadAssessmentEvidence,
  type AssessmentCurrentDetailResponse,
} from '@/lib/assessment';
import { isAllowedEvidenceFileSize, isAllowedEvidenceMimeType } from '@/lib/upload-rules';

type LocalAnswer = {
  answer: string;
  note_text: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function AssessmentPage() {
  const [assessmentId, setAssessmentId] = useState('');
  const [assessmentDetail, setAssessmentDetail] = useState<AssessmentCurrentDetailResponse | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState('');
  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEvidenceFile, setSelectedEvidenceFile] = useState<File | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  const allQuestions = useMemo(
    () =>
      (assessmentDetail?.sections ?? []).flatMap((section) => section.questions.map((question) => ({ ...question, sectionId: section.id }))),
    [assessmentDetail],
  );
  const activeQuestion =
    allQuestions.find((question) => question.id === activeQuestionId) ??
    allQuestions.find((question) => question.sectionId === selectedSectionId) ??
    allQuestions[0];
  const activeAnswer = activeQuestion ? answers[activeQuestion.id] : undefined;
  const isEvidenceEnabledForActiveQuestion = useMemo(() => {
    if (!activeQuestion) {
      return false;
    }

    // Backend responses may expose this flag in different shapes.
    const questionWithFlexibleEvidence = activeQuestion as typeof activeQuestion & {
      evidenceEnabled?: boolean;
      evidence_rule?: unknown;
    };

    if (typeof questionWithFlexibleEvidence.evidence_enabled === 'boolean') {
      return questionWithFlexibleEvidence.evidence_enabled;
    }
    if (typeof questionWithFlexibleEvidence.evidenceEnabled === 'boolean') {
      return questionWithFlexibleEvidence.evidenceEnabled;
    }
    if (questionWithFlexibleEvidence.evidence_rule) {
      return true;
    }

    // Keep current behavior if backend doesn't send evidence metadata yet.
    return true;
  }, [activeQuestion]);

  const questionsInActiveSection = useMemo(() => {
    if (!selectedSectionId) {
      return [];
    }
    return allQuestions.filter((item) => item.sectionId === selectedSectionId);
  }, [allQuestions, selectedSectionId]);

  async function ensureCurrentAssessmentId() {
    if (assessmentId) {
      return assessmentId;
    }
    const current = await getCurrentAssessment();
    setAssessmentId(current.assessment_id);
    return current.assessment_id;
  }

  async function loadAssessmentDetail() {
    setInitialLoading(true);
    try {
      const detail = await getCurrentAssessmentDetail();
      setAssessmentDetail(detail);
      setAssessmentId(detail.assessment_id);
      const initialAnswers: Record<string, LocalAnswer> = {};
      detail.sections.forEach((section) => {
        section.questions.forEach((question) => {
          initialAnswers[question.id] = {
            answer: (question.current_answer?.answer ?? '').toLowerCase(),
            note_text: question.current_answer?.note_text ?? '',
          };
        });
      });
      setAnswers(initialAnswers);
      const firstSection = detail.sections[0];
      const firstQuestion = firstSection?.questions[0];
      setSelectedSectionId(firstSection?.id ?? '');
      setActiveQuestionId(firstQuestion?.id ?? '');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment details.');
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    void loadAssessmentDetail();
  }, []);

  useEffect(() => {
    setSelectedEvidenceFile(null);
  }, [activeQuestionId]);

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
      await loadAssessmentDetail();
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
      await loadAssessmentDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment.');
    } finally {
      setLoading(false);
    }
  }

  async function onUploadEvidence() {
    if (!activeQuestion) {
      setError('No active question found.');
      return;
    }
    if (!selectedEvidenceFile) {
      setError('Choose an evidence file before uploading.');
      return;
    }
    if (!isAllowedEvidenceMimeType(selectedEvidenceFile.type)) {
      setError('Unsupported evidence file type.');
      return;
    }
    if (!isAllowedEvidenceFileSize(selectedEvidenceFile.size)) {
      setError('Evidence file is too large.');
      return;
    }
    if (!isUuid(activeQuestion.id)) {
      setError('Question ID is not a backend UUID yet. Connect backend question IDs before uploading evidence.');
      return;
    }

    setError('');
    setMessage('');
    setEvidenceLoading(true);
    try {
      const currentAssessmentId = await ensureCurrentAssessmentId();
      await uploadAssessmentEvidence(currentAssessmentId, activeQuestion.id, selectedEvidenceFile);
      setMessage('Evidence uploaded successfully.');
      setSelectedEvidenceFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload evidence.');
    } finally {
      setEvidenceLoading(false);
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

      {initialLoading ? <p className="text-sm text-[#607594]">Loading assessment details...</p> : null}

      <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-[#dbe4f4] bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-[#243555]">Sections</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(assessmentDetail?.sections ?? []).map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      const firstQuestionInSection = section.questions[0];
                      if (firstQuestionInSection) {
                        setActiveQuestionId(firstQuestionInSection.id);
                      }
                    }}
                    className={`w-full rounded-lg border p-2 text-left ${
                      selectedSectionId === section.id
                        ? 'border-[#7aa5e8] bg-[#edf4ff] text-[#2f4f83]'
                        : 'border-[#e2e8f5] bg-[#f7f9fe] text-[#3f5677]'
                    }`}
                  >
                    {section.order}. {section.title}
                  </button>
                </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-5">
          <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#243555]">Current Question</h3>
            {selectedSectionId && questionsInActiveSection.length === 0 ? (
              <div className="mt-3 rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] px-3 py-3 text-sm text-[#607594]">
                No questions for this section yet. Select another section from the left panel.
              </div>
            ) : activeQuestion ? (
              <>
                <p className="mt-3 text-sm text-[#4f6281]">Question ID: {activeQuestion.question_id ?? activeQuestion.id}</p>
                <p className="mt-2 text-sm text-[#4f6281]">Legal Requirement: {activeQuestion.legal_requirement ?? '-'}</p>
                <p className="mt-2 text-sm text-[#607594]">Expected Implementation: {activeQuestion.expected_implementation ?? '-'}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-[#607594]">No questions available for this assessment.</p>
            )}

            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2 text-sm">
                {['yes', 'partial', 'no', 'na'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      if (!activeQuestion) return;
                      setAnswers((prev) => ({
                        ...prev,
                        [activeQuestion.id]: {
                          answer: value,
                          note_text: prev[activeQuestion.id]?.note_text ?? '',
                        },
                      }));
                    }}
                    disabled={!activeQuestion}
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
                  activeQuestion
                    ? setAnswers((prev) => ({
                        ...prev,
                        [activeQuestion.id]: {
                          answer: prev[activeQuestion.id]?.answer ?? '',
                          note_text: event.target.value,
                        },
                      }))
                    : null
                }
                placeholder="Optional note for auditor context"
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                rows={3}
                disabled={!activeQuestion}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onSaveAnswer()}
                disabled={loading || !activeQuestion}
                className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save Answer'}
              </button>
              <button
                type="button"
                onClick={() => void onSubmitAssessment()}
                disabled={loading || !activeQuestion}
                className="rounded-lg border border-[#2f9960] bg-[#e9f8ef] px-3 py-2 text-sm text-[#2f9960] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Submitting…' : 'Submit Assessment'}
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-[#dbe4f4] bg-[#f9fbff] p-3">
              <p className="text-sm font-medium text-[#243555]">Evidence upload</p>
              {isEvidenceEnabledForActiveQuestion ? (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      onChange={(event) => setSelectedEvidenceFile(event.target.files?.[0] ?? null)}
                      className="max-w-full rounded-lg border border-[#d4dced] bg-white px-2 py-1 text-xs text-[#3f5677]"
                    />
                    <button
                      type="button"
                      onClick={() => void onUploadEvidence()}
                      disabled={evidenceLoading || !selectedEvidenceFile || !activeQuestion}
                      className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {evidenceLoading ? 'Uploading…' : 'Upload evidence'}
                    </button>
                  </div>
                  {selectedEvidenceFile ? (
                    <p className="mt-2 text-xs text-[#607594]">
                      Selected: {selectedEvidenceFile.name}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-2 text-xs text-[#607594]">Evidence is disabled for this question.</p>
              )}
            </div>

            {message ? <p className="mt-3 text-sm text-[#2f9960]">{message}</p> : null}
            {error ? <p className="mt-3 text-sm text-[#c43e53]">{error}</p> : null}
          </article>

          <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#243555]">Question Navigator</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {selectedSectionId && questionsInActiveSection.length === 0 ? (
                <p className="text-sm text-[#607594]">No questions for this section.</p>
              ) : null}
              {questionsInActiveSection.map((question) => {
                const isActive = question.id === activeQuestion?.id;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => {
                      setActiveQuestionId(question.id);
                    }}
                    className={`rounded-md border px-2 py-1 ${
                      isActive
                        ? 'border-[#7aa5e8] bg-[#edf4ff] text-[#2f4f83]'
                        : 'border-[#d4dced] bg-white text-[#3f5677] hover:bg-[#f6f9ff]'
                    }`}
                  >
                    {question.question_id ?? question.id}
                  </button>
                );
              })}
            </div>
          </article>

          <EvidenceUploadHint />
        </div>
      </section>
    </section>
  );
}
