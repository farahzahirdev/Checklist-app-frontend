import { apiGetWithAuth, apiPost, apiPut } from '@/lib/api';

export type ReportStatus = 'draft_generated' | 'under_review' | 'changes_requested' | 'approved' | 'published';

export type ReportResponse = {
  id: string;
  assessment_id: string;
  status: ReportStatus;
  draft_generated_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  final_pdf_storage_key: string | null;
  final_pdf_published_at: string | null;
  findings_count: number;
  summaries_count: number;
};

export type ReportListItem = {
  id: string;
  assessment_id: string;
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

export type ReportSummaryItem = {
  id: string;
  report_id: string;
  section_id: string | null;
  chapter_code: string | null;
  summary_text: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type ReportFindingItem = {
  id: string;
  report_id: string;
  question_id: string;
  answer_id: string;
  priority: 'low' | 'medium' | 'high';
  finding_text: string;
  recommendation_text: string | null;
  created_at: string;
};

export type CustomerReportSectionScore = {
  section_name: string;
  section_id: string;
  score: number;
  max_score: number;
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
  answer: string;
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
};

export type CustomerReportSectionSummary = {
  section_id: string;
  chapter_code: string;
  summary_text: string;
};

export type CustomerReportSuggestion = {
  suggestion_text: string;
  created_at: string;
  question_id: string | null;
};

export type CustomerReportDataResponse = {
  report_id: string;
  assessment_id: string;
  customer_name: string;
  customer_email: string;
  checklist_title: string;
  assessment_date: string;
  report_status: ReportStatus;
  overall_score: number;
  max_possible_score: number;
  completion_percentage: number;
  section_scores: CustomerReportSectionScore[];
  chapter_data: CustomerReportChapterData[];
  findings: CustomerReportFinding[];
  section_summaries: CustomerReportSectionSummary[];
  public_suggestions: CustomerReportSuggestion[];
  generated_at: string;
  approved_at: string | null;
  published_at: string | null;
};

export type ReviewActionRequest = {
  note: string;
};

export type UpsertReportSummaryRequest = {
  section_id?: string;
  chapter_code?: string;
  summary_text: string;
};

export function generateDraftReport(assessmentId: string) {
  return apiPost<ReportResponse, { assessment_id: string }>(`/reports/draft`, { assessment_id: assessmentId });
}

export function getReportsList(params?: { status?: string; skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiGetWithAuth<{ reports: ReportListItem[]; total: number }>(`/reports${qs ? `?${qs}` : ''}`);
}

export function getReport(reportId: string) {
  return apiGetWithAuth<ReportResponse>(`/reports/${reportId}`);
}

export function getCustomerReport(reportId: string) {
  return apiGetWithAuth<ReportResponse>(`/customer/reports/${reportId}`);
}

export function getReportByAssessment(assessmentId: string) {
  return apiGetWithAuth<ReportResponse>(`/reports/assessment/${assessmentId}`);
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

export function publishReport(reportId: string, finalPdfStorageKey: string) {
  return apiPost<ReportResponse, { final_pdf_storage_key: string }>(`/reports/${reportId}/publish`, { final_pdf_storage_key: finalPdfStorageKey });
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

export function getCustomerReports() {
  return apiGetWithAuth<ReportResponse[]>('/customer/reports/my-reports');
}

export function getCustomerReportByAssessment(assessmentId: string) {
  return apiGetWithAuth<ReportResponse>(`/customer/reports/assessment/${assessmentId}`);
}

export function getCustomerReportData(reportId: string) {
  return apiGetWithAuth<CustomerReportDataResponse>(`/customer/reports/${reportId}/data`);
}
