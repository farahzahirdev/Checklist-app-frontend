'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  adminReportDetailPath,
  formatReportCode,
  getReport,
  getReportFindings,
  getReportSummaries,
  isReportUuid,
  resolveReportUuidFromRoute,
  startReportReview,
  approveReport,
  publishReport,
  requestReportChanges,
  type ReportResponse,
  type ReportFindingItem,
  type ReportSummaryItem,
} from '@/lib/reports';
import { formatReportDateTime } from '@/lib/format-report';
import { translate, useLocale } from '@/lib/i18n';
import { adminReportDetailMessages } from '@/locales/admin-report-detail';
import { AdminReportAssessmentHero } from '@/components/report/AdminReportAssessmentHero';
import { AdminReportMaturityDomainSection } from '@/components/report/AdminReportMaturityDomainSection';
import { AdminReportFindingsDomainsSection } from '@/components/report/AdminReportFindingsDomainsSection';
import { useAdminAccess } from '@/lib/admin-access';

function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  richTextBadge,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  richTextBadge: string;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  function runCommand(command: 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList' | 'removeFormat') {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command);
    onChange(editorRef.current.innerHTML);
  }

  return (
    <label className="mt-4 block">
      <div className="mb-1 flex items-center justify-between">
        <span className="block text-xs font-medium text-[#5f7395]">{label}</span>
        <span className="rounded-full bg-[#e6f1fb] px-2 py-0.5 text-[10px] font-semibold text-[#185fa5]">{richTextBadge}</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#d4dced] bg-white focus-within:border-[#3e69b0]">
        <div className="flex items-center gap-1 border-b border-[#e2e8f5] bg-[#f7f9fe] px-2 py-1">
          <button type="button" className="h-6 w-6 rounded text-xs hover:bg-white" onClick={() => runCommand('bold')}>
            <span className="font-bold">B</span>
          </button>
          <button type="button" className="h-6 w-6 rounded text-xs italic hover:bg-white" onClick={() => runCommand('italic')}>
            I
          </button>
          <button type="button" className="h-6 w-6 rounded text-xs underline hover:bg-white" onClick={() => runCommand('underline')}>
            U
          </button>
          <div className="mx-1 h-4 w-px bg-[#d4dced]" />
          <button type="button" className="h-6 w-6 rounded text-xs hover:bg-white" onClick={() => runCommand('insertUnorderedList')}>
            •
          </button>
          <button type="button" className="h-6 w-6 rounded text-xs hover:bg-white" onClick={() => runCommand('insertOrderedList')}>
            1.
          </button>
          <div className="mx-1 h-4 w-px bg-[#d4dced]" />
          <button type="button" className="h-6 w-6 rounded text-xs hover:bg-white" onClick={() => runCommand('removeFormat')}>
            x
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={(event) => onChange((event.currentTarget as HTMLDivElement).innerHTML)}
          className="min-h-[12rem] px-4 py-3 text-[0.9375rem] text-[#25375a] outline-none [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5"
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>
    </label>
  );
}

