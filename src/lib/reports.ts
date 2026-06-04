import { apiGetBlobWithAuth, apiGetWithAuth, apiPost, apiPut } from '@/lib/api';

export type ReportStatus = 'draft_generated' | 'under_review' | 'changes_requested' | 'approved' | 'published';

export type ReportResponse = {
  id: string;
  assessment_id: string;
  report_code?: string | null;
  company_id?: string | null;
  company_name?: string | null;
  company_website?: string | null;
  company_industry?: string | null;
  company_size?: string | null;
  company_region?: string | null;
  company_country?: string | null;
  company_description?: string | null;
  status: ReportStatus;
  draft_generated_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  final_pdf_storage_key: string | null;
  has_pdf_password: boolean;
  auditor_note?: string | null;
  final_pdf_published_at: string | null;
  findings_count: number;
  summaries_count: number;
  checklist_title?: string | null;
  checklist_version?: string | null;
  /** Checklist sections (domains) with scores; returned by admin GET report when available */
  section_overviews?: ReportSectionOverview[] | null;
};

export type ReportSectionOverview = {
  id: string | null;
  report_id?: string | null;
  section_id: string;
  section_code?: string | null;
  section_title?: string | null;
  chapter_code?: string | null;
  summary_text?: string | null;
  score: number;
  max_score: number;
  percentage: number;
  question_count?: number | null;
  answered_question_count?: number | null;
  /** When set, dashed target polygon uses this per axis (0–100). */
  target_percentage?: number | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/** Roll up section_overviews for admin report hero metrics. */
export function aggregateReportSectionOverviews(
  sections: ReportSectionOverview[] | null | undefined,
): {
  sectionCount: number;
  totalQuestions: number;
  answeredQuestions: number;
  weightedPercentage: number;
} | null {
  const list = sections?.filter((s) => s && s.section_id) ?? [];
  if (!list.length) return null;
  const totalQuestions = list.reduce((a, s) => a + (s.question_count ?? 0), 0);
  const answeredQuestions = list.reduce((a, s) => a + (s.answered_question_count ?? 0), 0);
  let weightedPercentage = 0;
  if (totalQuestions > 0) {
    weightedPercentage =
      list.reduce((a, s) => a + (Number(s.percentage) || 0) * (s.question_count ?? 0), 0) / totalQuestions;
  } else {
    weightedPercentage = list.reduce((a, s) => a + (Number(s.percentage) || 0), 0) / list.length;
  }
  return {
    sectionCount: list.length,
    totalQuestions,
    answeredQuestions,
    weightedPercentage: Math.round(Math.min(100, Math.max(0, weightedPercentage))),
  };
}

/** Customer list/detail endpoints may include company metadata and report_code (OpenAPI). */
export type CustomerReportSummary = ReportResponse & {
  report_code?: string | null;
  company_id?: string | null;
  company_name?: string | null;
  company_website?: string | null;
  company_industry?: string | null;
  company_size?: string | null;
  company_region?: string | null;
  company_country?: string | null;
  company_description?: string | null;
};

export type PaginatedCustomerReportsResponse = {
  reports: CustomerReportSummary[];
  total: number;
};

export type ReportListItem = {
  id: string;
  assessment_id: string;
  report_code?: string | null;
  customer_email: string;
  customer_name: string;
  checklist_title: string;
  checklist_version: string;
  status: ReportStatus;
  draft_generated_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  findings_count: number;
  summaries_count: number;
  reviewer_name: string | null;
};

const REPORT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isReportUuid(value: string): boolean {
  return REPORT_UUID_RE.test(value.trim());
}

/** Expand strftime-style placeholders (e.g. %m%d) using draft_generated_at. */
export function expandReportCodePlaceholders(
  code: string,
  referenceIso: string | null | undefined,
): string {
  if (!/%[a-zA-Z%]/.test(code)) return code;
  const ref = referenceIso ? new Date(referenceIso) : new Date();
  if (Number.isNaN(ref.getTime())) return code;
  const y = ref.getUTCFullYear();
  const m = String(ref.getUTCMonth() + 1).padStart(2, '0');
  const d = String(ref.getUTCDate()).padStart(2, '0');
  const h = String(ref.getUTCHours()).padStart(2, '0');
  const min = String(ref.getUTCMinutes()).padStart(2, '0');
  const s = String(ref.getUTCSeconds()).padStart(2, '0');
  return code
    .replace(/%m%d/g, `${m}${d}`)
    .replace(/%Y/g, String(y))
    .replace(/%H%M%S/g, `${h}${min}${s}`)
    .replace(/%H/g, h)
    .replace(/%M/g, min)
    .replace(/%S/g, s);
}

export function formatReportCode(row: {
  id: string;
  report_code?: string | null;
  draft_generated_at?: string | null;
}): string {
  const raw = row.report_code?.trim();
  if (raw) return expandReportCodePlaceholders(raw, row.draft_generated_at);
  return row.id;
}

export function adminReportDetailPath(row: {
  id: string;
  report_code?: string | null;
  draft_generated_at?: string | null;
}): string {
  return `/admin/reports/${encodeURIComponent(formatReportCode(row))}`;
}

/** Map admin route slug (report code or legacy UUID) to API report UUID. */
export async function resolveReportUuidFromRoute(slug: string): Promise<string> {
  const decoded = decodeURIComponent(slug.trim());
  if (isReportUuid(decoded)) return decoded;

  const { reports } = await getReportsList({ limit: 500 });
  const match = reports.find((r) => formatReportCode(r) === decoded);
  if (match) return match.id;

  throw new Error('Report not found');
}

export type ReportSummaryItem = {
  id: string | null;
  report_id?: string;
  section_id: string | null;
  chapter_code: string | null;
  summary_text: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
};

export type ReportFindingItem = {
  id: string;
  report_id?: string;
  question_id: string;
  answer_id: string;
  priority: 'low' | 'medium' | 'high';
  finding_text: string;
  recommendation_text: string | null;
  created_at: string;
};

export type CustomerReportQuestionScore = {
  question_id?: string;
  question_code?: string | null;
  question_title?: string | null;
  report_domain?: string | null;
  score: number;
  max_score: number;
  percentage: number;
};

export type CustomerReportSectionScore = {
  section_id: string;
  section_code?: string | null;
  /** Legacy / alternate API field */
  section_name?: string;
  section_title?: string | null;
  report_domain?: string | null;
  score: number;
  max_score: number;
  percentage: number;
  question_count?: number;
  answered_question_count?: number;
  question_scores?: CustomerReportQuestionScore[];
};

export type CustomerReportQuestionScoreDistribution = {
  score: number;
  count: number;
  percentage: number;
};

export type CustomerReportChapterData = {
  chapter_code: string;
  title: string;
  score: number;
  max_score: number;
  percentage: number;
  findings_count: number;
  recommendations: string;
};

export type CustomerReportFinding = {
  question_text: string;
  answer?: string;
  priority: 'low' | 'medium' | 'high';
  recommendation?: string | null;
  report_domain?: string | null;
  section_code?: string | null;
  section_title?: string | null;
};

export type CustomerReportSectionSummary = {
  section_id: string;
  chapter_code: string;
  section_code?: string | null;
  section_title?: string | null;
  summary_text: string;
};

export type CustomerReportSuggestion = {
  suggestion_text: string;
  created_at: string;
  question_id: string | null;
  assessment_question_review_id: string | null;
};

/** Deep-link to a specific assessment question (read-only when submitted). */
export function buildCustomerAssessmentQuestionHref(params: {
  assessmentId: string;
  checklistId?: string | null;
  questionId?: string | null;
}): string | null {
  const questionId = params.questionId?.trim();
  const assessmentId = params.assessmentId?.trim();
  if (!questionId || !assessmentId) return null;
  const qs = new URLSearchParams();
  qs.set('assessment_id', assessmentId);
  qs.set('question_id', questionId);
  const checklistId = params.checklistId?.trim();
  if (checklistId) qs.set('checklist_id', checklistId);
  return `/assessment?${qs.toString()}`;
}

export type CustomerReportDomainDatum = Record<string, unknown>;

export type CustomerReportDataResponse = {
  report_id: string;
  report_uuid?: string;
  assessment_id: string;
  customer_name: string;
  customer_email: string;
  company_name?: string | null;
  company_website?: string | null;
  company_industry?: string | null;
  company_size?: string | null;
  company_region?: string | null;
  company_country?: string | null;
  company_description?: string | null;
  checklist_title: string;
  checklist_type_name?: string | null;
  assessment_date: string;
  report_status: ReportStatus;
  overall_score: number;
  max_possible_score: number;
  /** When set, preferred over deriving from overall_score / max_possible_score */
  total_score_percentage?: number | null;
  completion_percentage: number;
  total_questions?: number | null;
  answered_questions?: number | null;
  standard_covered_all?: boolean | null;
  question_score_distribution?: CustomerReportQuestionScoreDistribution[] | null;
  section_scores: CustomerReportSectionScore[];
  chapter_data: CustomerReportChapterData[];
  domain_data?: CustomerReportDomainDatum[] | null;
  findings: CustomerReportFinding[];
  section_summaries: CustomerReportSectionSummary[];
  public_suggestions: CustomerReportSuggestion[];
  auditor_note?: string | null;
  generated_at: string;
  approved_at: string | null;
  published_at: string | null;
};

export function sectionScoreDisplayName(s: CustomerReportSectionScore): string {
  const t = s.section_title ?? s.section_name ?? s.section_code;
  return (t && String(t).trim()) || 'Section';
}

export function customerReportOverallPercentage(data: CustomerReportDataResponse): number {
  if (data.total_score_percentage != null && Number.isFinite(data.total_score_percentage)) {
    return Math.min(100, Math.max(0, data.total_score_percentage));
  }
  if (data.max_possible_score > 0) {
    return Math.min(100, Math.max(0, (data.overall_score / data.max_possible_score) * 100));
  }
  return 0;
}

export function downloadCustomerReportPdf(reportId: string) {
  return apiGetBlobWithAuth(`/customer/reports/${reportId}/download`);
}

export type ReportPdfPasswordResponse = {
  has_pdf_password: boolean;
  pdf_password: string | null;
};

export function getCustomerReportPdfPassword(reportId: string) {
  return apiGetWithAuth<ReportPdfPasswordResponse>(`/customer/reports/${reportId}/pdf-password`);
}

export type ReviewActionRequest = {
  note: string;
};

export type UpsertReportSummaryRequest = {
  section_id?: string;
  chapter_code?: string;
  summary_text: string;
};

export function generateDraftReport(assessmentId: string) {
  return apiPost<ReportResponse, { assessment_id: string }>(`/reports/draft`, { assessment_id: assessmentId })
    .then(sanitizeReportCodeRow)
    .then(normalizeAdminReportSectionOverviews);
}

export function getReportsList(params?: {
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.sort_by) query.set('sort_by', params.sort_by);
  if (params?.sort_order) query.set('sort_order', params.sort_order);
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiGetWithAuth<{ reports: ReportListItem[]; total: number }>(`/reports${qs ? `?${qs}` : ''}`);
}

/** Some gateways return camelCase; admin UI expects snake_case section_overviews. */
export function normalizeAdminReportSectionOverviews(row: ReportResponse): ReportResponse {
  const any = row as unknown as { sectionOverviews?: ReportSectionOverview[] };
  if (Array.isArray(row.section_overviews) && row.section_overviews.length > 0) return row;
  if (Array.isArray(any.sectionOverviews) && any.sectionOverviews.length > 0) {
    return { ...row, section_overviews: any.sectionOverviews };
  }
  return row;
}

export function getReport(reportId: string) {
  return apiGetWithAuth<ReportResponse>(`/reports/${reportId}`)
    .then(sanitizeReportCodeRow)
    .then(normalizeAdminReportSectionOverviews);
}

export function sanitizeReportCodeRow<
  T extends { id: string; report_code?: string | null; draft_generated_at?: string | null },
>(row: T): T {
  const code = row.report_code?.trim() ?? '';
  if (code && /%[a-zA-Z%]/.test(code)) {
    return {
      ...row,
      report_code: expandReportCodePlaceholders(code, row.draft_generated_at),
    };
  }
  return row;
}

function sanitizeLoadedCustomerReport(row: CustomerReportSummary): CustomerReportSummary {
  return sanitizeReportCodeRow(row);
}

export function getCustomerReport(reportId: string) {
  return apiGetWithAuth<CustomerReportSummary>(`/customer/reports/${reportId}`).then(sanitizeLoadedCustomerReport);
}

export function getReportByAssessment(assessmentId: string) {
  return apiGetWithAuth<ReportResponse>(`/reports/assessment/${assessmentId}`)
    .then(sanitizeReportCodeRow)
    .then(normalizeAdminReportSectionOverviews);
}

export function startReportReview(reportId: string, note: string) {
  return apiPost<ReportResponse, ReviewActionRequest>(`/reports/${reportId}/review/start`, { note });
}

export function requestReportChanges(reportId: string, note: string) {
  return apiPost<ReportResponse, ReviewActionRequest>(`/reports/${reportId}/review/request-changes`, { note });
}

export function approveReport(reportId: string, note: string) {
  return apiPost<ReportResponse, ReviewActionRequest>(`/reports/${reportId}/approve`, { note });
}

export function publishReport(reportId: string, finalPdfStorageKey: string, pdfPassword?: string) {
  const payload: { final_pdf_storage_key: string; pdf_password?: string } = {
    final_pdf_storage_key: finalPdfStorageKey,
  };
  if (pdfPassword && pdfPassword.trim()) payload.pdf_password = pdfPassword.trim();
  return apiPost<ReportResponse, { final_pdf_storage_key: string; pdf_password?: string }>(
    `/reports/${reportId}/publish`,
    payload,
  );
}

export function getReportFindings(reportId: string) {
  return apiGetWithAuth<ReportFindingItem[]>(`/reports/${reportId}/findings`);
}

export function getReportSummaries(reportId: string) {
  return apiGetWithAuth<ReportSummaryItem[]>(`/reports/${reportId}/summaries`);
}

export function upsertReportSummary(reportId: string, data: UpsertReportSummaryRequest) {
  return apiPost<ReportSummaryItem, UpsertReportSummaryRequest>(`/reports/${reportId}/summaries`, data);
}

export function getCustomerReportsPage(params?: {
  skip?: number;
  limit?: number;
  sort_by?: 'final_pdf_published_at' | 'approved_at' | 'draft_generated_at' | 'created_at';
  sort_order?: 'asc' | 'desc';
}) {
  const query = new URLSearchParams();
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  if (params?.sort_by) query.set('sort_by', params.sort_by);
  if (params?.sort_order) query.set('sort_order', params.sort_order);
  const qs = query.toString();
  return apiGetWithAuth<PaginatedCustomerReportsResponse>(`/customer/reports/my-reports${qs ? `?${qs}` : ''}`).then(
    (data) => ({
      reports: data.reports.map(sanitizeLoadedCustomerReport),
      total: data.total ?? 0,
    }),
  );
}

export function getCustomerReports() {
  return getCustomerReportsPage({ skip: 0, limit: 100, sort_by: 'final_pdf_published_at', sort_order: 'desc' }).then(
    (data) => data.reports,
  );
}

export function getCustomerReportByAssessment(assessmentId: string) {
  return apiGetWithAuth<CustomerReportSummary>(`/customer/reports/assessment/${assessmentId}`).then(
    sanitizeLoadedCustomerReport,
  );
}

/** Coerce API values that may be number, numeric string, or `{ source, parsedValue }`. */
export function parseFlexibleNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number.parseFloat(value);
    if (Number.isFinite(n)) return n;
  }
  if (value && typeof value === 'object' && 'parsedValue' in value) {
    const pv = (value as { parsedValue: unknown }).parsedValue;
    if (typeof pv === 'number' && Number.isFinite(pv)) return pv;
    if (typeof pv === 'string' && pv.trim() !== '') {
      const n = Number.parseFloat(pv);
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}

function normalizeQuestionScore(raw: unknown): CustomerReportQuestionScore {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    question_id: o.question_id != null ? String(o.question_id) : undefined,
    question_code: o.question_code != null ? String(o.question_code) : null,
    question_title: o.question_title != null ? String(o.question_title) : null,
    report_domain: o.report_domain != null ? String(o.report_domain) : null,
    score: parseFlexibleNumber(o.score),
    max_score: parseFlexibleNumber(o.max_score),
    percentage: parseFlexibleNumber(o.percentage),
  };
}

