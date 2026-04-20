import { apiGetWithAuth, apiPost, apiPut } from '@/lib/api';

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

export type AssessmentAnswerResponse = {
  assessment_id: string;
  question_id: string;
  answer: string;
  answer_score: number;
  weighted_priority: 'low' | 'medium' | 'high';
  completion_percent: number;
};

export async function saveAssessmentAnswer(
  assessmentId: string,
  payload: { question_id: string; answer: string; note_text?: string },
) {
  return apiPut<AssessmentAnswerResponse, typeof payload>(`/assessment/${assessmentId}/answers`, payload);
}

export type AssessmentSubmitResponse = {
  assessment_id: string;
  status: AssessmentStatus;
  submitted_at: string;
  completion_percent: number;
};

export async function submitAssessment(assessmentId: string) {
  return apiPost<AssessmentSubmitResponse, Record<string, never>>(`/assessment/${assessmentId}/submit`, {});
}
