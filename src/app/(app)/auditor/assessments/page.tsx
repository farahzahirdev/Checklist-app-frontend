'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuditorAccess } from '@/lib/auditor-access';
import {
  getCurrentAssessment,
  getAssessmentAnswers,
  getCurrentAssessmentDetail,
  getMediaPreviewUrl,
  saveAssessmentAnswer,
  submitAssessment,
  uploadAssessmentEvidence,
} from '@/lib/assessment';

interface AssessmentAnswer {
  answer: string;
  note_text?: string;
}

interface AssessmentQuestion {
  id: string;
  question_text?: string;
  question_id?: string;
  legal_requirement_title?: string;
  legal_requirement_description?: string;
  explanation?: string;
  expected_implementation?: string;
  illustrative_image_id?: string;
  evidence_enabled?: boolean;
  answer_options?: Array<{
    label?: string;
    choice_code?: string;
    score?: number;
    description?: string;
  }>;
  sub_questions?: AssessmentQuestion[];
}

interface AssessmentSection {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
}

interface AssessmentDetail {
  checklist_title?: string;
  sections?: AssessmentSection[];
}

export default function AuditorAssessmentsPage() {
  const { isReadOnly } = useAuditorAccess();
  const [assessmentDetail, setAssessmentDetail] = useState<AssessmentDetail | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState('');
  const [activeQuestionCursor, setActiveQuestionCursor] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [persistedAnswerByQuestionId, setPersistedAnswerByQuestionId] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [autoSaving, setAutoSaving] = useState<Record<string, boolean>>({});
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidencePreviewUrl, setEvidencePreviewUrl] = useState<string | null>(null);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [previewUrlsByMediaId, setPreviewUrlsByMediaId] = useState<Record<string, string>>({});
  const [previewErrorsByMediaId, setPreviewErrorsByMediaId] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isSubmittedChecklist, setIsSubmittedChecklist] = useState(false);

  // Helper function to check if string is a UUID
  function isUuid(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  // Helper function to check if URL is HTTP
  function isHttpUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  // Load assessment detail
  async function loadAssessmentDetail() {
    setInitialLoading(true);
    setError('');
    try {
      const response = await getCurrentAssessmentDetail();
      setAssessmentDetail(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
    } finally {
      setInitialLoading(false);
    }
  }

  // Auto-save answer function (read-only mode - just shows feedback)
  async function handleAutoSaveAnswer(answerValue: string) {
    if (!activeQuestion) {
      return;
    }
    
    // In read-only mode, just show visual feedback
    setAutoSaving((prev) => ({ ...prev, [activeQuestion.id]: true }));
    
    // Update local state immediately
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        answer: answerValue,
        note_text: prev[activeQuestion.id]?.note_text ?? '',
      },
    }));
    
    // Clear auto-saving indicator after a short delay
    setTimeout(() => {
      setAutoSaving((prev) => {
        const next = { ...prev };
        delete next[activeQuestion.id];
        return next;
      });
    }, 1000);
    
    // Show read-only message
    toast.info('Assessment is in read-only mode for auditors');
  }

  useEffect(() => {
    void loadAssessmentDetail();
  }, []);

  // Memoized calculations
  const allQuestions = useMemo(
    () =>
      (assessmentDetail?.sections ?? []).flatMap((section) =>
        flattenSectionQuestions(section.id, section.title, section.questions),
      ),
    [assessmentDetail],
  );

  const activeQuestion = useMemo(() => {
    return allQuestions.find((q) => q.id === activeQuestionId) || null;
  }, [allQuestions, activeQuestionId]);

  const activeAnswer = useMemo(() => {
    return activeQuestion ? answers[activeQuestion.id] : null;
  }, [activeQuestion, answers]);

  const isNoteEnabledForActiveQuestion = useMemo(() => {
    return activeQuestion?.evidence_enabled ?? false;
  }, [activeQuestion]);

  const isOnLastQuestion = useMemo(() => {
    if (!allQuestions.length || !activeQuestion) return false;
    const currentIndex = allQuestions.findIndex((q) => q.id === activeQuestion.id);
    return currentIndex === allQuestions.length - 1;
  }, [allQuestions, activeQuestion]);

  const areAllQuestionsAnswered = useMemo(() => {
    return allQuestions.every((q) => answers[q.id]?.answer);
  }, [allQuestions, answers]);

  const questionsBySection = useMemo(() => {
    const bySection = new Map();
    (assessmentDetail?.sections ?? []).forEach((section) => {
      bySection.set(section.id, {
        title: section.title,
        questions: flattenSectionQuestions(section.id, section.title, section.questions),
      });
    });
    return bySection;
  }, [assessmentDetail]);

  // Helper to flatten section questions
  function flattenSectionQuestions(
    sectionId: string,
    sectionTitle: string,
    questions: any[],
  ): any[] {
    const flat: any[] = [];
    const questionStack: { question: any; depth: number }[] = [];
    
    questions.forEach((question) => {
      questionStack.push({ question, depth: 0 });
    });

    while (questionStack.length > 0) {
      const { question, depth } = questionStack.pop()!;
      flat.push({
        ...question,
        sectionId,
        sectionTitle,
        depth,
      });

      if (question.sub_questions && question.sub_questions.length > 0) {
        question.sub_questions.forEach((subQ: any) => {
          questionStack.push({ question: subQ, depth: depth + 1 });
        });
      }
    }

    return flat;
  }

  // Generate answer options
  const answerOptionsForActive = useMemo(() => {
    const options = activeQuestion?.answer_options ?? [];
    if (options.length) {
      return options.map((option, index) => ({
        key: String(index + 1),
        value: String(
          typeof option.score === 'number' && Number.isFinite(option.score) ? option.score : Math.max(1, 4 - index),
        ),
        label: normalizeAnswerOptionLabel(option.label ?? option.choice_code ?? `Option ${index + 1}`),
        description: option.description ?? '',
      }));
    }
    return [
      { key: '4', value: '4', label: 'Yes', description: 'Control is fully implemented.' },
      { key: '3', value: '3', label: 'Partially', description: 'Control is partially implemented.' },
      { key: '2', value: '2', label: "Don't know", description: 'Not sure' },
      { key: '1', value: '1', label: 'No', description: 'Not implemented' },
    ];
  }, [activeQuestion?.answer_options]);

  function normalizeAnswerOptionLabel(value: string) {
    const v = value.trim().toLowerCase();
    if (v === 'yes') return 'Yes';
    if (v === 'partial' || v === 'partially') return 'Partially';
    if (v === "don't know" || v === "dont know") return "Don't know";
    if (v === 'no') return 'No';
    return v;
  }

  // Load preview URLs for illustrative images
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

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-300 border-t-transparent"></div>
          <p className="mt-4 text-lg">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-6 py-4">
            <h2 className="text-lg font-semibold text-red-200">Assessment Error</h2>
            <p className="mt-2 text-red-100">{error}</p>
            <button
              type="button"
              onClick={() => void loadAssessmentDetail()}
              className="mt-4 rounded-lg border border-red-400/30 bg-red-500/20 px-4 py-2 text-sm text-red-200 hover:bg-red-500/30"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1d3a]">
      <header className="border-b border-[#1e3a5f] bg-[#182843]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#9dc5ff]">Assessment</p>
              <h1 className="text-xl font-semibold text-white">
                {assessmentDetail?.checklist_title || 'Assessment'} 
                <span className="ml-2 rounded-full bg-yellow-500 px-2 py-1 text-xs text-white">Auditor View</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/auditor"
                className="rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]"
              >
                ← Back to Dashboard
              </Link>
              {message && (
                <div className="rounded-lg border border-green-400/30 bg-green-500/10 px-3 py-1 text-sm text-green-200">
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Section Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">Sections</h2>
              <div className="space-y-2">
                {assessmentDetail?.sections?.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      const sectionQuestions = flattenSectionQuestions(section.id, section.title, section.questions);
                      if (sectionQuestions.length > 0) {
                        setActiveQuestionId(sectionQuestions[0].id);
                        setActiveQuestionCursor(0);
                      }
                    }}
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm ${
                      selectedSectionId === section.id
                        ? 'border-[#95c9a0] bg-[#eff8f0] text-[#2f5c38]'
                        : 'border-[#345793] bg-[#0d1d3a] text-[#d8e2f2] hover:bg-[#1f7bff]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{section.title}</span>
                      <span className="text-xs opacity-70">({flattenSectionQuestions(section.id, section.title, section.questions).length})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Navigation */}
            {selectedSectionId && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Questions</h3>
                <div className="space-y-1">
                  {(() => {
                    const sectionQuestions = flattenSectionQuestions(selectedSectionId, '', 
                      assessmentDetail?.sections?.find(s => s.id === selectedSectionId)?.questions ?? []
                    );
                    return sectionQuestions.map((question, index) => (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => {
                          setActiveQuestionId(question.id);
                          setActiveQuestionCursor(index);
                        }}
                        className={`w-full text-left rounded-lg border px-3 py-2 text-sm ${
                          activeQuestionId === question.id
                            ? 'border-[#95c9a0] bg-[#eff8f0] text-[#2f5c38]'
                            : 'border-[#345793] bg-[#0d1d3a] text-[#d8e2f2] hover:bg-[#1f7bff]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Q{index + 1}: {question.question_text || question.question_id || 'Untitled'}</span>
                          {answers[question.id] && (
                            <span className="text-xs opacity-70">✓</span>
                          )}
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeQuestion && !isSubmittedChecklist ? (
              <div className="space-y-6">
                {/* Question Header */}
                <div className="rounded-lg border border-[#345793] bg-[#0d1d3a] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-2">
                        {activeQuestion.question_text || activeQuestion.question_id}
                      </h2>
                      {activeQuestion.legal_requirement_title && (
                        <p className="text-sm text-[#97a5bb] mt-1">{activeQuestion.legal_requirement_title}</p>
                      )}
                      {activeQuestion.legal_requirement_description && (
                        <p className="text-sm text-[#d8e2f2] mt-2">{activeQuestion.legal_requirement_description}</p>
                      )}
                      {activeQuestion.explanation && (
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold text-[#9dc5ff] mb-2">Explanation</h3>
                          <p className="text-sm text-[#d8e2f2]">{activeQuestion.explanation}</p>
                        </div>
                      )}
                      {activeQuestion.expected_implementation && (
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold text-[#9dc5ff] mb-2">Expected Implementation</h3>
                          <p className="text-sm text-[#d8e2f2]">{activeQuestion.expected_implementation}</p>
                        </div>
                      )}
                    </div>
                    {activeQuestion.illustrative_image_id && (isHttpUrl(activeQuestion.illustrative_image_id) || previewUrlsByMediaId[activeQuestion.illustrative_image_id]) ? (
                      <div className="mt-4 w-full max-w-[220px] overflow-hidden rounded-md border border-[#dbe4f4] bg-white">
                        <img 
                          src={
                            isHttpUrl(activeQuestion.illustrative_image_id)
                              ? activeQuestion.illustrative_image_id
                              : previewUrlsByMediaId[activeQuestion.illustrative_image_id]
                          } 
                          alt="Illustrative image" 
                          className="h-16 w-full object-cover" 
                        />
                      </div>
                    ) : previewErrorsByMediaId[activeQuestion.illustrative_image_id || ''] ? (
                      <div className="mt-2 text-xs text-red-400">
                        Failed to load image: {previewErrorsByMediaId[activeQuestion.illustrative_image_id || '']}
                      </div>
                    ) : null}
                  </div>

                  {/* Answer Options */}
                  <div className="rounded-lg border border-[#345793] bg-[#0d1d3a] p-6">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-[#1f2d45]">Your answer</p>
                      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 text-sm">
                        {answerOptionsForActive.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => {
                              // Update UI immediately for better UX
                              setAnswers((prev) => ({
                                ...prev,
                                [activeQuestion.id]: {
                                  answer: option.value,
                                  note_text: prev[activeQuestion.id]?.note_text ?? '',
                                },
                              }));
                              
                              // Auto-save with read-only feedback
                              void handleAutoSaveAnswer(option.value);
                            }}
                            className={`rounded-lg border px-3 py-3 text-left relative ${
                              activeAnswer?.answer === option.value
                                ? 'border-[#95c9a0] bg-[#eff8f0] text-[#2f5c38]'
                                : 'border-[#345793] bg-[#0d1d3a] text-[#3f5677] hover:bg-[#f6f9ff]'
                            }`}
                            disabled={autoSaving[activeQuestion.id] || false}
                          >
                            <p className="font-semibold">{option.label}</p>
                            <p className="text-xs opacity-80">{option.description || 'Select this answer'}</p>
                            {autoSaving[activeQuestion.id] && (
                              <div className="absolute top-1 right-1">
                                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Note Section */}
                      {isNoteEnabledForActiveQuestion && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-semibold text-[#1f2d45]">Add a note <span className="font-normal text-[#7b88a3]">(optional)</span></p>
                          <textarea
                            value={activeAnswer?.note_text ?? ''}
                            onChange={(event) => {
                              if (isReadOnly) {
                                toast.info('Notes are read-only in auditor mode');
                                return;
                              }
                              setAnswers((prev) => ({
                                ...prev,
                                [activeQuestion.id]: {
                                  answer: prev[activeQuestion.id]?.answer || '',
                                  note_text: event.target.value,
                                },
                              }));
                            }}
                            className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-sm text-white placeholder-[#718096]"
                            rows={3}
                            placeholder="Add any additional notes or context..."
                            disabled={isReadOnly}
                          />
                        </div>
                      )}

                      {/* Evidence Section */}
                      {isNoteEnabledForActiveQuestion && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-semibold text-[#1f2d45]">Upload evidence</p>
                          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-[#4d5f7a] bg-[#fbfcff] px-3 py-2 text-sm text-[#607594] hover:bg-[#f0f9ff]">
                            <span>Choose file or drag & drop</span>
                            <input
                              type="file"
                              accept="image/*,.pdf,.doc,.doc,.docx"
                              onChange={async (event) => {
                                if (isReadOnly) {
                                  toast.info('File uploads are read-only in auditor mode');
                                  return;
                                }
                                const file = event.target.files?.[0];
                                if (!file) return;
                                setEvidenceLoading(true);
                                try {
                                  const result = await uploadAssessmentEvidence(file);
                                  setEvidencePreviewUrl(URL.createObjectURL(file));
                                  toast.success('Evidence uploaded successfully');
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : 'Failed to upload evidence');
                                } finally {
                                  setEvidenceLoading(false);
                                }
                              }}
                              className="hidden"
                              disabled={isReadOnly}
                            />
                          </label>
                          {evidenceLoading && (
                            <p className="text-xs text-[#607594]">Uploading evidence...</p>
                          )}
                          {evidencePreviewUrl && (
                            <div className="relative mt-2 w-full max-w-[280px] overflow-hidden rounded-xl border border-[#dbe4f4] bg-white">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isReadOnly) {
                                    toast.info('Evidence management is read-only in auditor mode');
                                    return;
                                  }
                                  setEvidencePreviewUrl(null);
                                }}
                                className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0b1220]/70 text-sm font-semibold text-white hover:bg-[#0b1220]"
                              >
                                ×
                              </button>
                              <img src={evidencePreviewUrl} alt="Evidence preview" className="h-20 w-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const currentIndex = allQuestions.findIndex((q) => q.id === activeQuestionId);
                          if (currentIndex > 0) {
                            const prevQuestion = allQuestions[currentIndex - 1];
                            setActiveQuestionId(prevQuestion.id);
                            setActiveQuestionCursor(currentIndex - 1);
                          }
                        }}
                        disabled={activeQuestionCursor <= 0}
                        className="rounded-lg border border-[#345793] bg-[#182843] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        ← Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const currentIndex = allQuestions.findIndex((q) => q.id === activeQuestionId);
                          if (currentIndex < allQuestions.length - 1) {
                            const nextQuestion = allQuestions[currentIndex + 1];
                            setActiveQuestionId(nextQuestion.id);
                            setActiveQuestionCursor(currentIndex + 1);
                          }
                        }}
                        disabled={activeQuestionCursor >= allQuestions.length - 1}
                        className="rounded-lg border border-[#345793] bg-[#182843] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Next →
                      </button>
                    </div>
                    
                    {/* Read-only indicator */}
                    <div className="flex items-center gap-2 text-sm text-[#fbbf24]">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span>Auditor Read-Only Mode</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Assessment Complete */}
              {isSubmittedChecklist && (
                <div className="text-center py-12">
                  <div className="rounded-lg border border-[#345793] bg-[#0d1d3a] p-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Assessment Complete</h2>
                    <p className="text-[#d8e2f2] mb-6">Thank you for completing this assessment.</p>
                    <div className="flex justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="rounded-lg border border-[#345793] bg-[#182843] px-4 py-2 text-sm text-white hover:bg-[#223657]"
                      >
                        Start New Assessment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
