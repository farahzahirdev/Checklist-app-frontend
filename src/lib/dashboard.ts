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
