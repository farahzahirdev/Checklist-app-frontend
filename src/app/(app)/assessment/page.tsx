'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  getCurrentAssessment,
  getCurrentAssessmentDetail,
  getMediaPreviewUrl,
  saveAssessmentAnswer,
  submitAssessment,
  uploadAssessmentEvidence,
  startAssessment,
  type AssessmentCurrentDetailResponse,
  type AssessmentDetailQuestion,
} from '@/lib/assessment';
import { isAllowedEvidenceFileSize, isAllowedEvidenceMimeType } from '@/lib/upload-rules';

type LocalAnswer = {
  answer: string;
  note_text: string;
};

type FlattenedQuestion = AssessmentDetailQuestion & {
  sectionId: string;
  sectionTitle: string;
  depth: 0 | 1;
  parentQuestionTitle?: string;
};

function flattenSectionQuestions(
  sectionId: string,
  sectionTitle: string,
  questions: AssessmentDetailQuestion[],
): FlattenedQuestion[] {
  const rows: FlattenedQuestion[] = [];
  questions.forEach((question) => {
    rows.push({ ...question, sectionId, sectionTitle, depth: 0, parentQuestionTitle: undefined });
    (question.sub_questions ?? []).forEach((child) => {
      rows.push({
        ...child,
        sectionId,
        sectionTitle,
        depth: 1,
        parentQuestionTitle: question.question_title ?? question.question_id ?? 'Parent question',
      });
    });
  });
  return rows;
}

function normalizeAnswerOptionLabel(value: string) {
  const v = value.trim().toLowerCase();
  if (v === 'yes') return 'Yes';
  if (v === 'partial') return 'Partially';
  if (v === 'no') return 'No';
  if (v === 'na' || v === "don't know" || v === 'dont know') return "Don't know";
  return value;
}

