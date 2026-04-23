import { apiDelete, apiGetWithAuth, apiPatch, apiPost, apiPostFormData } from '@/lib/api';
import { mockReportSummary } from '@/lib/checklist-mocks';
import type { Checklist, ChecklistAnswerOption, ChecklistQuestion, ChecklistSection, ReportSummary } from '@/lib/checklist-types';

type ChecklistApiModel = {
  id: string;
  title: string;
  audit_type: 'compliance';
  law_decree: string;
  version: string | number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
};

export type CustomerChecklist = {
  id: string;
  title: string;
  checklist_type: {
    id: string;
    code: string;
    name: string;
    description: string;
  };
  version: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type SectionApiModel = {
  id: string;
  checklist_id: string;
  title: string;
  order: number;
};

type QuestionApiModel = {
  id: string;
  checklist_id: string;
  section_id: string;
  question_id: string;
  question_title?: string;
  parent_question_id?: string | null;
  illustrative_image_id?: string | null;
  security_level: 'low' | 'medium' | 'high';
  answer_logic?: 'answer_only' | 'answer_with_adjustment';
  audit_type: 'compliance';
  legal_requirement?: string;
  legal_requirement_title?: string;
  legal_requirement_description?: string;
  explanation: string;
  expected_implementation: string;
  how_it_works?: string;
  guidance_score_4?: string;
  guidance_score_3?: string;
  guidance_score_2?: string;
  guidance_score_1?: string;
  recommendation_template?: string;
  evidence_enabled?: boolean;
  answer_options?: Array<{
    position: number;
    label: string;
    score: number;
    choice_code: string;
    description: string;
    illustrative_image_id?: string | null;
  }>;
  points: number;
  customer_answer: string | null;
  customer_answer_status: 'not_started' | 'in_progress' | 'completed' | 'needs_review';
  note: string | null;
  evidence_rule: {
    allowed_mime_types: string[];
    max_file_size_bytes: number;
  };
  sub_questions?: QuestionApiModel[];
};

type QuestionAnswerOptionPayload = {
  position: number;
  label: string;
  score: number;
  choice_code: string;
  description: string;
  illustrative_image_id?: string;
};

function buildDefaultAnswerOptions(illustrativeImageId?: string): QuestionAnswerOptionPayload[] {
  return [
    {
      position: 1,
      label: 'Yes',
      score: 1,
      choice_code: 'YES',
      description: 'Control is fully implemented.',
      illustrative_image_id: illustrativeImageId,
    },
    {
      position: 2,
      label: 'Maybe',
      score: 1,
      choice_code: 'MAYBE',
      description: 'Control is partially implemented or uncertain.',
      illustrative_image_id: illustrativeImageId,
    },
    {
      position: 3,
      label: 'Sure',
      score: 1,
      choice_code: 'SURE',
      description: 'Control is confidently implemented.',
      illustrative_image_id: illustrativeImageId,
    },
    {
      position: 4,
      label: 'No',
      score: 1,
      choice_code: 'NO',
      description: 'Control is not implemented.',
      illustrative_image_id: illustrativeImageId,
    },
  ];
}

function mapAnswerOption(option: ChecklistAnswerOption): QuestionAnswerOptionPayload {
  return {
    position: option.position,
    label: option.label,
    score: option.score,
    choice_code: option.choiceCode,
    description: option.description,
    illustrative_image_id: option.illustrativeImageId ?? undefined,
  };
}

export type UploadedMedia = {
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  media_type: string;
  id: string;
  sha256: string;
  scan_status: string;
  encryption_status: string;
  created_at: string;
};

function mapChecklist(data: ChecklistApiModel): Checklist {
  return {
    id: data.id,
    title: data.title,
    auditType: data.audit_type,
    lawDecree: data.law_decree,
    version: String(data.version),
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapSection(data: SectionApiModel): ChecklistSection {
  return {
    id: data.id,
    checklistId: data.checklist_id,
    title: data.title,
    order: data.order,
  };
}

function mapQuestion(data: QuestionApiModel): ChecklistQuestion {
  return {
    id: data.id,
    checklistId: data.checklist_id,
    sectionId: data.section_id,
    questionId: data.question_id,
    questionTitle: data.question_title,
    parentQuestionId: data.parent_question_id ?? null,
    illustrativeImageId: data.illustrative_image_id ?? null,
    securityLevel: data.security_level,
    answerLogic: data.answer_logic,
    auditType: data.audit_type,
    legalRequirementTitle: data.legal_requirement_title,
    legalRequirementDescription: data.legal_requirement_description,
    legalRequirement: data.legal_requirement_description ?? data.legal_requirement_title ?? data.legal_requirement ?? '',
    explanation: data.explanation,
    expectedImplementation: data.expected_implementation,
    howItWorks: data.how_it_works,
    guidanceScore4: data.guidance_score_4,
    guidanceScore3: data.guidance_score_3,
    guidanceScore2: data.guidance_score_2,
    guidanceScore1: data.guidance_score_1,
    recommendationTemplate: data.recommendation_template,
    evidenceEnabled: data.evidence_enabled,
    points: data.points,
    customerAnswer: data.customer_answer,
    customerAnswerStatus: data.customer_answer_status,
    note: data.note,
    evidenceRule: {
      allowedMimeTypes: data.evidence_rule.allowed_mime_types,
      maxFileSizeBytes: data.evidence_rule.max_file_size_bytes,
    },
    answerOptions: (data.answer_options ?? []).map((option) => ({
      position: option.position,
      label: option.label,
      score: option.score,
      choiceCode: option.choice_code,
      description: option.description,
      illustrativeImageId: option.illustrative_image_id ?? null,
    })),
  };
}

function flattenQuestionTree(questions: QuestionApiModel[]): QuestionApiModel[] {
  const flattened: QuestionApiModel[] = [];
  const visit = (question: QuestionApiModel) => {
    flattened.push(question);
    (question.sub_questions ?? []).forEach(visit);
  };
  questions.forEach(visit);
  return flattened;
}

export async function uploadChecklistQuestionMedia(file: File): Promise<UploadedMedia> {
  const formData = new FormData();
  formData.append('file', file);
  return apiPostFormData<UploadedMedia>('/media/upload', formData);
}

export async function getAdminChecklists(): Promise<Checklist[]> {
  const data = await apiGetWithAuth<ChecklistApiModel[]>('/admin/checklists');
  return data.map(mapChecklist);
}

export async function getChecklistById(checklistId: string): Promise<Checklist> {
  const data = await apiGetWithAuth<ChecklistApiModel>(`/admin/checklists/${checklistId}`);
  return mapChecklist(data);
}

export async function createChecklist(payload: Partial<Checklist>): Promise<Checklist> {
  const data = await apiPost<
    ChecklistApiModel,
    {
      title: string;
      law_decree: string;
      checklist_type_code: 'compliance';
      status: 'draft' | 'published';
    }
  >(
    '/admin/checklists',
    {
      title: payload.title ?? '',
      law_decree: payload.lawDecree ?? '',
      checklist_type_code: 'compliance',
      status: payload.status ?? 'draft',
    },
  );
  return mapChecklist(data);
}

export async function updateChecklist(checklistId: string, payload: Partial<Checklist>): Promise<Checklist> {
  const data = await apiPatch<
    ChecklistApiModel,
    {
      title?: string;
      law_decree?: string;
      status?: 'draft' | 'published';
    }
  >(
    `/admin/checklists/${checklistId}`,
    {
      title: payload.title,
      law_decree: payload.lawDecree,
      status: payload.status,
    },
  );
  return mapChecklist(data);
}

export async function deleteChecklist(checklistId: string): Promise<{ message?: string }> {
  return apiDelete<{ message?: string }>(`/admin/checklists/${checklistId}`);
}

export async function publishChecklist(checklistId: string): Promise<Checklist> {
  const data = await apiPatch<ChecklistApiModel, { status: 'published' }>(`/admin/checklists/${checklistId}/publish`, {
    status: 'published',
  });
  return mapChecklist(data);
}

export async function getSectionsByChecklist(checklistId: string): Promise<ChecklistSection[]> {
  const data = await apiGetWithAuth<SectionApiModel[]>(`/admin/checklists/${checklistId}/sections`);
  return data.map(mapSection);
}

export async function getQuestionsBySection(checklistId: string, sectionId: string): Promise<ChecklistQuestion[]> {
  const data = await apiGetWithAuth<QuestionApiModel[]>(
    `/admin/checklists/${checklistId}/sections/${sectionId}/questions`,
  );
  return flattenQuestionTree(data).map(mapQuestion);
}

export async function createSection(checklistId: string, payload: Partial<ChecklistSection>): Promise<ChecklistSection> {
  const data = await apiPost<SectionApiModel, { title: string; order: number }>(
    `/admin/checklists/${checklistId}/sections`,
    { title: payload.title ?? '', order: payload.order ?? 1 },
  );
  return mapSection(data);
}

export async function updateSection(
  checklistId: string,
  sectionId: string,
  payload: Partial<ChecklistSection>,
): Promise<ChecklistSection> {
  const data = await apiPatch<SectionApiModel, { title?: string; order?: number }>(
    `/admin/checklists/${checklistId}/sections/${sectionId}`,
    { title: payload.title, order: payload.order },
  );
  return mapSection(data);
}

export async function deleteSection(checklistId: string, sectionId: string): Promise<{ message?: string }> {
  return apiDelete<{ message?: string }>(`/admin/checklists/${checklistId}/sections/${sectionId}`);
}

export async function reorderSections(
  checklistId: string,
  sectionOrders: Array<{ sectionId: string; order: number }>,
): Promise<ChecklistSection[]> {
  const uuidLike = /^(?:urn:uuid:)?[0-9a-fA-F-]{36}$/;
  const invalid = sectionOrders.find((item) => !uuidLike.test(item.sectionId));
  if (invalid) {
    throw new Error(`Invalid section UUID for reorder: ${invalid.sectionId}`);
  }

  const endpoints = [
    `/admin/checklists/${checklistId}/sections/reorder/`,
    `/admin/checklists/${checklistId}/sections/reorder`,
  ];
  const payload = {
    section_orders: sectionOrders.map((item) => ({
      section_id: item.sectionId,
      order: item.order,
    })),
  };

  let lastError: unknown = null;
  for (const endpoint of endpoints) {
    try {
      const data = await apiPatch<
        SectionApiModel[],
        {
          section_orders: Array<{ section_id: string; order: number }>;
        }
      >(endpoint, payload);
      return data.map(mapSection);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Failed to reorder sections');
}

export async function createQuestion(
  checklistId: string,
  sectionId: string,
  payload: Partial<ChecklistQuestion>,
): Promise<ChecklistQuestion> {
  const data = await apiPost<
    QuestionApiModel,
    {
      question_id: string;
      question_title: string;
      parent_question_id?: string;
      note?: string;
      security_level: 'low' | 'medium' | 'high';
      answer_logic: 'answer_only' | 'answer_with_adjustment';
      audit_type: 'compliance';
      legal_requirement_title: string;
      legal_requirement_description: string;
      explanation: string;
      expected_implementation: string;
      how_it_works: string;
      guidance_score_4: string;
      guidance_score_3: string;
      guidance_score_2: string;
      guidance_score_1: string;
      recommendation_template: string;
      evidence_enabled: boolean;
      illustrative_image_id?: string;
      answer_options: QuestionAnswerOptionPayload[];
      points?: number; // Optional: will be derived from security_level if not provided
    }
  >(`/admin/checklists/${checklistId}/sections/${sectionId}/questions`, {
    question_id: payload.questionId ?? '',
    question_title: payload.questionTitle ?? payload.questionId ?? '',
    parent_question_id: payload.parentQuestionId ?? undefined,
    note: payload.note ?? undefined,
    security_level: payload.securityLevel ?? 'low',
    answer_logic: payload.answerLogic ?? 'answer_only',
    audit_type: 'compliance',
    legal_requirement_title: payload.legalRequirementTitle ?? payload.legalRequirement ?? '',
    legal_requirement_description: payload.legalRequirementDescription ?? payload.legalRequirement ?? '',
    explanation: payload.explanation ?? '',
    expected_implementation: payload.expectedImplementation ?? '',
    how_it_works: payload.howItWorks ?? '',
    guidance_score_4: payload.guidanceScore4 ?? '',
    guidance_score_3: payload.guidanceScore3 ?? '',
    guidance_score_2: payload.guidanceScore2 ?? '',
    guidance_score_1: payload.guidanceScore1 ?? '',
    recommendation_template: payload.recommendationTemplate ?? '',
    evidence_enabled: payload.evidenceEnabled ?? false,
    illustrative_image_id: payload.illustrativeImageId ?? undefined,
    answer_options: payload.answerOptions?.length
      ? payload.answerOptions.map(mapAnswerOption)
      : buildDefaultAnswerOptions(payload.illustrativeImageId ?? undefined),
    points: payload.points, // Optional
  });
  return mapQuestion(data);
}

export async function getQuestionById(
  checklistId: string,
  sectionId: string,
  questionId: string,
): Promise<ChecklistQuestion> {
  const data = await apiGetWithAuth<QuestionApiModel>(
    `/admin/checklists/${checklistId}/sections/${sectionId}/questions/${questionId}`,
  );
  return mapQuestion(data);
}

export async function updateQuestion(
  checklistId: string,
  sectionId: string,
  questionId: string,
  payload: Partial<ChecklistQuestion>,
): Promise<ChecklistQuestion> {
  const data = await apiPatch<
    QuestionApiModel,
    {
      question_id?: string;
      question_title?: string;
      parent_question_id?: string;
      note?: string;
      security_level?: 'low' | 'medium' | 'high';
      answer_logic?: 'answer_only' | 'answer_with_adjustment';
      audit_type?: 'compliance';
      legal_requirement_title?: string;
      legal_requirement_description?: string;
      explanation?: string;
      expected_implementation?: string;
      how_it_works?: string;
      guidance_score_4?: string;
      guidance_score_3?: string;
      guidance_score_2?: string;
      guidance_score_1?: string;
      recommendation_template?: string;
      evidence_enabled?: boolean;
      illustrative_image_id?: string;
      answer_options?: QuestionAnswerOptionPayload[];
      points?: number;
      order?: number;
    }
  >(`/admin/checklists/${checklistId}/sections/${sectionId}/questions/${questionId}`, {
    question_id: payload.questionId,
    question_title: payload.questionTitle ?? payload.questionId,
    parent_question_id: payload.parentQuestionId ?? undefined,
    note: payload.note ?? undefined,
    security_level: payload.securityLevel,
    answer_logic: payload.answerLogic ?? 'answer_only',
    audit_type: 'compliance',
    legal_requirement_title: payload.legalRequirementTitle ?? payload.legalRequirement,
    legal_requirement_description: payload.legalRequirementDescription ?? payload.legalRequirement,
    explanation: payload.explanation,
    expected_implementation: payload.expectedImplementation,
    how_it_works: payload.howItWorks,
    guidance_score_4: payload.guidanceScore4 ?? '',
    guidance_score_3: payload.guidanceScore3 ?? '',
    guidance_score_2: payload.guidanceScore2 ?? '',
    guidance_score_1: payload.guidanceScore1 ?? '',
    recommendation_template: payload.recommendationTemplate ?? '',
    evidence_enabled: payload.evidenceEnabled ?? false,
    illustrative_image_id: payload.illustrativeImageId ?? undefined,
    answer_options: payload.answerOptions?.length
      ? payload.answerOptions.map(mapAnswerOption)
      : buildDefaultAnswerOptions(payload.illustrativeImageId ?? undefined),
    points: payload.points,
  });
  return mapQuestion(data);
}

export async function deleteQuestion(
  checklistId: string,
  sectionId: string,
  questionId: string,
): Promise<{ message?: string }> {
  return apiDelete<{ message?: string }>(`/admin/checklists/${checklistId}/sections/${sectionId}/questions/${questionId}`);
}

export async function getReportSummary(_assessmentId?: string): Promise<ReportSummary> {
  return mockReportSummary;
}

export async function listPublishedCustomerChecklists() {
  return apiGetWithAuth<CustomerChecklist[]>('/checklists/');
}

export type ChecklistAccessGrant = {
  id: string;
  user_id: string;
  payment_id: string;
  checklist_id: string;
  activated_at: string;
  expires_at: string;
  created_at: string;
};

export async function selectChecklistAfterPayment(checklistId: string) {
  const query = new URLSearchParams();
  query.set('checklist_id', checklistId);
  return apiPost<ChecklistAccessGrant, Record<string, never>>(`/access/select-checklist?${query.toString()}`, {});
}
