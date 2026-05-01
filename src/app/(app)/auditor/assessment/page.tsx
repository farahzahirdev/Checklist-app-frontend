'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  getCurrentAssessment,
  getCurrentAssessmentDetail,
  getMediaPreviewUrl,
} from '@/lib/assessment';

export default function AuditorAssessmentPage() {
  const [assessmentDetail, setAssessmentDetail] = useState<any>(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewUrlsByMediaId, setPreviewUrlsByMediaId] = useState<Record<string, string>>({});
  const [previewErrorsByMediaId, setPreviewErrorsByMediaId] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Auditor is always read-only
  const isReadOnly = true;

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

  // Show read-only feedback when user tries to interact
  function handleReadOnlyAction(action: string) {
    toast.info(`${action} is not available in auditor read-only mode`);
  }

  useEffect(() => {
    void loadAssessmentDetail();
  }, []);

  // Memoized calculations
  const allQuestions = useMemo(() => {
    if (!assessmentDetail?.sections) return [];
    return assessmentDetail.sections.flatMap((section: any) => 
      (section.questions || []).map((q: any) => ({
        ...q,
        sectionId: section.id,
        sectionTitle: section.title,
      }))
    );
  }, [assessmentDetail]);

  const activeQuestion = useMemo(() => {
    return allQuestions.find((q: any) => q.id === activeQuestionId) || null;
  }, [allQuestions, activeQuestionId]);

  const activeAnswer = useMemo(() => {
    return activeQuestion ? answers[activeQuestion.id] : null;
  }, [activeQuestion, answers]);

  const isNoteEnabledForActiveQuestion = useMemo(() => {
    return activeQuestion?.evidence_enabled ?? false;
  }, [activeQuestion]);

  const questionsBySection = useMemo(() => {
    const bySection = new Map();
    assessmentDetail?.sections?.forEach((section: any) => {
      bySection.set(section.id, {
        title: section.title,
        questions: section.questions || [],
      });
    });
    return bySection;
  }, [assessmentDetail]);

  // Generate answer options
  const answerOptionsForActive = useMemo(() => {
    if (!activeQuestion?.answer_options) return [];
    return activeQuestion.answer_options.map((option: any, index: number) => ({
      key: String(index + 1),
      value: String(
        typeof option.score === 'number' ? option.score : Math.max(1, 4 - index),
      ),
      label: option.label || option.choice_code || `Option ${index + 1}`,
      description: option.description || '',
    }));
  }, [activeQuestion]);

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
                <span className="ml-2 rounded-full bg-orange-500 px-2 py-1 text-xs text-white">Auditor View</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/auditor"
                className="rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]"
              >
                ← Back to Dashboard
              </Link>
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
                {assessmentDetail?.sections?.map((section: any, index: number) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      if (section.questions && section.questions.length > 0) {
                        setActiveQuestionId(section.questions[0].id);
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
                      <span className="text-xs opacity-70">({(section.questions || []).length})</span>
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
                  {(assessmentDetail?.sections?.find((s: any) => s.id === selectedSectionId)?.questions || []).map((question: any, index: number) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setActiveQuestionId(question.id)}
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
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeQuestion ? (
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
                      <p className="text-sm font-semibold text-[#fbbf24]">Your answer</p>
                      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 text-sm">
                        {answerOptionsForActive.map((option: any) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => {
                              handleReadOnlyAction('Answer selection');
                            }}
                            className={`rounded-lg border px-3 py-3 text-left ${
                              activeAnswer?.answer === option.value
                                ? 'border-[#95c9a0] bg-[#eff8f0] text-[#2f5c38]'
                                : 'border-[#345793] bg-[#0d1d3a] text-[#3f5677] hover:bg-[#f6f9ff]'
                            }`}
                            disabled={isReadOnly}
                          >
                            <p className="font-semibold">{option.label}</p>
                            <p className="text-xs opacity-80">{option.description || 'Select this answer'}</p>
                          </button>
                        ))}
                      </div>

                      {/* Note Section */}
                      {isNoteEnabledForActiveQuestion && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-semibold text-[#fbbf24]">Add a note <span className="font-normal text-[#7b88a3]">(read-only)</span></p>
                          <textarea
                            value={activeAnswer?.note_text ?? ''}
                            onChange={() => handleReadOnlyAction('Note editing')}
                            className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-sm text-white placeholder-[#718096] opacity-75"
                            rows={3}
                            placeholder="Notes are read-only in auditor mode..."
                            disabled={true}
                            readOnly
                          />
                        </div>
                      )}

                      {/* Evidence Section */}
                      {isNoteEnabledForActiveQuestion && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-semibold text-[#fbbf24]">Evidence <span className="font-normal text-[#7b88a3]">(read-only)</span></p>
                          <div className="text-sm text-[#607594]">
                            Evidence uploads are disabled in auditor mode
                          </div>
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
                          const currentIndex = allQuestions.findIndex((q: any) => q.id === activeQuestionId);
                          if (currentIndex > 0) {
                            const prevQuestion = allQuestions[currentIndex - 1];
                            setActiveQuestionId(prevQuestion.id);
                          }
                        }}
                        disabled={activeQuestionId === allQuestions[0]?.id}
                        className="rounded-lg border border-[#345793] bg-[#182843] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        ← Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const currentIndex = allQuestions.findIndex((q: any) => q.id === activeQuestionId);
                          if (currentIndex < allQuestions.length - 1) {
                            const nextQuestion = allQuestions[currentIndex + 1];
                            setActiveQuestionId(nextQuestion.id);
                          }
                        }}
                        disabled={activeQuestionId === allQuestions[allQuestions.length - 1]?.id}
                        className="rounded-lg border border-[#345793] bg-[#182843] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Next →
                      </button>
                    </div>
                    
                    {/* Read-only indicator */}
                    <div className="flex items-center gap-2 text-sm text-[#fbbf24]">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      <span>Auditor Read-Only Mode</span>
                    </div>
                  </div>
                </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