function isHttpUrl(value?: string | null) {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isAssessmentNotFoundMessage(message: string) {
  const normalized = message.trim().toLowerCase();
  return normalized.includes('assessment not found') || normalized.includes('404');
}

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const checklistIdFromQuery = searchParams.get('checklist_id') ?? '';
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
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [previewUrlsByMediaId, setPreviewUrlsByMediaId] = useState<Record<string, string>>({});
  const [previewErrorsByMediaId, setPreviewErrorsByMediaId] = useState<Record<string, string>>({});
  const [subQuestionsExpanded, setSubQuestionsExpanded] = useState(true);
  const [expandedSubQuestionId, setExpandedSubQuestionId] = useState('');

  const allQuestions = useMemo(
    () =>
      (assessmentDetail?.sections ?? []).flatMap((section) =>
        flattenSectionQuestions(section.id, section.title, section.questions),
      ),
    [assessmentDetail],
  );
  const activeQuestion =
    allQuestions.find((question) => question.id === activeQuestionId) ??
    allQuestions.find((question) => question.sectionId === selectedSectionId) ??
    allQuestions[0];
  const activeAnswer = activeQuestion ? answers[activeQuestion.id] : undefined;
  const isNoteEnabledForActiveQuestion = useMemo(() => {
    if (!activeQuestion) {
      return false;
    }
    const questionWithFlexibleNote = activeQuestion as typeof activeQuestion & {
      noteEnabled?: boolean;
    };
    if (typeof questionWithFlexibleNote.note_enabled === 'boolean') {
      return questionWithFlexibleNote.note_enabled;
    }
    if (typeof questionWithFlexibleNote.noteEnabled === 'boolean') {
      return questionWithFlexibleNote.noteEnabled;
    }
    return false;
  }, [activeQuestion]);

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
    return false;
  }, [activeQuestion]);

  const questionsInActiveSection = useMemo(() => {
    if (!selectedSectionId) {
      return [];
    }
    return allQuestions.filter((item) => item.sectionId === selectedSectionId);
  }, [allQuestions, selectedSectionId]);

  const activeQuestionIndex = useMemo(() => {
    if (!activeQuestion) return -1;
    return allQuestions.findIndex((question) => question.id === activeQuestion.id);
  }, [allQuestions, activeQuestion]);

  const hasPreviousQuestion = activeQuestionIndex > 0;
  const hasNextQuestion = activeQuestionIndex >= 0 && activeQuestionIndex < allQuestions.length - 1;

  const sectionProgress = useMemo(() => {
    const bySection: Record<string, { current: number; total: number }> = {};
    const questionsBySection = new Map<string, FlattenedQuestion[]>();
    allQuestions.forEach((question) => {
      const list = questionsBySection.get(question.sectionId) ?? [];
      list.push(question);
      questionsBySection.set(question.sectionId, list);
    });

    questionsBySection.forEach((questions, sectionId) => {
      const total = questions.length;
      let current = 0;
      if (selectedSectionId === sectionId && activeQuestion) {
        const idx = questions.findIndex((question) => question.id === activeQuestion.id);
        current = idx >= 0 ? idx + 1 : 0;
      }
      bySection[sectionId] = { current, total };
    });
    return bySection;
  }, [allQuestions, selectedSectionId, activeQuestion]);

  const answerOptionsForActive = useMemo(() => {
    if (!activeQuestion) return [];
    const options = activeQuestion.answer_options ?? [];
    if (options.length) {
      return options.map((option, index) => ({
        key: (option.choice_code ?? option.label ?? `option_${index + 1}`).toLowerCase(),
        value: (option.choice_code ?? option.label ?? `option_${index + 1}`).toLowerCase(),
        label: normalizeAnswerOptionLabel(option.label ?? option.choice_code ?? `Option ${index + 1}`),
        description: option.description ?? '',
      }));
    }
    return [
      { key: 'yes', value: 'yes', label: 'Yes', description: 'Fully implemented' },
      { key: 'partial', value: 'partial', label: 'Partially', description: 'Some exceptions' },
      { key: 'no', value: 'no', label: 'No', description: 'Not implemented' },
      { key: 'na', value: 'na', label: "Don't know", description: 'Not sure' },
    ];
  }, [activeQuestion]);

  const whyThisMattersText = (activeQuestion?.how_it_works || activeQuestion?.explanation || '').trim();
  const activeQuestionSubQuestions = activeQuestion?.sub_questions ?? [];

  async function ensureCurrentAssessmentId() {
    if (assessmentId) {
      return assessmentId;
    }
    try {
      const current = await getCurrentAssessment();
      setAssessmentId(current.assessment_id);
      return current.assessment_id;
    } catch {
      if (!assessmentDetail?.checklist_id) {
        throw new Error('No active checklist found to start assessment.');
      }
      const started = await startAssessment({ checklist_id: assessmentDetail.checklist_id });
      setAssessmentId(started.assessment_id);
      return started.assessment_id;
    }
  }

  async function loadAssessmentDetail(options?: { suppressNotFoundError?: boolean }) {
    setInitialLoading(true);
    try {
      let detail: AssessmentCurrentDetailResponse;
      try {
        detail = await getCurrentAssessmentDetail(checklistIdFromQuery || undefined);
      } catch (initialErr) {
        if (!checklistIdFromQuery) {
          throw initialErr;
        }
        await startAssessment({ checklist_id: checklistIdFromQuery });
        detail = await getCurrentAssessmentDetail(checklistIdFromQuery);
      }
      setAssessmentDetail(detail);
      setAssessmentId(detail.assessment_id);
      const initialAnswers: Record<string, LocalAnswer> = {};
      detail.sections.forEach((section) => {
        section.questions.forEach((question) => {
          initialAnswers[question.id] = {
            answer: (question.current_answer?.answer ?? '').toLowerCase(),
            note_text: question.current_answer?.note_text ?? question.user_note ?? '',
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assessment details.';
      if (options?.suppressNotFoundError && isAssessmentNotFoundMessage(errorMessage)) {
        return;
      }
      setError(errorMessage);
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    void loadAssessmentDetail();
  }, [checklistIdFromQuery]);

  useEffect(() => {
    setSelectedEvidenceFile(null);
  }, [activeQuestionId]);

  useEffect(() => {
    const mediaId = activeQuestion?.illustrative_image_id;
    if (!mediaId || isHttpUrl(mediaId) || previewUrlsByMediaId[mediaId]) {
      return;
    }
    let cancelled = false;
    void getMediaPreviewUrl(mediaId)
      .then((previewUrl) => {
        if (cancelled || !previewUrl) return;
        setPreviewUrlsByMediaId((previous) => ({ ...previous, [mediaId]: previewUrl }));
        setPreviewErrorsByMediaId((previous) => {
          if (!previous[mediaId]) return previous;
          const next = { ...previous };
          delete next[mediaId];
          return next;
        });
      })
      .catch((err) => {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to load preview image.';
        setPreviewErrorsByMediaId((previous) => ({ ...previous, [mediaId]: errorMessage }));
      });
    return () => {
      cancelled = true;
    };
  }, [activeQuestion?.illustrative_image_id, previewUrlsByMediaId]);

  useEffect(() => {
    const mediaIds = (activeQuestion?.sub_questions ?? [])
      .map((subQuestion) => subQuestion.illustrative_image_id)
      .filter((mediaId): mediaId is string => Boolean(mediaId) && !isHttpUrl(mediaId));
    const missingMediaIds = mediaIds.filter((mediaId) => !previewUrlsByMediaId[mediaId] && !previewErrorsByMediaId[mediaId]);
    if (!missingMediaIds.length) {
      return;
    }
    let cancelled = false;
    void Promise.all(
      missingMediaIds.map(async (mediaId) => {
        try {
          const previewUrl = await getMediaPreviewUrl(mediaId);
          if (cancelled || !previewUrl) return;
          setPreviewUrlsByMediaId((previous) => ({ ...previous, [mediaId]: previewUrl }));
          setPreviewErrorsByMediaId((previous) => {
            if (!previous[mediaId]) return previous;
            const next = { ...previous };
            delete next[mediaId];
            return next;
          });
        } catch (err) {
          if (cancelled) return;
          const errorMessage = err instanceof Error ? err.message : 'Failed to load preview image.';
          setPreviewErrorsByMediaId((previous) => ({ ...previous, [mediaId]: errorMessage }));
        }
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [activeQuestion?.sub_questions, previewUrlsByMediaId, previewErrorsByMediaId]);

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
      toast.success('Answer saved.');
      await loadAssessmentDetail();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save answer.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitAssessment() {
    setError('');
    setMessage('');
    setSubmittingAssessment(true);
    setLoading(true);
    try {
      const currentAssessmentId = await ensureCurrentAssessmentId();
      const result = await submitAssessment(currentAssessmentId);
      setMessage(`Assessment submitted. Completion: ${result.completion_percent}%`);
      toast.success('Assessment submitted.');
      await loadAssessmentDetail({ suppressNotFoundError: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit assessment.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSubmittingAssessment(false);
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
      toast.success('Evidence uploaded successfully.');
      setSelectedEvidenceFile(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload evidence.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEvidenceLoading(false);
    }
  }

  function goToQuestionByIndex(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= allQuestions.length) return;
    const nextQuestion = allQuestions[nextIndex];
    if (!nextQuestion) return;
    setSelectedSectionId(nextQuestion.sectionId);
    setActiveQuestionId(nextQuestion.id);
  }

  return (
    <section className="space-y-4 bg-[#f4f6fa]">

      {initialLoading ? <p className="text-sm text-[#607594]">Loading assessment details...</p> : null}

      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-[#d9dee8] bg-white p-4 shadow-[0_1px_3px_rgba(18,32,61,0.08)]">
          <h3 className="text-[22px] font-semibold text-[#1f2d45]">Checklist Sections</h3>
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
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedSectionId === section.id
                        ? 'border-[#d7e4fa] bg-[#f2f7ff] text-[#20457b]'
                        : 'border-[#e4e8f0] bg-white text-[#3f5677] hover:bg-[#f8faff]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-medium">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-4 w-4 rounded-full border ${
                            selectedSectionId === section.id
                              ? 'border-[#5c84df] bg-white ring-2 ring-[#dbe7ff]'
                              : 'border-[#b9c2d4] bg-white'
                          }`}
                        >
                          {selectedSectionId === section.id ? (
                            <span className="mx-auto mt-[3px] block h-2 w-2 rounded-full bg-[#5c84df]" />
                          ) : null}
                        </span>
                        <span>{section.order}. {section.title}</span>
                      </div>
                      <span className="text-xs text-[#607594]">{sectionProgress[section.id]?.current ?? 0} / {sectionProgress[section.id]?.total ?? 0}</span>
                    </div>
                  </button>
                </li>
            ))}
          </ul>
        </aside>

        <div>
          <article className="rounded-xl border border-[#d9dee8] bg-white p-5 shadow-[0_1px_3px_rgba(18,32,61,0.08)]">
            {selectedSectionId && questionsInActiveSection.length === 0 ? (
              <div className="mt-3 rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] px-3 py-3 text-sm text-[#607594]">
                No questions for this section yet. Select another section from the left panel.
              </div>
            ) : activeQuestion ? (
              <>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-flex rounded-md bg-[#eaf1fb] px-2 py-1 text-xs font-semibold text-[#2f4f83]">
                      {selectedSectionId
                        ? `${assessmentDetail?.sections.find((s) => s.id === selectedSectionId)?.order ?? 1}. ${activeQuestion.sectionTitle}`
                        : activeQuestion.sectionTitle}
                    </span>
                    {activeQuestion.depth === 1 ? (
                      <p className="text-xs font-medium text-[#6a7f9d]">
                        Sub-question of: {activeQuestion.parentQuestionTitle || 'Parent question'}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-semibold text-[#65748f]">
                      Question {activeQuestionIndex + 1 > 0 ? activeQuestionIndex + 1 : 1} of {allQuestions.length || 1}
                    </p>
                    <div className="relative group">
                    <button
                      type="button"
                      disabled={!whyThisMattersText}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#d9e4f5] bg-[#f4f7fc] px-3 py-1.5 text-xs font-semibold text-[#4d6c98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#b8cceb] text-[10px] text-[#5f7fb4]">
                        i
                      </span>
                      Why this matters
                    </button>
                    {whyThisMattersText ? (
                      <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden w-96 rounded-lg border border-[#d9e4f5] bg-white p-4 text-sm text-[#3f5677] shadow-lg group-hover:block">
                        {whyThisMattersText}
                      </div>
                    ) : null}
                  </div>
                  </div>
                </div>

                {activeQuestionSubQuestions.length > 0 ? (
                  <div className="mb-3 rounded-lg border border-[#d9e4f5] bg-[#f4f8ff] p-3">
                    <button
                      type="button"
                      onClick={() => setSubQuestionsExpanded((previous) => !previous)}
                      className="flex w-full items-center justify-between text-left text-sm font-semibold text-[#294b7d]"
                    >
                      <span>Sub-questions ({activeQuestionSubQuestions.length})</span>
                      <span className="text-xs">{subQuestionsExpanded ? 'Hide' : 'Show'}</span>
                    </button>
                    {subQuestionsExpanded ? (
                      <div className="mt-2 space-y-2">
                        {activeQuestionSubQuestions.map((subQuestion) => (
                          <div key={subQuestion.id} className="rounded-md border border-[#d7e4fa] bg-white px-3 py-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSubQuestionId((previous) => (previous === subQuestion.id ? '' : subQuestion.id))
                              }
                              className="flex w-full items-center justify-between text-left text-sm text-[#2a3d5f]"
                            >
                              <div>
                                <p className="font-medium">
                                  {subQuestion.question_title || subQuestion.questions_title || subQuestion.question_id || 'Sub-question'}
                                </p>
                              </div>
                              <span className="text-xs text-[#4b6ea6]">
                                {expandedSubQuestionId === subQuestion.id ? 'Collapse' : 'Expand'}
                              </span>
                            </button>
                            {expandedSubQuestionId === subQuestion.id ? (
                              <div className="mt-2 space-y-1 border-t border-[#e7edf8] pt-2 text-xs text-[#3f5677]">
                                {(subQuestion.legal_requirement_title ||
                                  subQuestion.legal_requirement_description ||
                                  subQuestion.legal_requirement) ? (
                                  <p>
                                    <span className="font-semibold text-[#294b7d]">Legal requirement:</span>{' '}
                                    {subQuestion.legal_requirement_title ||
                                      subQuestion.legal_requirement_description ||
                                      subQuestion.legal_requirement}
                                  </p>
                                ) : null}
                                {subQuestion.explanation ? (
                                  <p>
                                    <span className="font-semibold text-[#294b7d]">Explanation:</span> {subQuestion.explanation}
                                  </p>
                                ) : null}
                                {subQuestion.expected_implementation ? (
                                  <p>
                                    <span className="font-semibold text-[#294b7d]">Expected implementation:</span>{' '}
                                    {subQuestion.expected_implementation}
                                  </p>
                                ) : null}
                                {subQuestion.audit_type ? (
                                  <p>
                                    <span className="font-semibold text-[#294b7d]">Audit type:</span> {subQuestion.audit_type}
                                  </p>
                                ) : null}
                                {subQuestion.security_level ? (
                                  <p>
                                    <span className="font-semibold text-[#294b7d]">Security level:</span> {subQuestion.security_level}
                                  </p>
                                ) : null}
                                {subQuestion.how_it_works ? (
                                  <p>
                                    <span className="font-semibold text-[#294b7d]">Why this matters:</span> {subQuestion.how_it_works}
                                  </p>
                                ) : null}
                                {subQuestion.admin_note ? (
                                  <p>
                                    <span className="font-semibold text-[#294b7d]">Note:</span> {subQuestion.admin_note}
                                  </p>
                                ) : null}
                                {subQuestion.illustrative_image_id ? (
                                  <div className="space-y-1">
                                    <p>
                                      <span className="font-semibold text-[#294b7d]">Example evidence:</span>
                                    </p>
                                    {isHttpUrl(subQuestion.illustrative_image_id) ||
                                    previewUrlsByMediaId[subQuestion.illustrative_image_id] ? (
                                      <div className="overflow-hidden rounded-md border border-[#dbe4f4] bg-white">
                                        <img
                                          src={
                                            isHttpUrl(subQuestion.illustrative_image_id)
                                              ? subQuestion.illustrative_image_id
                                              : (previewUrlsByMediaId[subQuestion.illustrative_image_id] ?? '')
                                          }
                                          alt="Sub-question example evidence"
                                          className="h-24 w-full object-cover"
                                        />
                                      </div>
                                    ) : previewErrorsByMediaId[subQuestion.illustrative_image_id] ? (
                                      <p className="text-[#6a7f9d]">
                                        Preview unavailable: {previewErrorsByMediaId[subQuestion.illustrative_image_id]}
                                      </p>
                                    ) : (
                                      <p className="text-[#6a7f9d]">Loading image preview...</p>
                                    )}
                                  </div>
                                ) : null}
                                {!subQuestion.legal_requirement_title &&
                                !subQuestion.legal_requirement_description &&
                                !subQuestion.legal_requirement &&
                                !subQuestion.explanation &&
                                !subQuestion.expected_implementation &&
                                !subQuestion.audit_type &&
                                !subQuestion.security_level &&
                                !subQuestion.how_it_works &&
                                !subQuestion.admin_note &&
                                !subQuestion.illustrative_image_id ? (
                                  <p className="text-[#6a7f9d]">No additional details available for this sub-question.</p>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="rounded-lg border border-[#e2e8f5] bg-white p-2">
                  <p className="px-2 py-1 text-[44px] leading-[1.1] font-semibold text-[#1f2d45]">
                    {activeQuestion.questions_title || activeQuestion.question_title || activeQuestion.legal_requirement_title || 'Question'}
                  </p>
                  <div className="mt-3 grid gap-2 md:grid-cols-4">
                    <div className="rounded-md bg-[#f7f9fe] p-2 text-xs">
                      <p className="text-[#607594]">Audit Type</p>
                      <p className="mt-1 font-semibold text-[#1f2d45]">{activeQuestion.audit_type || '-'}</p>
                    </div>
                    <div className="rounded-md bg-[#f7f9fe] p-2 text-xs">
                      <p className="text-[#607594]">Section</p>
                      <p className="mt-1 font-semibold text-[#1f2d45]">{activeQuestion.sectionTitle}</p>
                    </div>
                    <div className="rounded-md bg-[#f7f9fe] p-2 text-xs">
                      <p className="text-[#607594]">Question ID</p>
                      <p className="mt-1 font-semibold text-[#1f2d45]">{activeQuestion.question_id ?? activeQuestion.id}</p>
                    </div>
                    <div className="rounded-md bg-[#f7f9fe] p-2 text-xs">
                      <p className="text-[#607594]">Severity</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 font-semibold capitalize text-[#b23a4f]">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#d95c71]" />
                        {activeQuestion.security_level ?? '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Legal Requirement</p>
                    <p className="mt-2 text-sm text-[#2a3d5f]">
                      {activeQuestion.legal_requirement_title || activeQuestion.legal_requirement_description || activeQuestion.legal_requirement || '-'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Explanation</p>
                    <p className="mt-2 text-sm text-[#2a3d5f]">
                      {activeQuestion.explanation || '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-[2fr_1fr]">
                  <div className="rounded-lg border border-[#d7e7d9] bg-[#eef7ef] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3f7a4b]">Expected Implementation</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-[#2f5c38]">
                      {(activeQuestion.expected_implementation || '')
                        .split('\n')
                        .filter((line) => line.trim().length > 0)
                        .slice(0, 6)
                        .map((line, idx) => (
                          <li key={`expected-${idx}`}>{line}</li>
                        ))}
                      {!activeQuestion.expected_implementation ? <li>No expected implementation details provided.</li> : null}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Example Evidence</p>
                    {(isHttpUrl(activeQuestion.illustrative_image_id) ||
                      (activeQuestion.illustrative_image_id && previewUrlsByMediaId[activeQuestion.illustrative_image_id])) ? (
                      <div className="mt-2 overflow-hidden rounded-md border border-[#dbe4f4] bg-white">
                        <img
                          src={
                            isHttpUrl(activeQuestion.illustrative_image_id)
                              ? activeQuestion.illustrative_image_id ?? ''
                              : previewUrlsByMediaId[activeQuestion.illustrative_image_id ?? ''] ?? ''
                          }
                          alt="Example evidence"
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-[#607594]">
                        {activeQuestion.illustrative_image_id
                          ? previewErrorsByMediaId[activeQuestion.illustrative_image_id]
                            ? `Preview unavailable for media ${activeQuestion.illustrative_image_id}: ${previewErrorsByMediaId[activeQuestion.illustrative_image_id]}`
                            : 'Image ID received, but no image URL is available yet.'
                          : 'No example evidence image provided.'}
                      </p>
                    )}
                  </div>
                </div>

                {activeQuestion.admin_note ? (
                  <div className="mt-3 rounded-lg border border-[#e7e2ba] bg-[#fffbea] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8c6f1e]">Admin Guidance</p>
                    <p className="mt-2 whitespace-pre-line text-sm text-[#685527]">{activeQuestion.admin_note}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm text-[#607594]">No questions available for this assessment.</p>
            )}

            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-[#1f2d45]">Your answer</p>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 text-sm">
                {answerOptionsForActive.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      if (!activeQuestion) return;
                      setAnswers((prev) => ({
                        ...prev,
                        [activeQuestion.id]: {
                          answer: option.value,
                          note_text: prev[activeQuestion.id]?.note_text ?? '',
                        },
                      }));
                    }}
                    disabled={!activeQuestion}
                    className={`rounded-lg border px-3 py-3 text-left ${
                      activeAnswer?.answer === option.value
                        ? 'border-[#95c9a0] bg-[#eff8f0] text-[#2f5c38]'
                        : 'border-[#d4dced] bg-white text-[#3f5677] hover:bg-[#f6f9ff]'
                    }`}
                  >
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-xs opacity-80">{option.description || 'Select this answer'}</p>
                  </button>
                ))}
              </div>

              {isNoteEnabledForActiveQuestion ? (
                <>
                  <p className="text-sm font-semibold text-[#1f2d45]">Add a note <span className="font-normal text-[#7b88a3]">(optional)</span></p>
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
                    placeholder="Write your note here..."
                    className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                    rows={3}
                    disabled={!activeQuestion}
                  />
                </>
              ) : null}
            </div>

            {isEvidenceEnabledForActiveQuestion ? (
              <div className="mt-4 rounded-lg border border-[#dbe4f4] bg-[#f9fbff] p-3">
                <p className="text-sm font-semibold text-[#1f2d45]">Upload evidence <span className="font-normal text-[#7b88a3]">(optional)</span></p>
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
                  <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-[#d8e7d8] bg-[#f1f8f1] px-2 py-1 text-xs text-[#2f5c38]">
                    <span className="font-medium">{selectedEvidenceFile.name}</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
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
                  disabled={loading || submittingAssessment || !activeQuestion}
                  className="rounded-lg border border-[#2f9960] bg-[#e9f8ef] px-3 py-2 text-sm text-[#2f9960] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingAssessment ? 'Submitting…' : 'Submit Assessment'}
                </button>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => goToQuestionByIndex(activeQuestionIndex - 1)}
                disabled={!hasPreviousQuestion}
                className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToQuestionByIndex(activeQuestionIndex + 1)}
                disabled={!hasNextQuestion}
                className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-white hover:bg-[#223657] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
              </div>
            </div>

            {message ? <p className="mt-3 text-sm text-[#2f9960]">{message}</p> : null}
            {error ? <p className="mt-3 text-sm text-[#c43e53]">{error}</p> : null}
          </article>

        </div>
      </section>
    </section>
  );
}