function hasMeaningfulRichText(html: string) {
  const plain = html
    .replace(/<br\s*\/?>(?=\s*<\/p>)/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return plain.length > 0;
}

export default function AdminReportDetailPage() {
  const { isReadOnly } = useAdminAccess();
  const params = useParams();
  const router = useRouter();
  const routeSlug = decodeURIComponent((params.reportId as string) ?? '');
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminReportDetailMessages, locale, key, values);

  const [apiReportId, setApiReportId] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [findings, setFindings] = useState<ReportFindingItem[]>([]);
  const [summaries, setSummaries] = useState<ReportSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [requestChangesNote, setRequestChangesNote] = useState('');
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  async function loadReportData(reportUuid: string) {
    setLoading(true);
    setError('');
    try {
      const [reportData, findingsData, summariesData] = await Promise.all([
        getReport(reportUuid),
        getReportFindings(reportUuid),
        getReportSummaries(reportUuid),
      ]);
      setReport(reportData);
      setFindings(findingsData);
      setSummaries(summariesData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('load.failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartReview() {
    if (!apiReportId) return;
    setActionLoading(true);
    try {
      await startReportReview(apiReportId, t('api.startReviewNote'));
      await loadReportData(apiReportId);
      toast.success(t('toast.reviewStarted'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.reviewStartFailed');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    if (!apiReportId) return;
    if (!hasMeaningfulRichText(approvalNote)) {
      toast.error(t('toast.approvalNoteRequired'));
      return;
    }

    setActionLoading(true);
    try {
      await approveReport(apiReportId, approvalNote.trim());
      setApprovalOpen(false);
      setApprovalNote('');
      await loadReportData(apiReportId);
      toast.success(t('toast.approved'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.approveFailed');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePublish() {
    if (!apiReportId) return;
    const storageKey = window.prompt(t('prompt.pdfKey'), report?.final_pdf_storage_key ?? '');
    if (!storageKey?.trim()) return;
    const pdfPassword = window.prompt(t('prompt.pdfPassword'), '');
    if (pdfPassword === null) return;
    if (!pdfPassword.trim()) {
      toast.error(t('toast.passwordRequired'));
      return;
    }

    setActionLoading(true);
    try {
      await publishReport(apiReportId, storageKey.trim(), pdfPassword.trim());
      await loadReportData(apiReportId);
      toast.success(t('toast.published'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.publishFailed');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function submitRequestChanges() {
    if (!apiReportId) return;
    const note = requestChangesNote.trim();
    if (!hasMeaningfulRichText(note)) {
      toast.error(t('toast.changesNoteRequired'));
      return;
    }

    setActionLoading(true);
    try {
      await requestReportChanges(apiReportId, note);
      setRequestChangesOpen(false);
      setRequestChangesNote('');
      await loadReportData(apiReportId);
      toast.success(t('toast.changesRequested'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.changesRequestFailed');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setApiReportId(null);
    setReport(null);
    setLoading(true);
    setError('');
    void resolveReportUuidFromRoute(routeSlug)
      .then((id) => {
        if (!cancelled) setApiReportId(id);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : t('load.failed');
        setError(msg);
        toast.error(msg);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [routeSlug, locale]);

  useEffect(() => {
    if (!apiReportId) return;
    void loadReportData(apiReportId);
  }, [apiReportId]);

  useEffect(() => {
    if (!report) return;
    const canonicalCode = formatReportCode(report);
    if (routeSlug !== canonicalCode && isReportUuid(routeSlug)) {
      router.replace(adminReportDetailPath(report) as any);
    }
  }, [report, routeSlug, router]);

  useEffect(() => {
    if (!requestChangesOpen && !approvalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !actionLoading) {
        if (requestChangesOpen) {
          setRequestChangesOpen(false);
          setRequestChangesNote('');
        }
        if (approvalOpen) {
          setApprovalOpen(false);
          setApprovalNote('');
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestChangesOpen, approvalOpen, actionLoading]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </section>
    );
  }

  if (error || !report) {
    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">
          {error || t('error.notFound')}
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-6">
      <AdminReportAssessmentHero report={report} findings={findings} summaries={summaries} />

      <AdminReportMaturityDomainSection report={report} />

      <AdminReportFindingsDomainsSection report={report} findings={findings} summaries={summaries} />

      {!isReadOnly &&
      (report.status === 'draft_generated' ||
        report.status === 'under_review' ||
        report.status === 'approved') && (
      <div className="flex flex-wrap gap-3">
        {report.status === 'draft_generated' && (
          <button
            type="button"
            onClick={handleStartReview}
            disabled={actionLoading}
            className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
          >
            {actionLoading ? t('actions.processing') : t('actions.startReview')}
          </button>
        )}
        {report.status === 'under_review' && (
          <>
            <button
              type="button"
              onClick={() => {
                setApprovalNote(report.auditor_note?.trim() ?? '');
                setApprovalOpen(true);
              }}
              disabled={actionLoading}
              className="rounded-xl border border-[#2f9960] bg-[#2f9960] px-4 py-2 text-sm font-semibold text-white hover:bg-[#268a53] disabled:opacity-60"
            >
              {actionLoading ? t('actions.processing') : t('actions.approve')}
            </button>
            <button
              type="button"
              onClick={() => {
                setRequestChangesNote('');
                setRequestChangesOpen(true);
              }}
              disabled={actionLoading}
              className="rounded-xl border border-[#b6862f] bg-[#b6862f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a0772a] disabled:opacity-60"
            >
              {t('actions.requestChanges')}
            </button>
          </>
        )}
        {!isReadOnly && report.status === 'approved' ? (
          <button
            type="button"
            onClick={handlePublish}
            disabled={actionLoading}
            className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
          >
            {actionLoading ? t('actions.processing') : t('actions.publish')}
          </button>
        ) : null}
      </div>
      )}

      {(report.final_pdf_storage_key || report.final_pdf_published_at) && (
        <article className="rounded-2xl border border-[#dbe4f4] bg-white px-4 py-3 shadow-sm">
          <h2 className="text-sm font-semibold text-[#243555]">{t('publication.title')}</h2>
          <div className="mt-2 grid gap-2 text-sm text-[#607594] md:grid-cols-2">
            <p>
              {t('publication.pdfKey')} {report.final_pdf_storage_key || t('publication.notSet')}
            </p>
            <p>
              {t('publication.publishedAt')}{' '}
              {report.final_pdf_published_at ? formatReportDateTime(report.final_pdf_published_at) : t('publication.notYet')}
            </p>
            <p>
              {t('publication.password')} {report.has_pdf_password ? t('publication.passwordSet') : t('publication.passwordNotSet')}
            </p>
          </div>
        </article>
      )}

      <div id="admin-report-findings" className="grid min-w-0 gap-6 scroll-mt-24 xl:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('findings.title', { count: String(findings.length) })}</h2>
          <div className="space-y-3">
            {findings.map((finding) => (
              <article key={finding.id} className="rounded-xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    finding.priority === 'high' ? 'bg-[#fee2e2] text-[#dc2626]' :
                    finding.priority === 'medium' ? 'bg-[#fef3c7] text-[#d97706]' :
                    'bg-[#e0e7ff] text-[#3730a3]'
                  }`}>
                    {t(`findings.priority.${finding.priority}`)}
                  </span>
                </div>
                <p className="text-sm text-[#2b3e60] mb-2">{finding.finding_text}</p>
                {finding.recommendation_text && (
                  <div className="border-t border-[#edf2f9] pt-2">
                    <p className="text-xs font-semibold text-[#607594] mb-1">{t('findings.recommendation')}</p>
                    <p className="text-sm text-[#2b3e60]">{finding.recommendation_text}</p>
                  </div>
                )}
              </article>
            ))}
            {!findings.length && (
              <p className="text-sm text-[#607594]">{t('findings.empty')}</p>
            )}
          </div>
        </section>

        <section id="admin-section-summaries-detail" className="min-w-0 scroll-mt-24 space-y-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('summaries.title', { count: String(summaries.length) })}</h2>
          <div className="space-y-3">
            {summaries.map((summary, idx) => {
              const summaryKey =
                (typeof summary.id === 'string' && summary.id.trim() !== '' ? summary.id : null) ??
                `summary-${[summary.section_id, summary.chapter_code].filter(Boolean).join('-') || 'row'}-${idx}`;
              return (
              <article
                key={summaryKey}
                className="rounded-xl border border-[#e2e8f5] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#243555]">
                    {summary.chapter_code || t('summaries.generalSection')}
                  </h3>
                </div>
                <p className="text-sm text-[#2b3e60]">
                  {summary.summary_text?.trim() ? summary.summary_text : t('summaries.noNarrative')}
                </p>
              </article>
              );
            })}
            {!summaries.length && (
              <p className="text-sm text-[#607594]">{t('summaries.empty')}</p>
            )}
          </div>
        </section>
      </div>

      {requestChangesOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4 py-8"
          onClick={() => {
            if (!actionLoading) {
              setRequestChangesOpen(false);
              setRequestChangesNote('');
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-changes-title"
            className="w-full max-w-lg md:max-w-xl lg:max-w-2xl rounded-2xl border border-[#dbe4f4] bg-white p-6 md:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="request-changes-title" className="text-lg font-semibold text-[#1f2d45] md:text-xl">
              {t('modal.requestChanges.title')}
            </h2>
            <p className="mt-1 text-sm text-[#607594] md:text-[0.9375rem]">{t('modal.requestChanges.body')}</p>
            <RichTextEditor
              label={t('modal.requestChanges.label')}
              value={requestChangesNote}
              onChange={setRequestChangesNote}
              placeholder={t('modal.requestChanges.placeholder')}
              richTextBadge={t('richText.badge')}
            />
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setRequestChangesOpen(false);
                  setRequestChangesNote('');
                }}
                className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
              >
                {t('modal.cancel')}
              </button>
              <button
                type="button"
                disabled={actionLoading || !hasMeaningfulRichText(requestChangesNote)}
                onClick={() => void submitRequestChanges()}
                className="rounded-lg border border-[#b6862f] bg-[#b6862f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#a0772a] disabled:opacity-60"
              >
                {actionLoading ? t('modal.sending') : t('modal.send')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {approvalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4 py-8"
          onClick={() => {
            if (!actionLoading) {
              setApprovalOpen(false);
              setApprovalNote('');
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-note-title"
            className="w-full max-w-lg md:max-w-xl lg:max-w-2xl rounded-2xl border border-[#dbe4f4] bg-white p-6 md:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="approval-note-title" className="text-lg font-semibold text-[#1f2d45] md:text-xl">
              {t('modal.approval.title')}
            </h2>
            <p className="mt-1 text-sm text-[#607594] md:text-[0.9375rem]">{t('modal.approval.body')}</p>
            <RichTextEditor
              label={t('modal.approval.label')}
              value={approvalNote}
              onChange={setApprovalNote}
              placeholder={t('modal.approval.placeholder')}
              richTextBadge={t('richText.badge')}
            />
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setApprovalOpen(false);
                  setApprovalNote('');
                }}
                className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
              >
                {t('modal.cancel')}
              </button>
              <button
                type="button"
                disabled={actionLoading || !hasMeaningfulRichText(approvalNote)}
                onClick={() => void handleApprove()}
                className="rounded-lg border border-[#2f9960] bg-[#2f9960] px-3 py-2 text-sm font-semibold text-white hover:bg-[#268a53] disabled:opacity-60"
              >
                {actionLoading ? t('modal.sending') : t('modal.approval.send')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
