import { apiGetWithAuth, apiPost } from '@/lib/api';

export type AssessmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'closed' | 'expired';

export type AssessmentSessionResponse = {
  assessment_id: string;
  checklist_id: string;
  user_id: string;
  access_window_id: string;
  status: AssessmentStatus;
  started_at: string;
  expires_at: string;
  completion_percent: number;
  is_new: boolean;
};

export async function startAssessment(payload: { checklist_id: string }) {
  return apiPost<AssessmentSessionResponse, { checklist_id: string }>('/assessment/start', payload);
}

export async function getCurrentAssessment(checklistId?: string) {
  const suffix = checklistId ? `?checklist_id=${encodeURIComponent(checklistId)}` : '';
  return apiGetWithAuth<AssessmentSessionResponse>(`/assessment/current${suffix}`);
}
