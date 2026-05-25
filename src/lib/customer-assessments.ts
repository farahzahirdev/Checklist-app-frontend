import { apiGetWithAuth, apiPost } from '@/lib/api';

export type CustomerAssessmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'expired' | 'closed';

export type CustomerAssessmentListItem = {
  id: string;
  checklist_id: string;
  checklist_title: string;
  checklist_type_code: string;
  checklist_version: string;
  status: CustomerAssessmentStatus;
  completion_percent: number;
  started_at: string | null;
  submitted_at: string | null;
  expires_at: string | null;
  days_until_expiry: number | null;
  has_report: boolean;
  report_id?: string | null;
  report_status: string | null;
  report_published_at?: string | null;
  purchased_at?: string | null;
  access_window_started_at?: string | null;
  access_window_expires_at?: string | null;
  last_activity: string | null;
};

export type CustomerAssessmentListResponse = {
  assessments: CustomerAssessmentListItem[];
  total: number;
  skip?: number;
  limit?: number;
  has_more?: boolean;
  filters_applied?: Record<string, unknown>;
  generated_at?: string;
};

export type CustomerAssessmentListParams = {
  status?: CustomerAssessmentStatus[];
  checklist_type?: string[];
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
};

function buildAssessmentListQuery(params?: CustomerAssessmentListParams): string {
  if (!params) return '';
  const query = new URLSearchParams();
  params.status?.forEach((value) => query.append('status', value));
  params.checklist_type?.forEach((value) => query.append('checklist_type', value));
  if (params.search) query.set('search', params.search);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);
  if (typeof params.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params.limit === 'number') query.set('limit', String(params.limit));
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export async function listCustomerAssessments(params?: CustomerAssessmentListParams) {
  return apiGetWithAuth<CustomerAssessmentListResponse>(`/customer/assessments/${buildAssessmentListQuery(params)}`);
}

export type CustomerAssessmentDashboardResponse = {
  summary: {
    total_purchased_checklists: number;
    active_assessments_count: number;
    submitted_assessments_count: number;
    completed_assessments_count: number;
    expired_assessments_count: number;
    reports_available: number;
    average_completion_time_days: number;
    overall_completion_rate: number;
  };
  active_assessments: CustomerAssessmentListItem[];
  recent_submissions: CustomerAssessmentListItem[];
  expiring_soon: CustomerAssessmentListItem[];
  available_checklists: Array<{
    checklist_id: string;
    title: string;
    checklist_type_code: string;
    checklist_type_name: string;
    version: string;
    description: string | null;
    estimated_duration_minutes: number | null;
    price_cents: number | null;
    currency: string | null;
    is_purchased: boolean;
    can_start: boolean;
    access_window_id: string | null;
  }>;
  quick_actions: Array<{
    action_id: string;
    action_type: string;
    label: string;
    description: string | null;
    assessment_id: string | null;
    checklist_id: string | null;
    is_enabled: boolean;
    priority: number;
  }>;
  generated_at: string;
};

export async function getCustomerAssessmentsDashboard() {
  return apiGetWithAuth<CustomerAssessmentDashboardResponse>('/customer/assessments/dashboard');
}

export type CustomerAssessmentDetailResponse = {
  id: string;
  checklist_id: string;
  checklist_title: string;
  checklist_type_code: string;
  checklist_type_name: string;
  checklist_version: string;
  status: CustomerAssessmentStatus;
  completion_percent: number;
  started_at: string | null;
  submitted_at: string | null;
  expires_at: string | null;
  days_until_expiry: number | null;
  access_window_id: string | null;
  total_questions: number;
  answered_questions: number;
  sections_completed: number;
  total_sections: number;
  estimated_time_remaining_minutes: number | null;
  last_activity: string | null;
  report_id: string | null;
  report_status: string | null;
};

export async function getCustomerAssessmentDetail(assessmentId: string) {
  return apiGetWithAuth<CustomerAssessmentDetailResponse>(`/customer/assessments/${encodeURIComponent(assessmentId)}`);
}

export type CustomerAssessmentProgressResponse = {
  assessment_id: string;
  overall_completion: number;
  sections: Array<{
    section_id: string;
    section_code: string | null;
    section_title: string;
    display_order: number;
    questions_answered: number;
    total_questions: number;
    completion_percent: number;
    is_accessible: boolean;
    is_completed: boolean;
  }>;
  questions_answered: number;
  total_questions: number;
  time_spent_minutes: number | null;
  estimated_time_remaining_minutes: number | null;
};

export async function getCustomerAssessmentProgress(assessmentId: string) {
  return apiGetWithAuth<CustomerAssessmentProgressResponse>(
    `/customer/assessments/${encodeURIComponent(assessmentId)}/progress`,
  );
}

export type CustomerAssessmentActionResponse = {
  success: boolean;
  message: string;
  assessment_id: string;
  action_performed: string;
  new_status: CustomerAssessmentStatus;
  updated_expires_at: string | null;
};

export async function performCustomerAssessmentAction(payload: {
  assessment_id: string;
  action: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}) {
  return apiPost<CustomerAssessmentActionResponse, { action: string; reason?: string; metadata?: Record<string, unknown> }>(
    `/customer/assessments/${encodeURIComponent(payload.assessment_id)}/action`,
    { action: payload.action, reason: payload.reason, metadata: payload.metadata },
  );
}

export type CustomerBulkAssessmentActionResponse = {
  success_count: number;
  failure_count: number;
  results: Array<{
    assessment_id: string;
    success: boolean;
    message: string;
    new_status: CustomerAssessmentStatus;
  }>;
  summary: string;
};

export async function performCustomerAssessmentBulkAction(payload: {
  assessment_ids: string[];
  action: string;
  parameters?: Record<string, unknown>;
}) {
  return apiPost<CustomerBulkAssessmentActionResponse, typeof payload>('/customer/assessments/bulk-action', payload);
}

export type CustomerAssessmentAnalyticsResponse = {
  total_assessments: number;
  completion_rate: number;
  average_score: number | null;
  average_time_to_completion_days: number | null;
  most_active_checklist_type: string | null;
  improvement_areas: string[];
  strengths: string[];
  monthly_activity: Array<{
    month: string;
    year: number;
    assessments_started: number;
    assessments_completed: number;
    assessments_submitted: number;
  }>;
  generated_at: string;
};

export async function getCustomerAssessmentAnalytics() {
  return apiGetWithAuth<CustomerAssessmentAnalyticsResponse>('/customer/assessments/analytics/performance');
}

export async function compareCustomerAssessments(assessmentIds: string[]) {
  const query = new URLSearchParams();
  assessmentIds.forEach((id) => query.append('assessment_ids', id));
  const qs = query.toString();
  return apiGetWithAuth<unknown>(`/customer/assessments/compare${qs ? `?${qs}` : ''}`);
}

export async function quickResumeCustomerAssessment(assessmentId: string) {
  return apiPost<CustomerAssessmentActionResponse, Record<string, never>>(
    `/customer/assessments/quick-action/resume/${encodeURIComponent(assessmentId)}`,
    {},
  );
}

export async function quickExtendCustomerAssessment(assessmentId: string) {
  return apiPost<CustomerAssessmentActionResponse, Record<string, never>>(
    `/customer/assessments/quick-action/extend/${encodeURIComponent(assessmentId)}`,
    {},
  );
}

export async function getCustomerAssessmentStatsSummary() {
  return apiGetWithAuth<Record<string, unknown>>('/customer/assessments/summary/stats');
}

