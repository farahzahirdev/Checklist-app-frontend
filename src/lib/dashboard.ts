import { apiGetWithAuth } from '@/lib/api';

export type AdminDashboardSummary = {
  users_total: number;
  customers_total: number;
  checklists_published: number;
  assessments_submitted: number;
  reports_published: number;
  payments_succeeded: number;
  total_assessments: number;
  pending_review: number;
  expired_assessments: number;
  generated_at: string;
};

export type AdminAwaitingReviewItem = {
  assessment_id: string;
  customer_email: string;
  checklist_id: string;
  checklist_label: string;
  submitted_at: string;
  report_id: string;
  report_status: string;
};

export type AdminActivityItem = {
  occurred_at: string;
  source: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor_user_id: string;
  note: string;
};

export type AdminDistribution = {
  ready_to_start: number;
  in_progress: number;
  waiting_for_review: number;
  published: number;
  expired: number;
  generated_at: string;
};

export type AdminRetentionItem = {
  entity_type: string;
  entity_id: string;
  reason: string;
  eligible_at: string;
};

export type AdminRetention = {
  pending_purge_count: number;
  recent_purged_count: number;
  items: AdminRetentionItem[];
  generated_at: string;
};

export type AdminSystemHealth = {
  payments_status: string;
  storage_status: string;
  reports_status: string;
  generated_at: string;
};

export type AuditorDashboardSummary = {
  reports_under_review: number;
  reports_changes_requested: number;
  draft_reports_waiting: number;
  findings_total: number;
  generated_at: string;
};

export type CustomerDashboardSummary = {
  paid_checklists_count: number;
  active_assessments_count: number;
  submitted_assessments_count: number;
  latest_report_status: string;
  generated_at: string;
};

export type CustomerDashboardEnhanced = {
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
  active_assessments: Array<{
    id: string;
    checklist_id: string;
    checklist_title: string;
    checklist_type_code: string;
    checklist_version: string;
    status: string;
    completion_percent: number;
    started_at: string | null;
    submitted_at: string | null;
    expires_at: string | null;
    days_until_expiry: number | null;
    has_report: boolean;
    report_status: string | null;
    last_activity: string | null;
  }>;
  recent_submissions: CustomerDashboardEnhanced['active_assessments'];
  expiring_soon: CustomerDashboardEnhanced['active_assessments'];
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

type DashboardAuth = {
  token?: string | null;
};

export async function getAdminDashboardSummary(auth?: DashboardAuth) {
  return apiGetWithAuth<AdminDashboardSummary>('/dashboard/admin', auth);
}

export async function getAdminAwaitingReview(auth?: DashboardAuth) {
  return apiGetWithAuth<AdminAwaitingReviewItem[]>('/dashboard/admin/awaiting-review', auth);
}

export async function getAdminActivity(auth?: DashboardAuth) {
  return apiGetWithAuth<AdminActivityItem[]>('/dashboard/admin/activity', auth);
}

export async function getAdminDistribution(auth?: DashboardAuth) {
  return apiGetWithAuth<AdminDistribution>('/dashboard/admin/distribution', auth);
}

export async function getAdminRetention(auth?: DashboardAuth) {
  return apiGetWithAuth<AdminRetention>('/dashboard/admin/retention', auth);
}

export async function getAdminSystemHealth(auth?: DashboardAuth) {
  return apiGetWithAuth<AdminSystemHealth>('/dashboard/admin/system-health', auth);
}

export async function getAuditorDashboardSummary(auth?: DashboardAuth) {
  return apiGetWithAuth<AuditorDashboardSummary>('/dashboard/auditor', auth);
}

export async function getCustomerDashboardSummary(auth?: DashboardAuth) {
  return apiGetWithAuth<CustomerDashboardSummary>('/dashboard/customer', auth);
}

export async function getCustomerDashboardEnhanced(auth?: DashboardAuth) {
  return apiGetWithAuth<CustomerDashboardEnhanced>('/dashboard/customer/enhanced', auth);
}
