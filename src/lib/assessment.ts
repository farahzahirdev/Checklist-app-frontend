import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';
import { apiGetWithAuth, apiPost, apiPut, getApiBaseUrl } from '@/lib/api';

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

export type AssessmentDetailAnswer = {
  answer?: string | null;
  note_text?: string | null;
};

export type AssessmentDetailAnswerOption = {
  position?: number;
  label?: string;
  score?: number;
  choice_code?: string;
  description?: string;
  illustrative_image_id?: string | null;
};

export type AssessmentDetailQuestion = {
  id: string;
  question_id?: string;
  question_title?: string | null;
  questions_title?: string | null;
  security_level?: 'low' | 'medium' | 'high' | string;
  audit_type?: string;
  legal_requirement_title?: string | null;
  legal_requirement_description?: string | null;
  legal_requirement?: string;
  explanation?: string;
  how_it_works?: string | null;
  expected_implementation?: string;
  illustrative_image_id?: string | null;
  answer_options?: AssessmentDetailAnswerOption[];
  current_answer?: AssessmentDetailAnswer | null;
  admin_note?: string | null;
  user_note?: string | null;
  note_enabled?: boolean;
  evidence_enabled?: boolean;
  evidence_rule?: {
    allowed_mime_types?: string[];
    max_file_size_bytes?: number;
  } | null;
  sub_questions?: AssessmentDetailQuestion[];
};

export type AssessmentDetailSection = {
  id: string;
  title: string;
  order: number;
  questions: AssessmentDetailQuestion[];
};

export type AssessmentCurrentDetailResponse = AssessmentSessionResponse & {
  checklist_title: string;
  sections: AssessmentDetailSection[];
};

export async function getCurrentAssessmentDetail(checklistId?: string) {
  const suffix = checklistId ? `?checklist_id=${encodeURIComponent(checklistId)}` : '';
  return apiGetWithAuth<AssessmentCurrentDetailResponse>(`/assessment/current/detail${suffix}`);
}

export async function getMediaPreviewUrl(mediaId: string) {
  return apiGetWithAuth<string>(`/media/${encodeURIComponent(mediaId)}/preview`);
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

export async function uploadAssessmentEvidence(assessmentId: string, questionId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const token = typeof window !== 'undefined' ? window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) : null;
  const response = await fetch(
    `${getApiBaseUrl()}/assessment/${assessmentId}/evidence?question_id=${encodeURIComponent(questionId)}`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    },
  );
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(raw || `Request failed with status ${response.status}`);
  }
  return raw ? (JSON.parse(raw) as string) : '';
}