function normalizeSectionScore(raw: unknown): CustomerReportSectionScore {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    section_id: String(o.section_id ?? ''),
    section_code: o.section_code != null ? String(o.section_code) : null,
    section_name: o.section_name != null ? String(o.section_name) : undefined,
    section_title: o.section_title != null ? String(o.section_title) : null,
    report_domain: o.report_domain != null ? String(o.report_domain) : null,
    score: parseFlexibleNumber(o.score),
    max_score: parseFlexibleNumber(o.max_score),
    percentage: parseFlexibleNumber(o.percentage),
    question_count: o.question_count != null ? Math.round(parseFlexibleNumber(o.question_count)) : undefined,
    answered_question_count:
      o.answered_question_count != null ? Math.round(parseFlexibleNumber(o.answered_question_count)) : undefined,
    question_scores: Array.isArray(o.question_scores)
      ? (o.question_scores as unknown[]).map(normalizeQuestionScore)
      : undefined,
  };
}

function normalizeDistributionRow(raw: unknown): CustomerReportQuestionScoreDistribution {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    score: Math.round(parseFlexibleNumber(o.score)),
    count: Math.round(parseFlexibleNumber(o.count)),
    percentage: parseFlexibleNumber(o.percentage),
  };
}

function normalizeChapterRow(raw: unknown): CustomerReportChapterData {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    chapter_code: String(o.chapter_code ?? ''),
    title: String(o.title ?? o.chapter_code ?? ''),
    score: parseFlexibleNumber(o.score),
    max_score: parseFlexibleNumber(o.max_score),
    percentage: parseFlexibleNumber(o.percentage),
    findings_count: Math.round(parseFlexibleNumber(o.findings_count)),
    recommendations: String(o.recommendations ?? ''),
  };
}

