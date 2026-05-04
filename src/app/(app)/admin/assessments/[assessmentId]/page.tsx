'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createBulkAnswerReviews,
  createAnswerReview,
  createOrUpdateAssessmentReview,
  deleteAnswerReview,
  getAnswerReviewHistory,
  getAssessmentAnswersForReview,
  getAssessmentReviewStatus,
  quickApproveAssessment,
  requestAssessmentChanges,
  updateAnswerReview,
  type AssessmentAnswerForReview,
  type AssessmentAnswersReviewDetail,
  type AssessmentReviewHistoryEntry,
  type AnswerReviewPayload,
} from '@/lib/assessment-review';
import { getReportByAssessment, generateDraftReport } from '@/lib/reports';
import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs';

type ReviewDraft = {
  suggestion_type: string;
  suggestion_text: string;
  reference_materials: string;
  is_action_required: boolean;
  priority_level: number;
  score_adjustment: number;
};

const defaultDraft: ReviewDraft = {
  suggestion_type: 'improvement',
  suggestion_text: '',
  reference_materials: '',
  is_action_required: false,
  priority_level: 1,
  score_adjustment: 0,
};

/** Must match backend AnswerReviewPayload.suggestion_type enum. */
const SUGGESTION_TYPE_VALUES = ['improvement', 'required_change', 'best_practice', 'reference', 'clarification'] as const;
type SuggestionTypeValue = (typeof SUGGESTION_TYPE_VALUES)[number];

const SUGGESTION_TYPE_LABELS: Record<SuggestionTypeValue, string> = {
  improvement: 'Improvement',
  required_change: 'Required change',
  best_practice: 'Best practice',
  reference: 'Reference',
  clarification: 'Clarification',
};

