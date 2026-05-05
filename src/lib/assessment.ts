import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';
import { apiGetWithAuth, apiPatch, apiPost, apiPut, getApiBaseUrl } from '@/lib/api';

export type AssessmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'closed' | 'expired';

export type AssessmentSessionResponse = {
  assessment_id: string;
  checklist_id: string;
  user_id: string;
  access_window_id: string;
  company_id?: string | null;
  status: AssessmentStatus;
  started_at: string;
  expires_at: string;
  completion_percent: number;
  is_new: boolean;
};

export async function startAssessment(payload: { checklist_id: string; company_id?: string }) {
  return apiPost<AssessmentSessionResponse, { checklist_id: string; company_id?: string }>('/assessment/start', payload);
}

export async function getCurrentAssessment(checklistId?: string, companyId?: string) {
  const query = new URLSearchParams();
  if (checklistId) query.set('checklist_id', checklistId);
  if (companyId) query.set('company_id', companyId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
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
  checklist_id: string;
  section_id: string;
  parent_question_id?: string | null;
  question_id: string;
  question_title?: string | null;
  security_level: string;
  audit_type?: string;
  answer_logic?: string;
  legal_requirement: string;
  explanation: string;
  expected_implementation: string;
  how_it_works?: string | null;
  points: number;
  report_domain?: string | null;
  report_chapter?: string | null;
  illustrative_image_id?: string | null;
  note_enabled?: boolean;
  evidence_enabled?: boolean;
  customer_answer?: string | null;
  customer_answer_status?: string;
  admin_note?: string | null;
  user_note?: string | null;
  evidence_rule?: {
    allowed_mime_types?: string[];
    max_file_size_bytes?: number;
  } | null;
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
  answer_options?: AssessmentDetailAnswerOption[];
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

export async function getCurrentAssessmentDetail(checklistId?: string, companyId?: string) {
  const query = new URLSearchParams();
  if (checklistId) query.set('checklist_id', checklistId);
  if (companyId) query.set('company_id', companyId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiGetWithAuth<AssessmentCurrentDetailResponse>(`/assessment/current/detail${suffix}`);
}

export async function getMediaPreviewUrl(mediaId: string) {
  const response = await apiGetWithAuth<{preview_url: string}>(`/media/${encodeURIComponent(mediaId)}/preview`);
  return response.preview_url;
}

export type AssessmentAnswerResponse = {
  assessment_id: string;
  question_id: string;
  answer: string;
  answer_score: number;
  weighted_priority: 'low' | 'medium' | 'high';
  completion_percent: number;
  note_text?: string | null;
};

export async function getAssessmentAnswers(assessmentId: string) {
  return apiGetWithAuth<AssessmentAnswerResponse[]>(`/assessment/${assessmentId}/answers`);
}

export async function createAssessmentAnswer(
  assessmentId: string,
  payload: { question_id: string; answer: string; note_text?: string },
) {
  return apiPost<AssessmentAnswerResponse, typeof payload>(`/assessment/${assessmentId}/answers`, payload);
}

export async function updateAssessmentAnswer(
  assessmentId: string,
  payload: { question_id: string; answer: string; note_text?: string },
) {
  try {
    return await apiPatch<AssessmentAnswerResponse, typeof payload>(`/assessment/${assessmentId}/answers`, payload);
  } catch {
    return apiPut<AssessmentAnswerResponse, typeof payload>(`/assessment/${assessmentId}/answers`, payload);
  }
}

export async function saveAssessmentAnswer(
  assessmentId: string,
  payload: { question_id: string; answer: string; note_text?: string },
) {
  try {
    // New API behavior supports POST create/update (upsert-like) for answers.
    return await createAssessmentAnswer(assessmentId, payload);
  } catch {
    // Backward compatibility: fallback to PATCH/PUT update endpoint style.
    return updateAssessmentAnswer(assessmentId, payload);
  }
}

export async function saveAssessmentAnswersBulk(
  assessmentId: string,
  payload: Array<{ question_id: string; answer: string; note_text?: string }>,
) {
  return apiPost<AssessmentAnswerResponse[], typeof payload>(`/assessment/${assessmentId}/answers/bulk`, payload);
}

export type AssessmentSubmitResponse = {
  assessment_id: string;
  status: AssessmentStatus;
  submitted_at: string;
  completion_percent: number;
};

export async function submitAssessment(assessmentId: string, companyId?: string) {
  const query = new URLSearchParams();
  if (companyId) query.set('company_id', companyId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiPost<AssessmentSubmitResponse, Record<string, never>>(`/assessment/${assessmentId}/submit${suffix}`, {});
}

export async function uploadAssessmentEvidence(assessmentId: string, questionId: string, file: File): Promise<any> {
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
  return raw ? JSON.parse(raw) : null;
}