function normalizeDomainRow(raw: unknown): CustomerReportDomainDatum {
  if (!raw || typeof raw !== 'object') return {};
  const o = { ...(raw as Record<string, unknown>) };
  if (o.percentage !== undefined) {
    o.percentage = parseFlexibleNumber(o.percentage);
  }
  if (o.score !== undefined) o.score = parseFlexibleNumber(o.score);
  if (o.max_score !== undefined) o.max_score = parseFlexibleNumber(o.max_score);
  if (o.question_count !== undefined) o.question_count = Math.round(parseFlexibleNumber(o.question_count));
  return o as CustomerReportDomainDatum;
}

function sanitizeReportCode(
  code: string,
  reportUuid: string | undefined,
  referenceIso?: string | null,
): string {
  const c = code.trim();
  if (!c) return reportUuid ? `RPT-${reportUuid.replace(/-/g, '').slice(0, 8).toUpperCase()}` : c;
  if (/%[a-zA-Z%]/.test(c)) {
    const expanded = expandReportCodePlaceholders(c, referenceIso);
    if (/%[a-zA-Z%]/.test(expanded)) {
      return reportUuid ? `RPT-${reportUuid.replace(/-/g, '').slice(0, 8).toUpperCase()}` : expanded.replace(/%[a-zA-Z]+/g, '—');
    }
    return expanded;
  }
  return c;
}

