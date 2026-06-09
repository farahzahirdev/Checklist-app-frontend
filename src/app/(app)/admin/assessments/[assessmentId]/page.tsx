'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { translate, useLocale } from '@/lib/i18n';
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
import { adminReportDetailPath, generateDraftReport, getReportByAssessment } from '@/lib/reports';
import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs';
import {
  ADMIN_KPI_DARK_CARD_CLASS,
  ADMIN_KPI_DARK_LABEL_CLASS,
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_SUBTITLE_CLASS,
  ADMIN_PAGE_HERO_TITLE_TEXT_CLASS,
} from '@/app/(app)/admin/admin-page-title';
import { adminAssessmentReviewDetailMessages } from '@/locales/admin-assessment-review-detail';
import { useAdminAccess } from '@/lib/admin-access';

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

function KpiLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <p className={`${ADMIN_KPI_DARK_LABEL_CLASS} flex items-center gap-1.5`}>
      <span>{label}</span>
      <span
        className="inline-flex shrink-0 cursor-help text-white/90"
        title={tooltip}
        aria-label={tooltip}
        tabIndex={0}
      >
        <svg
          viewBox="0 0 416.979 416.979"
          className="size-3.5"
          fill="currentColor"
          aria-hidden
        >
          <path d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85 c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786 c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576 c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765 c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z" />
        </svg>
      </span>
    </p>
  );
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
  const { isReadOnly } = useAdminAccess();
  const params = useParams<{ assessmentId: string }>();
  const assessmentId = params.assessmentId;
  const router = useRouter();
  const { locale } = useLocale();
  const t = (key: string) => translate(adminAssessmentReviewDetailMessages, locale, key);
  const statusLabel = (status: string | null | undefined) => {
    if (!status) return t('status.unknown');
    const key = `status.${status}`;
    const exact = translate(adminAssessmentReviewDetailMessages, locale, key);
    if (exact !== key) return exact;
    return String(status).split('_').join(' ');
  };

  const [detail, setDetail] = useState<AssessmentAnswersReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAnswerId, setSavingAnswerId] = useState('');
  const [finalizing, setFinalizing] = useState(false);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});
  const [suggestionErrors, setSuggestionErrors] = useState<Record<string, string>>({});
  const [reviewStatusLabel, setReviewStatusLabel] = useState('pending');
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
  const [collapsedParents, setCollapsedParents] = useState<Set<string>>(new Set());

  function toggleParentCollapse(parentUuid: string) {
    setCollapsedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentUuid)) next.delete(parentUuid);
      else next.add(parentUuid);
      return next;
    });
  }

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
        setReviewStatusLabel(response.assessment_status || 'pending');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  // Order answers so that any sub-questions immediately follow their parent question, and
  // adopt the parent's section so they stay grouped under the same section header.
  const orderedAnswers = useMemo(() => {
    const all = detail?.answers || [];
    if (!all.length) return [] as AssessmentAnswerForReview[];

    const uuidSet = new Set<string>();
    for (const a of all) {
      if (a.question_uuid) uuidSet.add(a.question_uuid);
    }

    const childrenByParent = new Map<string, AssessmentAnswerForReview[]>();
    const topLevel: AssessmentAnswerForReview[] = [];
    for (const a of all) {
      if (a.parent_question_id && uuidSet.has(a.parent_question_id)) {
        const list = childrenByParent.get(a.parent_question_id) || [];
        list.push(a);
        childrenByParent.set(a.parent_question_id, list);
      } else {
        topLevel.push(a);
      }
    }

    const ordered: AssessmentAnswerForReview[] = [];
    for (const parent of topLevel) {
      ordered.push(parent);
      if (!parent.question_uuid) continue;
      const children = childrenByParent.get(parent.question_uuid) || [];
      for (const child of children) {
        ordered.push({
          ...child,
          section_code: parent.section_code,
          section_name: parent.section_name,
        });
      }
    }
    return ordered;
  }, [detail?.answers]);

  const sectionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const answer of orderedAnswers) set.add(sectionKey(answer));
    return Array.from(set);
  }, [orderedAnswers]);

  const filteredAnswers = useMemo(() => {
    let items = orderedAnswers;
    if (sectionFilter !== 'all') items = items.filter((answer) => sectionKey(answer) === sectionFilter);
    // NOTE: Changed follow-up filter to NOT hide sections, but rather we'll highlight marked answers in the UI
    // if (followUpFilter === 'marked') items = items.filter((answer) => answer.is_action_required || Boolean(answer.review?.is_action_required));
    if (answerStateFilter === 'not_answered') items = items.filter((answer) => !answer.customer_answer || answer.customer_answer.trim().length === 0);
    return items;
  }, [answerStateFilter, orderedAnswers, sectionFilter]);

  const childCountByParent = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of orderedAnswers) {
      if (a.parent_question_id) {
        map.set(a.parent_question_id, (map.get(a.parent_question_id) || 0) + 1);
      }
    }
    return map;
  }, [orderedAnswers]);

  // Apply parent-collapse state on top of filters so collapsed children disappear from the list (and from pagination counts).
  const visibleAnswers = useMemo(() => {
    if (!collapsedParents.size) return filteredAnswers;
    return filteredAnswers.filter((answer) => !answer.parent_question_id || !collapsedParents.has(answer.parent_question_id));
  }, [filteredAnswers, collapsedParents]);

  const totalPages = Math.max(1, Math.ceil(visibleAnswers.length / pageSize));
  const paginatedAnswers = useMemo(() => visibleAnswers.slice((page - 1) * pageSize, page * pageSize), [visibleAnswers, page]);

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

  // Clamp current page when collapsing children shrinks the total page count.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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
      const message = t('validation.suggestionMin');
      setSuggestionErrors((prev) => ({ ...prev, [answer.answer_id]: message }));
      toast.error(message);
      return;
    }
    setSavingAnswerId(answer.answer_id);
    try {
      if (answer.review?.id) await updateAnswerReview(answer.review.id, payload);
      else await createAnswerReview(answer.answer_id, payload);
      toast.success(t('toasts.answerSaved'));
      await loadDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.answerSaveFailed'));
    } finally {
      setSavingAnswerId('');
    }
  }

  async function removeAnswerReview(answer: AssessmentAnswerForReview) {
    if (!answer.review?.id) return;
    setSavingAnswerId(answer.answer_id);
    try {
      await deleteAnswerReview(answer.review.id);
      toast.success(t('toasts.answerDeleted'));
      await loadDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.answerDeleteFailed'));
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
      toast.success(t('toasts.finalized'));
      await loadDetail();

      // Try to open the report for this assessment. If it doesn't exist, create a draft then open it.
      try {
        const report = await getReportByAssessment(detail.assessment_id);
        router.push(adminReportDetailPath(report) as any);
        return;
      } catch (err) {
        // If not found, generate draft and redirect
        try {
          const created = await generateDraftReport(detail.assessment_id);
          router.push(adminReportDetailPath(created) as any);
          return;
        } catch (err2) {
          // fall through and show success toast already displayed
          toast.error(err2 instanceof Error ? err2.message : 'Failed to open or create report');
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.finalizeFailed'));
    } finally {
      setFinalizing(false);
    }
  }

  async function quickApprove() {
    if (!detail) return;
    setFinalizing(true);
    try {
      await quickApproveAssessment(detail.assessment_id);
      toast.success(t('toasts.quickApproved'));
      await loadDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.quickApproveFailed'));
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
      toast.success(t('toasts.changesRequested'));
      await loadDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.changesRequestFailed'));
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
      toast.error(t('toasts.bulkNone'));
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
      toast.error(err instanceof Error ? err.message : t('toasts.bulkFailed'));
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
      toast.error(err instanceof Error ? err.message : t('toasts.historyFailed'));
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
      <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
        <AdminBreadcrumbs
          variant="onDark"
          items={[
            { label: t('crumbs.dashboard'), href: '/admin' },
            { label: t('crumbs.assessments'), href: '/admin/assessments' },
            {
              label:
                detail?.checklist_title ||
                detail?.customer_name ||
                detail?.customer_email ||
                (loading ? t('history.loading') : t('crumbs.review')),
            },
          ]}
        />
        <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>{t('hero.eyebrow')}</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className={ADMIN_PAGE_HERO_TITLE_TEXT_CLASS}>{t('hero.title')}</h1>
            <p className={ADMIN_PAGE_HERO_SUBTITLE_CLASS}>
              {detail?.customer_name || detail?.customer_email || '-'} — {detail?.checklist_title || '-'}
            </p>
            <p className="mt-1 text-xs font-medium text-[#9db8e6]">
              {statusLabel(reviewStatusLabel || detail?.assessment_status || 'pending')} ·{' '}
              {formatDateTime(detail?.submitted_at)}
            </p>
          </div>
          {!isReadOnly ? (
            <button
              type="button"
              disabled={finalizing || loading}
              onClick={() => void finalizeReview()}
              className="shrink-0 rounded-xl border border-[#5ea2ff] bg-[#2f7dff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#256ceb] disabled:opacity-60"
            >
              {finalizing ? t('actions.saving') : t('actions.finalize')}
            </button>
          ) : null}
        </div>
      </header>

      {detail?.company && (
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#243555]">Customer & Organization Details</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Customer</p>
              <div className="mt-1 space-y-1">
                <p className="text-[12px] text-slate-700">
                  <span className="font-medium">Name:</span> {detail.customer_name || '-'}
                </p>
                <p className="text-[12px] text-slate-700">
                  <span className="font-medium">Email:</span> {detail.customer_email || '-'}
                </p>
                {detail.customer_username && (
                  <p className="text-[12px] text-slate-700">
                    <span className="font-medium">Username:</span> {detail.customer_username}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Organization</p>
              <div className="mt-1 space-y-1">
                <p className="text-[12px] text-slate-700">
                  <span className="font-medium">Company:</span> {detail.company.name}
                </p>
                {detail.company.email && (
                  <p className="text-[12px] text-slate-700">
                    <span className="font-medium">Email:</span> {detail.company.email}
                  </p>
                )}
                {detail.company.industry && (
                  <p className="text-[12px] text-slate-700">
                    <span className="font-medium">Industry:</span> {detail.company.industry}
                  </p>
                )}
                {detail.company.country && (
                  <p className="text-[12px] text-slate-700">
                    <span className="font-medium">Country:</span> {detail.company.country}
                  </p>
                )}
              </div>
            </div>
          </div>
          {detail.company.billing_contact_name && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-[10px] font-bold uppercase text-slate-500">Billing Contact</p>
              <div className="mt-1 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[12px] text-slate-700">
                    <span className="font-medium">Contact:</span> {detail.company.billing_contact_name}
                  </p>
                  {detail.company.billing_email && (
                    <p className="text-[12px] text-slate-700">
                      <span className="font-medium">Email:</span> {detail.company.billing_email}
                    </p>
                  )}
                  {detail.company.billing_phone && (
                    <p className="text-[12px] text-slate-700">
                      <span className="font-medium">Phone:</span> {detail.company.billing_phone}
                    </p>
                  )}
                </div>
                {detail.company.billing_tax_id && (
                  <div className="space-y-1">
                    <p className="text-[12px] text-slate-700">
                      <span className="font-medium">Tax/VAT ID:</span> {detail.company.billing_tax_id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </article>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className={ADMIN_KPI_DARK_CARD_CLASS}>
          <KpiLabel label={t('kpi.total')} tooltip={t('kpi.total.tooltip')} />
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{detail?.total_answers ?? (loading ? '...' : 0)}</p>
        </article>
        <article className={ADMIN_KPI_DARK_CARD_CLASS}>
          <KpiLabel label={t('kpi.answered')} tooltip={t('kpi.answered.tooltip')} />
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#7cf0aa]">
            {detail?.total_answers ?? (loading ? '...' : 0)} ({Math.round(detail?.completion_percentage ?? 0)}%)
          </p>
        </article>
        <article className={ADMIN_KPI_DARK_CARD_CLASS}>
          <KpiLabel label={t('kpi.avgScore')} tooltip={t('kpi.avgScore.tooltip')} />
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#ffd89c]">
            {loading
              ? '...'
              : detail?.average_score != null
                ? `${Number(detail.average_score).toFixed(1)}/4`
                : '—'}
          </p>
        </article>
        <article className={ADMIN_KPI_DARK_CARD_CLASS}>
          <KpiLabel label={t('kpi.followUp')} tooltip={t('kpi.followUp.tooltip')} />
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#ffb3c9]">
            {detail?.action_required_answers ?? (loading ? '...' : 0)}
          </p>
        </article>
      </div>

      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-[#4e6489]">{t('filters.label')}</p>
          <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">
            <option value="all">{t('filters.allQuestions')}</option>
            {sectionOptions.map((section) => <option key={section} value={section}>{section}</option>)}
          </select>
          <button type="button" onClick={() => setFollowUpFilter((prev) => (prev === 'all' ? 'marked' : 'all'))} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${followUpFilter === 'marked' ? 'border-[#f2d49f] bg-[#fff3de] text-[#b6862f]' : 'border-[#d4dced] bg-white text-[#425f8f]'}`}>
            {followUpFilter === 'marked' ? t('filters.highlightingFollowUps') : t('filters.highlightFollowUps')}
          </button>
          <select value={answerStateFilter} onChange={(event) => setAnswerStateFilter(event.target.value as 'all' | 'not_answered')} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">
            <option value="all">{t('filters.answerStates.all')}</option>
            <option value="not_answered">{t('filters.answerStates.notAnswered')}</option>
          </select>
        </div>
      </article>

      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#243555]">{t('notes.title')}</h2>
        {isReadOnly ? (
          <p className="mt-2 rounded-lg border border-[#dbe4f4] bg-[#f7f9fe] px-3 py-2 text-xs text-[#5f7395]">{t('readOnly.banner')}</p>
        ) : null}
        <fieldset disabled={isReadOnly} className="mt-2 space-y-2">
        <textarea value={summaryNotes} onChange={(event) => setSummaryNotes(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" placeholder={t('notes.summaryPlaceholder')} />
        <textarea value={recommendations} onChange={(event) => setRecommendations(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" placeholder={t('notes.recommendationsPlaceholder')} />
        {!isReadOnly ? (
          <div className="flex gap-2">
            <button type="button" disabled={finalizing || loading} onClick={() => void requestChanges()} className="rounded-xl border border-[#d4dced] bg-white px-4 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-60">{t('actions.requestChanges')}</button>
            <button type="button" disabled={finalizing || loading} onClick={() => void quickApprove()} className="rounded-xl border border-[#d4dced] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-60">{t('actions.quickApprove')}</button>
            <button type="button" disabled={finalizing || loading} onClick={() => void saveBulkReviews()} className="rounded-xl border border-[#d4dced] bg-[#f8faff] px-4 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-60">{t('actions.saveBulk')}</button>
          </div>
        ) : null}
        </fieldset>
      </article>

      {loading ? <p className="rounded-xl border border-[#e2e8f5] bg-white px-4 py-3 text-sm text-[#607594]">{t('loading.answers')}</p> : null}

      {!loading && sectionGroups.map(([key, answers], sectionIndex) => (
        <section key={key} className="space-y-2 rounded-2xl border border-[#dbe4f4] bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#243555]">{sectionIndex + 1}. {answers[0]?.section_name || answers[0]?.section_code || t('section.general')}</h2>
          {answers.map((answer) => {
            const draft = getDraft(answer);
            const isSaving = savingAnswerId === answer.answer_id;
            const answerEmpty = !answer.customer_answer || answer.customer_answer.trim().length === 0;
            const selectedOption = selectedAnswerLabel(answer.customer_answer);
            const isSubQuestion = Boolean(answer.parent_question_id);
            const badgeClass = answerEmpty
              ? 'bg-[#fff4df] text-[#b6862f]'
              : answer.is_action_required || answer.review?.is_action_required
                ? 'bg-[#fff3de] text-[#b6862f]'
                : 'bg-[#e9f8ef] text-[#2f9960]';
            const badgeText = answerEmpty
              ? t('badges.notAnswered')
              : answer.is_action_required || answer.review?.is_action_required
                ? t('badges.followUp')
                : t('badges.answered');
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
                {isSubQuestion ? (
                  <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#2f7dff]">
                    {t('labels.subQuestion')}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[#25375a]">{t('labels.questionId')}: {answer.question_id}</p>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${badgeClass}`}>{badgeText}</span>
                </div>
                {answer.question_text && (
                  <p className="mt-2 text-sm text-[#607594]">{answer.question_text}</p>
                )}
                <div className="mt-3">
                  <div className="grid gap-3 border-b border-[#edf2f9] pb-2 text-sm font-semibold text-[#2b3e60] md:grid-cols-3">
                    <p>{t('labels.clientAnswer')}</p>
                    <p>{t('labels.note')}</p>
                    <p>{t('labels.evidence')}</p>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div className="space-y-2 rounded-lg border border-[#dfe7f6] bg-white p-3">
                      {answerOptions.map((option) => {
                        const isSelected = selectedOption === option;
                        return (
                          <label
                            key={option}
                            className={`flex items-center gap-2 text-sm ${
                              isSelected ? 'text-[#2f4264]' : 'text-[#9ba8bf]'
                            }`}
                          >
                            <input
                              type="radio"
                              checked={isSelected}
                              disabled={!isSelected}
                              readOnly
                              className={`accent-[#2f7dff] ${
                                isSelected ? '' : 'opacity-60 cursor-not-allowed'
                              }`}
                            />
                            {option}
                          </label>
                        );
                      })}
                      <p className="pt-1 text-xs text-[#97a5bb]">{t('labels.answerLocked')}</p>
                    </div>
                    <div className="rounded-lg border border-[#dfe7f6] bg-white p-3 text-sm text-[#2f4264]">
                      {answer.note_text || t('labels.noNote')}
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
                                        // Use evidence-specific endpoint for viewing (handles decryption)
                                        window.open(`/api/v1/assessment/${assessmentId}/evidence/${file.id}/view`, '_blank');
                                      }}
                                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#d4dced] bg-white text-[#3f5677] hover:bg-[#f1f5f9]"
                                    title={t('actions.preview')}
                                    >
                                      👁
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Use evidence-specific endpoint for download (handles decryption)
                                      const link = document.createElement('a');
                                      link.href = `/api/v1/assessment/${assessmentId}/evidence/${file.id}/download`;
                                      link.download = file.filename;
                                      link.target = '_blank';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#d4dced] bg-white text-[#3f5677] hover:bg-[#f1f5f9]"
                                    title={t('actions.download')}
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
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">{t('reviewerActions.title')}</p>
                    <fieldset disabled={isReadOnly} className="mt-2">
                    <div className="grid gap-2 md:grid-cols-3">
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
                      <input value={draft.reference_materials} onChange={(event) => setDraft(answer.answer_id, { reference_materials: event.target.value })} className="rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm" placeholder={t('reviewerActions.referenceMaterials')} />
                      <label className="inline-flex items-center gap-2 rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#425f8f]">
                        <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                          <input
                            type="checkbox"
                            checked={draft.is_action_required}
                            onChange={(event) => setDraft(answer.answer_id, { is_action_required: event.target.checked })}
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-[#d4dced] bg-white transition-colors checked:border-[#2f7dff] hover:border-[#2f7dff] focus:outline-none focus:ring-2 focus:ring-[#2f7dff]/30 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                          <svg
                            aria-hidden
                            viewBox="0 0 16 16"
                            className="pointer-events-none absolute hidden h-3 w-3 text-[#2f7dff] peer-checked:block"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 8.5 6.5 12 13 4.5" />
                          </svg>
                        </span>
                        {t('reviewerActions.actionRequired')}
                      </label>
                    </div>
                    <textarea
                      value={draft.suggestion_text}
                      onChange={(event) => setDraft(answer.answer_id, { suggestion_text: event.target.value })}
                      rows={2}
                      className={`mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm ${
                        suggestionErrors[answer.answer_id] ? 'border-[#c43e53] ring-1 ring-[#c43e53]' : 'border-[#d4dced]'
                      }`}
                      placeholder={t('reviewerActions.suggestionPlaceholder')}
                    />
                    {suggestionErrors[answer.answer_id] ? (
                      <p className="text-xs font-medium text-[#c43e53]">{suggestionErrors[answer.answer_id]}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {!isReadOnly ? (
                        <>
                          <button type="button" disabled={isSaving} onClick={() => void saveAnswerReview(answer)} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? t('actions.saving') : answer.review?.id ? t('actions.updateReview') : t('actions.saveReview')}</button>
                          {answer.review?.id ? <button type="button" disabled={isSaving} onClick={() => void removeAnswerReview(answer)} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-60">{t('actions.deleteReview')}</button> : null}
                        </>
                      ) : null}
                      {answer.review?.id ? <button type="button" disabled={loadingHistoryId === answer.review.id} onClick={() => void loadReviewHistory(answer.review!.id)} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-60">{loadingHistoryId === answer.review.id ? t('history.loading') : t('actions.viewHistory')}</button> : null}
                    </div>
                    </fieldset>
                    {answer.review?.id && historyByReviewId[answer.review.id] ? (
                      <div className="mt-2 space-y-2 rounded-lg border border-[#d4ced] bg-white p-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#2a3d5f]">{t('history.title')}</p>
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
                          <p className="text-xs text-[#607594]">{t('history.none')}</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
                {!isSubQuestion && answer.question_uuid && (childCountByParent.get(answer.question_uuid) || 0) > 0 ? (
                  (() => {
                    const parentUuid = answer.question_uuid;
                    const childCount = childCountByParent.get(parentUuid) || 0;
                    const isCollapsed = collapsedParents.has(parentUuid);
                    const label = (isCollapsed ? t('subQuestions.show') : t('subQuestions.hide'))
                      .replace('{count}', String(childCount));
                    return (
                      <div className="mt-3 flex justify-end border-t border-[#e9eef9] pt-3">
                        <button
                          type="button"
                          onClick={() => toggleParentCollapse(parentUuid)}
                          aria-expanded={!isCollapsed}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4dced] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f7dff] hover:bg-[#f1f5fb]"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            className={`h-3 w-3 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            aria-hidden
                          >
                            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {label}
                        </button>
                      </div>
                    );
                  })()
                ) : null}
              </article>
            );
          })}
        </section>
      ))}

      {!loading ? (
        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-[#607594]">
            {t('footer.showing')
              .replace('{from}', String(visibleAnswers.length ? (page - 1) * pageSize + 1 : 0))
              .replace('{to}', String(Math.min(page * pageSize, visibleAnswers.length)))
              .replace('{total}', String(visibleAnswers.length))}
          </p>
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
