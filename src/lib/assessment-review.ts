import { apiDelete, apiGetWithAuth, apiPost, apiPut } from '@/lib/api';

export type AssessmentReviewStatus =
  | 'pending_review'
  | 'in_progress'
  | 'completed'
  | 'changes_requested'
  | 'approved'
  | string;

export type AssessmentReviewItem = {
  id: string;
  assessment_id: string;
  reviewer_id: string | null;
  status: AssessmentReviewStatus;
  overall_score: number | null;
  max_score: number | null;
  completion_percentage: number | null;
  summary_notes: string | null;
  strengths: string | null;
  improvement_areas: string | null;
  recommendations: string | null;
  reviewed_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  customer_email: string | null;
  customer_name: string | null;
  checklist_title: string | null;
  checklist_version: string | null;
  assessment_status: string | null;
  answer_reviews_count: number;
  action_required_count: number;
};

export type AssessmentReviewSummary = {
  total_assessments_pending_review: number;
  total_assessments_in_progress: number;
  total_assessments_completed: number;
  total_answer_reviews: number;
  total_action_required: number;
  average_review_time_hours: number;
  recent_reviews: AssessmentReviewItem[];
};

export type AssessmentAnswerReview = {
  id: string;
  assessment_review_id: string;
  answer_id: string;
  reviewer_id: string;
  suggestion_type: string | null;
  suggestion_text: string | null;
  reference_materials: string | null;
  is_action_required: boolean;
  priority_level: number;
  score_adjustment: number;
  created_at: string;
  updated_at: string;
  question_text: string | null;
  question_code: string | null;
  customer_answer: string | null;
  customer_score: number | null;
  section_name: string | null;
};

export type AssessmentAnswerForReview = {
  answer_id: string;
  question_id: string;
  question_code: string | null;
  question_text: string | null;
  section_code: string | null;
  section_name: string | null;
  customer_answer: string | null;
  customer_score: number | null;
  weighted_priority: string | null;
  note_text: string | null;
  answered_at: string | null;
  review: AssessmentAnswerReview | null;
  has_review: boolean;
  is_action_required: boolean;
  review_priority: number | null;
};

export type AssessmentAnswersReviewDetail = {
  assessment_id: string;
  customer_email: string | null;
  customer_name: string | null;
  checklist_title: string | null;
  checklist_version: string | null;
  assessment_status: string | null;
  submitted_at: string | null;
  answers: AssessmentAnswerForReview[];
  total_answers: number;
  reviewed_answers: number;
  action_required_answers: number;
  average_score: number;
  completion_percentage: number;
  generated_at: string;
};

export type AssessmentReviewPayload = {
  status?: string;
  overall_score?: number;
  max_score?: number;
  completion_percentage?: number;
  summary_notes?: string;
  strengths?: string;
  improvement_areas?: string;
  recommendations?: string;
};

export type AnswerSuggestionType =
  | 'improvement'
  | 'required_change'
  | 'best_practice'
  | 'reference'
  | 'clarification';

export type AnswerReviewPayload = {
  suggestion_type: AnswerSuggestionType | string;
  suggestion_text: string;
  reference_materials?: string;
  is_action_required: boolean;
  priority_level: number;
  score_adjustment: number;
};

export type BulkAnswerReviewPayload = AnswerReviewPayload & {
  answer_id?: string;
};

export type BulkAnswerReviewResponse = {
  success_count: number;
  failure_count: number;
  results: Array<{
    answer_id: string;
    success: boolean;
    message: string;
    review_id?: string;
  }>;
  assessment_review_id?: string;
};

export type AssessmentReviewHistoryEntry = {
  id: string;
  action_type: string;
  description: string | null;
  previous_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
  reviewer_id: string | null;
  reviewer_name: string | null;
  reviewer_email: string | null;
};

export function getAssessmentReviewSummary() {
  return apiGetWithAuth<AssessmentReviewSummary>('/admin/assessment-review/summary');
}

export function getAssessmentReviews(params?: { status?: string; skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiGetWithAuth<AssessmentReviewItem[]>(`/admin/assessment-review/assessments${qs ? `?${qs}` : ''}`);
}

export function getAssessmentAnswersForReview(assessmentId: string) {
  return apiGetWithAuth<AssessmentAnswersReviewDetail>(`/admin/assessment-review/assessment/${assessmentId}`);
}

export function createOrUpdateAssessmentReview(assessmentId: string, payload: AssessmentReviewPayload) {
  return apiPost<AssessmentReviewItem, AssessmentReviewPayload>(`/admin/assessment-review/assessment/${assessmentId}/review`, payload);
}

export function createAnswerReview(answerId: string, payload: AnswerReviewPayload) {
  return apiPost<AssessmentAnswerReview, AnswerReviewPayload>(`/admin/assessment-review/answer/${answerId}/review`, payload);
}

export function updateAnswerReview(reviewId: string, payload: AnswerReviewPayload) {
  return apiPut<AssessmentAnswerReview, AnswerReviewPayload>(`/admin/assessment-review/answer-review/${reviewId}`, payload);
}

export function deleteAnswerReview(reviewId: string) {
  return apiDelete<Record<string, unknown>>(`/admin/assessment-review/answer-review/${reviewId}`);
}

export function quickApproveAssessment(assessmentId: string) {
  return apiPost<AssessmentReviewItem, Record<string, never>>(`/admin/assessment-review/assessment/${assessmentId}/quick-approve`, {});
}

export function requestAssessmentChanges(assessmentId: string, payload: Record<string, unknown>) {
  return apiPost<AssessmentReviewItem, Record<string, unknown>>(`/admin/assessment-review/assessment/${assessmentId}/request-changes`, payload);
}

export function createBulkAnswerReviews(
  assessmentId: string,
  payload: { answer_reviews: BulkAnswerReviewPayload[]; assessment_notes?: string },
) {
  return apiPost<BulkAnswerReviewResponse, typeof payload>(`/admin/assessment-review/assessment/${assessmentId}/bulk-reviews`, payload);
}

export function getAssessmentReviewStatus(assessmentId: string) {
  return apiGetWithAuth<Record<string, unknown>>(`/admin/assessment-review/assessment/${assessmentId}/status`);
}

export function getMyAssessmentReviews(params?: { skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiGetWithAuth<AssessmentReviewItem[]>(`/admin/assessment-review/my-reviews${qs ? `?${qs}` : ''}`);
}

export function getAnswerReviewHistory(reviewId: string) {
  return apiGetWithAuth<AssessmentReviewHistoryEntry[]>(`/admin/assessment-review/answer-review/${reviewId}/history`);
}