function normalizeSuggestionType(raw: string | null | undefined): SuggestionTypeValue {
  const v = (raw ?? '').trim().toLowerCase().replace(/-/g, '_');
  const legacy: Record<string, SuggestionTypeValue> = {
    correction: 'required_change',
    approved: 'best_practice',
  };
  if (legacy[v]) return legacy[v];
  if ((SUGGESTION_TYPE_VALUES as readonly string[]).includes(v)) return v as SuggestionTypeValue;
  return 'improvement';
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function sectionKey(answer: AssessmentAnswerForReview) {
  return answer.section_code || answer.section_name || 'uncategorized';
}

function getAttachmentDisplay(answer: AssessmentAnswerForReview): { text: string; files: any[] } {
  const answerWithAttachment = answer as AssessmentAnswerForReview & {
    evidence_file_name?: string | null;
    evidence_file_url?: string | null;
    evidence_media_id?: string | null;
    attachment_name?: string | null;
    attachment_url?: string | null;
    media_id?: string | null;
    evidence_files?: Array<{
      id: string;
      media_id: string;
      filename: string;
      mime_type: string;
      file_size: number;
      scan_status: string;
      encryption_status: string;
      uploaded_at?: string;
    }>;
  };

  // Check for new evidence_files format
  if (answerWithAttachment.evidence_files && answerWithAttachment.evidence_files.length > 0) {
    return {
      text: `${answerWithAttachment.evidence_files.length} file(s) uploaded`,
      files: answerWithAttachment.evidence_files
    };
  }

  const directName =
    answerWithAttachment.evidence_file_name ||
    answerWithAttachment.attachment_name ||
    null;
  if (directName && directName.trim().length > 0) {
    return {
      text: directName,
      files: []
    };
  }

  const directRef =
    answerWithAttachment.evidence_file_url ||
    answerWithAttachment.attachment_url ||
    answerWithAttachment.evidence_media_id ||
    answerWithAttachment.media_id ||
    null;
  if (directRef && directRef.trim().length > 0) {
    return {
      text: 'File uploaded',
      files: []
    };
  }

  return {
    text: 'No file uploaded',
    files: []
  };
}

export default function AdminAssessmentReviewDetailPage() {
  const params = useParams<{ assessmentId: string }>();
  const assessmentId = params.assessmentId;
  const router = useRouter();

  const [detail, setDetail] = useState<AssessmentAnswersReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAnswerId, setSavingAnswerId] = useState('');
  const [finalizing, setFinalizing] = useState(false);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});
  const [suggestionErrors, setSuggestionErrors] = useState<Record<string, string>>({});
  const [reviewStatusLabel, setReviewStatusLabel] = useState('pending_review');
  const [historyByReviewId, setHistoryByReviewId] = useState<Record<string, AssessmentReviewHistoryEntry[]>>({});
  const [fullHistoryByReviewId, setFullHistoryByReviewId] = useState<Record<string, AssessmentReviewHistoryEntry[]>>({});
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const [loadingHistoryId, setLoadingHistoryId] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'marked'>('all');
  const [answerStateFilter, setAnswerStateFilter] = useState<'all' | 'not_answered'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const answerOptions = ['4 (Yes)', '3 (Mostly Yes)', '2 (Partially)', '1 (No)'];

  async function loadDetail() {
    setLoading(true);
    try {
      const [response, statusResponse] = await Promise.all([
        getAssessmentAnswersForReview(assessmentId),
        getAssessmentReviewStatus(assessmentId),
      ]);
      setDetail(response);
      if (typeof statusResponse.status === 'string') {
        setReviewStatusLabel(statusResponse.status);
      } else {
        setReviewStatusLabel(response.assessment_status || 'pending_review');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load assessment review');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  const sectionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const answer of detail?.answers || []) set.add(sectionKey(answer));
    return Array.from(set);
  }, [detail?.answers]);

  const filteredAnswers = useMemo(() => {
    let items = detail?.answers || [];
    if (sectionFilter !== 'all') items = items.filter((answer) => sectionKey(answer) === sectionFilter);
    // NOTE: Changed follow-up filter to NOT hide sections, but rather we'll highlight marked answers in the UI
    // if (followUpFilter === 'marked') items = items.filter((answer) => answer.is_action_required || Boolean(answer.review?.is_action_required));
    if (answerStateFilter === 'not_answered') items = items.filter((answer) => !answer.customer_answer || answer.customer_answer.trim().length === 0);
    return items;
  }, [answerStateFilter, detail?.answers, sectionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAnswers.length / pageSize));
  const paginatedAnswers = useMemo(() => filteredAnswers.slice((page - 1) * pageSize, page * pageSize), [filteredAnswers, page]);

  const sectionGroups = useMemo(() => {
    const grouped = new Map<string, AssessmentAnswerForReview[]>();
    for (const answer of paginatedAnswers) {
      const key = sectionKey(answer);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(answer);
    }
    return Array.from(grouped.entries());
  }, [paginatedAnswers]);

  useEffect(() => {
    setPage(1);
  }, [sectionFilter, followUpFilter, answerStateFilter]);

  function getDraft(answer: AssessmentAnswerForReview): ReviewDraft {
    if (drafts[answer.answer_id]) return drafts[answer.answer_id];
    if (!answer.review) return defaultDraft;
    return {
      suggestion_type: normalizeSuggestionType(answer.review.suggestion_type),
      suggestion_text: answer.review.suggestion_text || '',
      reference_materials: answer.review.reference_materials || '',
      is_action_required: answer.review.is_action_required,
      priority_level: answer.review.priority_level ?? 1,
      score_adjustment: answer.review.score_adjustment ?? 0,
    };
  }

  function setDraft(answerId: string, patch: Partial<ReviewDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [answerId]: { ...(prev[answerId] || defaultDraft), ...patch },
    }));
    if (patch.suggestion_text !== undefined) {
      setSuggestionErrors((prev) => {
        if (!prev[answerId]) return prev;
        const next = { ...prev };
        delete next[answerId];
        return next;
      });
    }
  }

  function selectedAnswerLabel(answerValue: string | null | undefined): string | null {
    if (!answerValue) return null;
    const normalized = answerValue.trim().toLowerCase();
    // Accept numeric codes from API (AnswerChoice values) and map to display labels
    const codeMap: Record<string, string> = { '4': '4 (Yes)', '3': '3 (Mostly Yes)', '2': '2 (Partially)', '1': '1 (No)' };
    if (codeMap[normalized]) return codeMap[normalized];
    const match = answerOptions.find((option) => option.toLowerCase() === normalized);
    return match || answerValue;
  }

  async function saveAnswerReview(answer: AssessmentAnswerForReview) {
    const draft = getDraft(answer);
    const payload: AnswerReviewPayload = {
      suggestion_type: normalizeSuggestionType(draft.suggestion_type),
      suggestion_text: draft.suggestion_text.trim(),
      reference_materials: draft.reference_materials.trim(),
      is_action_required: draft.is_action_required,
      priority_level: draft.priority_level,
      score_adjustment: draft.score_adjustment,
    };
    if (!payload.suggestion_text || payload.suggestion_text.length < 10) {
      const message = 'Suggestion text should be at least 10 characters.';
      setSuggestionErrors((prev) => ({ ...prev, [answer.answer_id]: message }));
      toast.error(message);
      return;
    }
    setSavingAnswerId(answer.answer_id);
    try {
      if (answer.review?.id) await updateAnswerReview(answer.review.id, payload);
      else await createAnswerReview(answer.answer_id, payload);
      toast.success('Answer review saved.');
      await loadDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save answer review');
    } finally {
      setSavingAnswerId('');
    }
  }

  async function removeAnswerReview(answer: AssessmentAnswerForReview) {
    if (!answer.review?.id) return;
    setSavingAnswerId(answer.answer_id);
    try {
      await deleteAnswerReview(answer.review.id);
      toast.success('Answer review deleted.');
      await loadDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete answer review');
    } finally {
      setSavingAnswerId('');
    }
  }

  async function finalizeReview() {
    if (!detail) return;
    setFinalizing(true);
    try {
      await createOrUpdateAssessmentReview(detail.assessment_id, {
        status: 'completed',
        completion_percentage: detail.completion_percentage || 100,
        summary_notes: summaryNotes.trim(),
        recommendations: recommendations.trim(),
      });
      toast.success('Assessment review finalized.');
      await loadDetail();

      // Try to open the report for this assessment. If it doesn't exist, create a draft then open it.
      try {
        const report = await getReportByAssessment(detail.assessment_id);
        router.push(`/admin/reports/${report.id}`);
        return;
      } catch (err) {
        // If not found, generate draft and redirect
        try {
          const created = await generateDraftReport(detail.assessment_id);
          router.push(`/admin/reports/${created.id}`);
          return;
        } catch (err2) {
          // fall through and show success toast already displayed
          toast.error(err2 instanceof Error ? err2.message : 'Failed to open or create report');
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to finalize review');
    } finally {
      setFinalizing(false);
    }
  }

  async function quickApprove() {
    if (!detail) return;
    setFinalizing(true);
    try {
      await quickApproveAssessment(detail.assessment_id);
      toast.success('Assessment quick-approved.');
      await loadDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to quick approve');
    } finally {
      setFinalizing(false);
    }
  }

  async function requestChanges() {
    if (!detail) return;
    setFinalizing(true);
    try {
      await requestAssessmentChanges(detail.assessment_id, {
        message: recommendations.trim() || 'Please review flagged answers and resubmit.',
      });
      toast.success('Changes requested from customer.');
      await loadDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to request changes');
    } finally {
      setFinalizing(false);
    }
  }

  async function saveBulkReviews() {
    if (!detail) return;
    const entries = Object.entries(drafts)
      .map(([answerId, draft]) => ({
        answer_id: answerId,
        suggestion_type: normalizeSuggestionType(draft.suggestion_type),
        suggestion_text: draft.suggestion_text.trim(),
        reference_materials: draft.reference_materials.trim(),
        is_action_required: draft.is_action_required,
        priority_level: draft.priority_level,
        score_adjustment: draft.score_adjustment,
      }))
      .filter((item) => item.suggestion_text.length > 0);

    if (!entries.length) {
      toast.error('No drafted reviews to save in bulk.');
      return;
    }
    setFinalizing(true);
    try {
      const result = await createBulkAnswerReviews(detail.assessment_id, {
        answer_reviews: entries,
        assessment_notes: summaryNotes.trim() || undefined,
      });
      toast.success(`Bulk saved: ${result.success_count} success, ${result.failure_count} failed.`);
      await loadDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save bulk reviews');
    } finally {
      setFinalizing(false);
    }
  }

  async function loadReviewHistory(reviewId: string) {
    setLoadingHistoryId(reviewId);
    try {
      const history = await getAnswerReviewHistory(reviewId);
      setFullHistoryByReviewId((prev) => ({ ...prev, [reviewId]: history }));
      setHistoryByReviewId((prev) => ({ ...prev, [reviewId]: history.slice(0, 2) }));
      setExpandedHistory((prev) => ({ ...prev, [reviewId]: false }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load review history');
    } finally {
      setLoadingHistoryId('');
    }
  }

  function formatActionType(actionType: string) {
    return actionType
      .split('_')
      .join(' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <AdminBreadcrumbs
          items={[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Assessments', href: '/admin/assessments' },
            {
              label:
                detail?.checklist_title ||
                detail?.customer_name ||
                detail?.customer_email ||
                (loading ? 'Loading…' : 'Review'),
            },
          ]}
        />
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1f2d45]">Assessment Awaiting Review</h1>
            <p className="mt-1 text-sm text-[#607594]">{detail?.customer_name || detail?.customer_email || '-'} — {detail?.checklist_title || '-'}</p>
            <p className="mt-1 text-xs text-[#6f82a3]">
              {String(reviewStatusLabel || detail?.assessment_status || 'pending_review').split('_').join(' ')} · {formatDateTime(detail?.submitted_at)}
            </p>
          </div>
          <button type="button" disabled={finalizing || loading} onClick={() => void finalizeReview()} className="rounded-xl border border-[#2d4f83] bg-[#2f7dff] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {finalizing ? 'Saving...' : 'Finalize Review'}
          </button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm"><p className="text-sm font-medium text-[#6a7d9a]">Total Questions</p><p className="mt-2 text-2xl font-semibold text-[#273a5a]">{detail?.total_answers ?? (loading ? '...' : 0)}</p></article>
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm"><p className="text-sm font-medium text-[#6a7d9a]">Answered</p><p className="mt-2 text-2xl font-semibold text-[#273a5a]">{detail?.total_answers ?? (loading ? '...' : 0)} ({Math.round(detail?.completion_percentage ?? 0)}%)</p></article>
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm"><p className="text-sm font-medium text-[#6a7d9a]">Client Score</p><p className="mt-2 text-2xl font-semibold text-[#273a5a]">{Math.round(detail?.average_score ?? 0)}/100</p></article>
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm"><p className="text-sm font-medium text-[#6a7d9a]">Marked for Follow-up</p><p className="mt-2 text-2xl font-semibold text-[#273a5a]">{detail?.action_required_answers ?? (loading ? '...' : 0)}</p></article>
      </div>

      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-[#4e6489]">Filter:</p>
          <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">
            <option value="all">All Questions</option>
            {sectionOptions.map((section) => <option key={section} value={section}>{section}</option>)}
          </select>
          <button type="button" onClick={() => setFollowUpFilter((prev) => (prev === 'all' ? 'marked' : 'all'))} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${followUpFilter === 'marked' ? 'border-[#f2d49f] bg-[#fff3de] text-[#b6862f]' : 'border-[#d4dced] bg-white text-[#425f8f]'}`}>
            {followUpFilter === 'marked' ? 'Highlighting Follow-ups' : 'Highlight Follow-ups'}
          </button>
          <select value={answerStateFilter} onChange={(event) => setAnswerStateFilter(event.target.value as 'all' | 'not_answered')} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">
            <option value="all">All Answer States</option>
            <option value="not_answered">Not Answered</option>
          </select>
        </div>
      </article>

      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#243555]">Overall Review Notes</h2>
        <textarea value={summaryNotes} onChange={(event) => setSummaryNotes(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" placeholder="Summary notes for the assessment..." />
        <textarea value={recommendations} onChange={(event) => setRecommendations(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" placeholder="Recommendations for customer..." />
        <div className="mt-2 flex gap-2">
          <button type="button" disabled={finalizing || loading} onClick={() => void requestChanges()} className="rounded-xl border border-[#d4dced] bg-white px-4 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-60">Request Changes</button>
          <button type="button" disabled={finalizing || loading} onClick={() => void quickApprove()} className="rounded-xl border border-[#d4dced] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-60">Quick Approve</button>
          <button type="button" disabled={finalizing || loading} onClick={() => void saveBulkReviews()} className="rounded-xl border border-[#d4dced] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-60">Save Drafted in Bulk</button>
        </div>
      </article>

      {loading ? <p className="rounded-xl border border-[#e2e8f5] bg-white px-4 py-3 text-sm text-[#607594]">Loading answers...</p> : null}

      {!loading && sectionGroups.map(([key, answers], sectionIndex) => (
        <section key={key} className="space-y-2 rounded-2xl border border-[#dbe4f4] bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#243555]">{sectionIndex + 1}. {answers[0]?.section_name || answers[0]?.section_code || 'General'}</h2>
          {answers.map((answer) => {
            const draft = getDraft(answer);
            const isSaving = savingAnswerId === answer.answer_id;
            const answerEmpty = !answer.customer_answer || answer.customer_answer.trim().length === 0;
            const selectedOption = selectedAnswerLabel(answer.customer_answer);
            const badgeClass = answerEmpty
              ? 'bg-[#fff4df] text-[#b6862f]'
              : answer.is_action_required || answer.review?.is_action_required
                ? 'bg-[#fff3de] text-[#b6862f]'
                : 'bg-[#e9f8ef] text-[#2f9960]';
            const badgeText = answerEmpty
              ? 'Not Answered'
              : answer.is_action_required || answer.review?.is_action_required
                ? 'Marked for Follow-up'
                : 'Answered';
            const isMarkedForFollowUp = answer.is_action_required || Boolean(answer.review?.is_action_required);
            const shouldHighlight = followUpFilter === 'marked' && isMarkedForFollowUp;
            const shouldDim = followUpFilter === 'marked' && !isMarkedForFollowUp;
            return (
              <article key={answer.answer_id} className={`rounded-xl border p-4 transition-all ${
                shouldHighlight 
                  ? 'border-[#f2d49f] bg-[#fff3de] shadow-md scale-[1.02]' 
                  : shouldDim
                  ? 'border-[#e2e8f5] bg-[#fbfcff] opacity-50'
                  : 'border-[#e2e8f5] bg-[#fbfcff]'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[#25375a]">Question ID: {answer.question_id}</p>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${badgeClass}`}>{badgeText}</span>
                </div>
                {answer.question_text && (
                  <p className="mt-2 text-sm text-[#607594]">{answer.question_text}</p>
                )}
                <div className="mt-3">
                  <div className="grid gap-3 border-b border-[#edf2f9] pb-2 text-sm font-semibold text-[#2b3e60] md:grid-cols-3">
                    <p>Client Answer</p>
                    <p>Client Note</p>
                    <p>Attachment</p>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div className="space-y-2 rounded-lg border border-[#dfe7f6] bg-white p-3">
                      {answerOptions.map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm text-[#2f4264]">
                          <input type="radio" checked={selectedOption === option} readOnly className="accent-[#2f7dff]" />
                          {option}
                        </label>
                      ))}
                      <p className="pt-1 text-xs text-[#97a5bb]">Answer cannot be modified</p>
                    </div>
                    <div className="rounded-lg border border-[#dfe7f6] bg-white p-3 text-sm text-[#2f4264]">
                      {answer.note_text || 'No note added'}
                    </div>
                    <div className="rounded-lg border border-[#dfe7f6] bg-white p-3">
                      {(() => {
                        const attachmentInfo = getAttachmentDisplay(answer);
                        if (attachmentInfo.files.length === 0) {
                          return <p className="text-sm text-[#2f4264]">{attachmentInfo.text}</p>;
                        }
                        
                        return (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-[#1f2d45]">{attachmentInfo.text}</p>
                            {attachmentInfo.files.map((file) => (
                              <div key={file.id} className="flex items-center justify-between rounded-lg border border-[#dbe4f4] bg-[#f8fafc] p-2">
                                <div className="flex-1 min-w-0">
                                  <p className="truncate text-sm font-medium text-[#1f2d45]">{file.filename}</p>
                                  <p className="text-xs text-[#607594]">
                                    {(file.file_size / 1024 / 1024).toFixed(2)} MB • {file.mime_type}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-semibold ${
                                      file.scan_status === 'clean' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`} title={`Scan status: ${file.scan_status}`}>
                                      {file.scan_status === 'clean' ? '✓' : '⚠'}
                                    </span>
                                    <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-semibold ${
                                      file.encryption_status === 'encrypted' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`} title={`Encryption: ${file.encryption_status}`}>
                                      {file.encryption_status === 'encrypted' ? '🔒' : '🔓'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  {file.mime_type.startsWith('image/') && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Get preview URL and open in new window
                                        fetch(`/api/api/v1/media/${file.media_id}/preview`)
                                          .then(response => response.json())
                                          .then(data => {
                                            window.open(data.preview_url, '_blank');
                                          })
                                          .catch(error => {
                                            console.error('Error getting preview URL:', error);
                                            // Fallback to direct preview
                                            window.open(`/api/api/v1/media/${file.media_id}/preview`, '_blank');
                                          });
                                      }}
                                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#d4dced] bg-white text-[#3f5677] hover:bg-[#f1f5f9]"
                                      title="Preview"
                                    >
                                      👁
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Get preview URL for download (it returns the actual file)
                                      fetch(`/api/api/v1/media/${file.media_id}/preview`)
                                        .then(response => response.json())
                                        .then(data => {
                                          // Create download link
                                          const link = document.createElement('a');
                                          link.href = data.preview_url;
                                          link.download = file.filename;
                                          link.target = '_blank';
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        })
                                        .catch(error => {
                                          console.error('Error getting download URL:', error);
                                        });
                                    }}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#d4dced] bg-white text-[#3f5677] hover:bg-[#f1f5f9]"
                                    title="Download"
                                  >
                                    ⬇
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg border border-[#e3e9f6] bg-[#f8fbff] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">Reviewer Actions</p>
                    <div className="mt-2 grid gap-2 md:grid-cols-3">
                      <select
                        value={normalizeSuggestionType(draft.suggestion_type)}
                        onChange={(event) => setDraft(answer.answer_id, { suggestion_type: event.target.value })}
                        className="rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm"
                      >
                        {SUGGESTION_TYPE_VALUES.map((value) => (
                          <option key={value} value={value}>
                            {SUGGESTION_TYPE_LABELS[value]}
                          </option>
                        ))}
                      </select>
                      <input value={draft.reference_materials} onChange={(event) => setDraft(answer.answer_id, { reference_materials: event.target.value })} className="rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm" placeholder="Reference materials" />
                      <label className="inline-flex items-center gap-2 rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#425f8f]"><input type="checkbox" checked={draft.is_action_required} onChange={(event) => setDraft(answer.answer_id, { is_action_required: event.target.checked })} />Action required</label>
                    </div>
                    <textarea
                      value={draft.suggestion_text}
                      onChange={(event) => setDraft(answer.answer_id, { suggestion_text: event.target.value })}
                      rows={2}
                      className={`mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm ${
                        suggestionErrors[answer.answer_id] ? 'border-[#c43e53] ring-1 ring-[#c43e53]' : 'border-[#d4dced]'
                      }`}
                      placeholder="Suggestion text"
                    />
                    {suggestionErrors[answer.answer_id] ? (
                      <p className="text-xs font-medium text-[#c43e53]">{suggestionErrors[answer.answer_id]}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" disabled={isSaving} onClick={() => void saveAnswerReview(answer)} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? 'Saving...' : answer.review?.id ? 'Update Review' : 'Save Review'}</button>
                      {answer.review?.id ? <button type="button" disabled={isSaving} onClick={() => void removeAnswerReview(answer)} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-60">Delete Review</button> : null}
                      {answer.review?.id ? <button type="button" disabled={loadingHistoryId === answer.review.id} onClick={() => void loadReviewHistory(answer.review!.id)} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-60">{loadingHistoryId === answer.review.id ? 'Loading...' : 'View History'}</button> : null}
                    </div>
                    {answer.review?.id && historyByReviewId[answer.review.id] ? (
                      <div className="mt-2 space-y-2 rounded-lg border border-[#d4ced] bg-white p-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#2a3d5f]">Review History</p>
                          <button 
                            type="button"
                            onClick={() => setHistoryByReviewId(prev => ({ ...prev, [answer.review!.id]: [] }))}
                            className="text-xs text-[#607594] hover:text-[#2f4264]"
                          >
                            ✕
                          </button>
                        </div>
                        {historyByReviewId[answer.review.id].length ? (
                          <>
                            {historyByReviewId[answer.review.id].slice(0, 2).map((entry) => (
                              <div key={entry.id} className="rounded-md border border-[#e6ebf5] bg-[#f8fbff] px-2 py-1.5 text-xs text-[#425f8f]">
                                <p className="font-semibold text-[#2a3d5f]">{formatActionType(entry.action_type)}</p>
                                <p>{entry.description || 'No description available.'}</p>
                                <p className="text-[#97a5bb]">By {entry.reviewer_name || entry.reviewer_email || 'Unknown'} • {new Date(entry.created_at).toLocaleString()}</p>
                              </div>
                            ))}
                            {historyByReviewId[answer.review.id].length > 2 && (
                              <button 
                                type="button" 
                                onClick={() => {
                                  // Toggle showing all history
                                  const reviewId = answer.review?.id;
                                  if (!reviewId) return;
                                  const isExpanded = expandedHistory[reviewId] || false;
                                  setExpandedHistory(prev => ({ ...prev, [reviewId]: !isExpanded }));
                                  if (!isExpanded) {
                                    // Show full history
                                    setHistoryByReviewId(prev => ({
                                      ...prev,
                                      [reviewId]: fullHistoryByReviewId[reviewId] || []
                                    }));
                                  } else {
                                    // Show limited history
                                    setHistoryByReviewId(prev => ({
                                      ...prev,
                                      [reviewId]: (fullHistoryByReviewId[reviewId] || []).slice(0, 2)
                                    }));
                                  }
                                }}
                                className="text-xs text-[#2f7dff] hover:text-[#2265d8] font-medium"
                              >
                                {expandedHistory[answer.review?.id || ''] ? 'Show Less' : 'Show All'} ({(fullHistoryByReviewId[answer.review?.id || ''] || []).length} total)
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-[#607594]">No history entries found.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ))}

      {!loading ? (
        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-[#607594]">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredAnswers.length)} of {filteredAnswers.length} questions</p>
          <div className="flex items-center gap-1">
            <button type="button" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-lg border border-[#d4dced] px-2.5 py-1.5 text-sm text-[#425f8f] disabled:opacity-50">‹</button>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
              const pageNumber = idx + 1;
              return <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} className={`h-8 w-8 rounded-lg text-sm font-semibold ${page === pageNumber ? 'bg-[#2f7dff] text-white' : 'border border-[#d4dced] text-[#425f8f]'}`}>{pageNumber}</button>;
            })}
            <button type="button" disabled={page === totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="rounded-lg border border-[#d4dced] px-2.5 py-1.5 text-sm text-[#425f8f] disabled:opacity-50">›</button>
          </div>
        </footer>
      ) : null}
    </section>
  );
}