/**
 * Normalizes customer report `/data` payloads where the API may send
 * `{ source, parsedValue }` wrappers instead of plain numbers (and optional strftime leaks in codes).
 */
export function normalizeCustomerReportData(raw: unknown): CustomerReportDataResponse {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid report data');
  }
  const r = raw as Record<string, unknown>;
  const reportUuid = r.report_uuid != null ? String(r.report_uuid) : undefined;
  const reportIdRaw = r.report_id != null ? String(r.report_id) : '';
  const generatedAt = r.generated_at != null ? String(r.generated_at) : null;
  const report_id = sanitizeReportCode(reportIdRaw, reportUuid, generatedAt);

  const section_scores = Array.isArray(r.section_scores)
    ? (r.section_scores as unknown[]).map(normalizeSectionScore)
    : [];
  const chapter_data = Array.isArray(r.chapter_data)
    ? (r.chapter_data as unknown[]).map(normalizeChapterRow)
    : [];
  const domain_data = Array.isArray(r.domain_data)
    ? (r.domain_data as unknown[]).map(normalizeDomainRow)
    : null;

  const dist = Array.isArray(r.question_score_distribution)
    ? (r.question_score_distribution as unknown[]).map(normalizeDistributionRow)
    : null;

  const findings = Array.isArray(r.findings)
    ? (r.findings as Record<string, unknown>[]).map((f) => ({
        question_text: String(f.question_text ?? ''),
        answer: f.answer != null ? String(f.answer) : undefined,
        priority: (['low', 'medium', 'high'].includes(String(f.priority)) ? f.priority : 'medium') as
          | 'low'
          | 'medium'
          | 'high',
        recommendation: f.recommendation != null ? String(f.recommendation) : null,
        report_domain: f.report_domain != null ? String(f.report_domain) : null,
      }))
    : [];

  const section_summaries = Array.isArray(r.section_summaries)
    ? (r.section_summaries as Record<string, unknown>[]).map((s) => ({
        section_id: String(s.section_id ?? ''),
        chapter_code: String(s.chapter_code ?? ''),
        summary_text: String(s.summary_text ?? ''),
      }))
    : [];

  const public_suggestions = Array.isArray(r.public_suggestions)
    ? (r.public_suggestions as Record<string, unknown>[]).map((s) => ({
        suggestion_text: String(s.suggestion_text ?? ''),
        created_at: String(s.created_at ?? ''),
        question_id: s.question_id != null ? String(s.question_id) : null,
        assessment_question_review_id:
          s.assessment_question_review_id != null ? String(s.assessment_question_review_id) : null,
      }))
    : [];

  const totalPctRaw = r.total_score_percentage;
  const totalPct =
    totalPctRaw !== undefined && totalPctRaw !== null ? parseFlexibleNumber(totalPctRaw) : null;

  const completionRaw = r.completion_percentage;
  const completionPct =
    completionRaw !== undefined && completionRaw !== null ? parseFlexibleNumber(completionRaw) : 0;

  const allowedStatus: ReportStatus[] = [
    'draft_generated',
    'under_review',
    'changes_requested',
    'approved',
    'published',
  ];
  const rs = String(r.report_status ?? 'draft_generated');
  const report_status: ReportStatus = allowedStatus.includes(rs as ReportStatus) ? (rs as ReportStatus) : 'draft_generated';

  return {
    report_id,
    report_uuid: reportUuid,
    assessment_id: String(r.assessment_id ?? ''),
    customer_name: String(r.customer_name ?? ''),
    customer_email: String(r.customer_email ?? ''),
    company_name: r.company_name != null ? String(r.company_name) : null,
    company_website: r.company_website != null ? String(r.company_website) : null,
    company_industry: r.company_industry != null ? String(r.company_industry) : null,
    company_size: r.company_size != null ? String(r.company_size) : null,
    company_region: r.company_region != null ? String(r.company_region) : null,
    company_country: r.company_country != null ? String(r.company_country) : null,
    company_description: r.company_description != null ? String(r.company_description) : null,
    checklist_title: String(r.checklist_title ?? ''),
    assessment_date: String(r.assessment_date ?? ''),
    report_status,
    overall_score: parseFlexibleNumber(r.overall_score),
    max_possible_score: Math.round(parseFlexibleNumber(r.max_possible_score)),
    total_score_percentage: totalPct !== null && Number.isFinite(totalPct) ? totalPct : null,
    completion_percentage: completionPct,
    total_questions: r.total_questions != null ? Math.round(parseFlexibleNumber(r.total_questions)) : null,
    answered_questions: r.answered_questions != null ? Math.round(parseFlexibleNumber(r.answered_questions)) : null,
    standard_covered_all: typeof r.standard_covered_all === 'boolean' ? r.standard_covered_all : null,
    question_score_distribution: dist && dist.length ? dist : null,
    section_scores,
    chapter_data,
    domain_data,
    findings,
    section_summaries,
    public_suggestions,
    generated_at: String(r.generated_at ?? ''),
    approved_at: r.approved_at != null ? String(r.approved_at) : null,
    published_at: r.published_at != null ? String(r.published_at) : null,
  };
}

export function getCustomerReportData(reportId: string) {
  return apiGetWithAuth<unknown>(`/customer/reports/${reportId}/data`).then(normalizeCustomerReportData);
}
