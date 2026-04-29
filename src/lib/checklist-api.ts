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
  warning?: string | null;
  pricing?: {
    price_id: string;
    amount_cents: number | string;
    currency: string;
  } | null;
  stripe_info?: {
    product_id?: string | null;
    price_id?: string | null;
    price_amount_cents?: number | string | null;
    price_currency?: string | null;
    price_available: boolean;
    price_status: string;
  } | null;
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
  warning?: string | null;
  pricing?: {
    price_id: string;
    amount_cents: number;
    currency: string;
  } | null;
};

type SectionApiModel = {
  id: string;
  checklist_id: string;
  title: string;
  order: number;
  source_ref?: string | null;
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
  audit_type: string;
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
  note_enabled?: boolean;
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

type SortOrder = 'asc' | 'desc';

type AdminChecklistSortBy = 'created_at' | 'updated_at' | 'version' | 'status';
type SectionSortBy = 'display_order' | 'section_code' | 'title';
type QuestionSortBy = 'display_order' | 'question_id' | 'severity';
type PublicChecklistSortBy = 'created_at' | 'updated_at' | 'version' | 'status';

type ListQueryOptions<TSortBy extends string> = {
  skip?: number;
  limit?: number;
  sortBy?: TSortBy;
  sortOrder?: SortOrder;
  search?: string;
};

export type BulkImportColumnMapping = {
  section_name_col: string;
  question_id_col: string;
  child_question_col: string;
  grandchild_question_col: string;
  legal_requirement_col: string;
  question_text_col: string;
  severity_col: string;
  explanation_col: string;
  expected_implementation_col: string;
  source_ref_col: string;
  guidance_score_4_col: string;
  guidance_score_3_col: string;
  guidance_score_2_col: string;
  guidance_score_1_col: string;
};

export type BulkImportTemplateSpec = {
  description: string;
  required_columns: string[];
  optional_columns: string[];
  column_mapping_template: BulkImportColumnMapping;
  example_format: Record<string, unknown>;
};

export type BulkImportPreviewRow = {
  row_number: number;
  section_name: string;
  parent_question_id: string;
  parent_question_text: string;
  child_question_id: string;
  child_question_text: string;
  grandchild_question_id: string;
  grandchild_question_text: string;
  legal_requirement: string;
  severity: 'low' | 'medium' | 'high' | string;
  explanation: string;
  expected_implementation: string;
  is_valid: boolean;
  errors: string[];
};

export type BulkImportVerifyResponse = {
  is_valid: boolean;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  preview_rows: BulkImportPreviewRow[];
  column_headers: string[];
  warnings: string[];
};

export type BulkImportCreateResponse = {
  task_id: string;
  status: string;
  detail: string;
};

export type BulkImportTaskResult = {
  checklist_id: string;
  checklist_title: string;
  sections_created: number;
  questions_created: number;
  sub_questions_created: number;
  total_rows_processed: number;
  warnings: string[];
  status: string;
  message: string;
};

export type BulkImportTaskStatus = {
  task_id: string;
  celery_state: string;
  status: string;
  detail: string;
  result?: BulkImportTaskResult | null;
  error?: string | null;
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
  const toNullableNumber = (value: number | string | null | undefined): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  return {
    id: data.id,
    title: data.title,
    auditType: data.audit_type,
    lawDecree: data.law_decree,
    version: String(data.version),
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    warning: data.warning ?? null,
    pricing: data.pricing
      ? {
          priceId: data.pricing.price_id,
          amountCents: toNullableNumber(data.pricing.amount_cents) ?? 0,
          currency: data.pricing.currency,
        }
      : null,
    stripeInfo: data.stripe_info
      ? {
          productId: data.stripe_info.product_id ?? null,
          priceId: data.stripe_info.price_id ?? null,
          priceAmountCents: toNullableNumber(data.stripe_info.price_amount_cents),
          priceCurrency: data.stripe_info.price_currency ?? null,
          priceAvailable: data.stripe_info.price_available,
          priceStatus: data.stripe_info.price_status,
        }
      : null,
  };
}

function mapSection(data: SectionApiModel): ChecklistSection {
  return {
    id: data.id,
    checklistId: data.checklist_id,
    title: data.title,
    order: data.order,
    sourceRef: data.source_ref ?? '',
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
    noteEnabled: data.note_enabled,
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

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const maybe = value as {
      items?: unknown;
      data?: unknown;
      results?: unknown;
      checklists?: unknown;
      sections?: unknown;
      questions?: unknown;
      users?: unknown;
      customers?: unknown;
    };
    if (Array.isArray(maybe.items)) return maybe.items as T[];
    if (Array.isArray(maybe.data)) return maybe.data as T[];
    if (Array.isArray(maybe.results)) return maybe.results as T[];
    if (Array.isArray(maybe.checklists)) return maybe.checklists as T[];
    if (Array.isArray(maybe.sections)) return maybe.sections as T[];
    if (Array.isArray(maybe.questions)) return maybe.questions as T[];
    if (Array.isArray(maybe.users)) return maybe.users as T[];
    if (Array.isArray(maybe.customers)) return maybe.customers as T[];
  }
  return [];
}

function withListQuery<TSortBy extends string>(path: string, options?: ListQueryOptions<TSortBy>): string {
  if (!options) return path;

  const params = new URLSearchParams();
  if (typeof options.skip === 'number') params.set('skip', String(options.skip));
  if (typeof options.limit === 'number') params.set('limit', String(options.limit));
  if (options.sortBy) params.set('sort_by', options.sortBy);
  if (options.sortOrder) params.set('sort_order', options.sortOrder);
  if (options.search) params.set('search', options.search);

  const query = params.toString();
  if (!query) return path;
  return `${path}${path.includes('?') ? '&' : '?'}${query}`;
}

export async function uploadChecklistQuestionMedia(file: File): Promise<UploadedMedia> {
  const formData = new FormData();
  formData.append('file', file);
  return apiPostFormData<UploadedMedia>('/media/upload', formData);
}

export async function getAdminChecklists(options?: ListQueryOptions<AdminChecklistSortBy>): Promise<Checklist[]> {
  const data = await apiGetWithAuth<ChecklistApiModel[] | { items?: ChecklistApiModel[]; data?: ChecklistApiModel[]; results?: ChecklistApiModel[] }>(
    withListQuery('/admin/checklists', options),
  );
  return asArray<ChecklistApiModel>(data).map(mapChecklist);
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

export async function getSectionsByChecklist(
  checklistId: string,
  options?: ListQueryOptions<SectionSortBy>,
): Promise<ChecklistSection[]> {
  const data = await apiGetWithAuth<SectionApiModel[] | { items?: SectionApiModel[]; data?: SectionApiModel[]; results?: SectionApiModel[] }>(
    withListQuery(`/admin/checklists/${checklistId}/sections`, options),
  );
  return asArray<SectionApiModel>(data).map(mapSection);
}

export async function getQuestionsBySection(
  checklistId: string,
  sectionId: string,
  options?: ListQueryOptions<QuestionSortBy>,
): Promise<ChecklistQuestion[]> {
  const data = await apiGetWithAuth<QuestionApiModel[] | { items?: QuestionApiModel[]; data?: QuestionApiModel[]; results?: QuestionApiModel[] }>(
    withListQuery(`/admin/checklists/${checklistId}/sections/${sectionId}/questions`, options),
  );
  return flattenQuestionTree(asArray<QuestionApiModel>(data)).map(mapQuestion);
}

export async function createSection(checklistId: string, payload: Partial<ChecklistSection>): Promise<ChecklistSection> {
  const data = await apiPost<SectionApiModel, { title: string; order: number; source_ref?: string }>(
    `/admin/checklists/${checklistId}/sections`,
    { title: payload.title ?? '', order: payload.order ?? 1, source_ref: payload.sourceRef?.trim() || undefined },
  );
  return mapSection(data);
}

export async function updateSection(
  checklistId: string,
  sectionId: string,
  payload: Partial<ChecklistSection>,
): Promise<ChecklistSection> {
  const data = await apiPatch<SectionApiModel, { title?: string; order?: number; source_ref?: string }>(
    `/admin/checklists/${checklistId}/sections/${sectionId}`,
    { title: payload.title, order: payload.order, source_ref: payload.sourceRef?.trim() || undefined },
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
        SectionApiModel[] | { items?: SectionApiModel[]; data?: SectionApiModel[]; results?: SectionApiModel[] },
        {
          section_orders: Array<{ section_id: string; order: number }>;
        }
      >(endpoint, payload);
      return asArray<SectionApiModel>(data).map(mapSection);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Failed to reorder sections');
}

export async function reorderQuestions(
  checklistId: string,
  sectionId: string,
  questionOrders: Array<{ questionId: string; order: number }>,
): Promise<ChecklistQuestion[]> {
  const uuidLike = /^(?:urn:uuid:)?[0-9a-fA-F-]{36}$/;
  const invalid = questionOrders.find((item) => !uuidLike.test(item.questionId));
  if (invalid) {
    throw new Error(`Invalid question UUID for reorder: ${invalid.questionId}`);
  }

  const endpoints = [
    `/admin/checklists/${checklistId}/sections/${sectionId}/questions/reorder/`,
    `/admin/checklists/${checklistId}/sections/${sectionId}/questions/reorder`,
  ];
  const payload = {
    question_orders: questionOrders.map((item) => ({
      question_id: item.questionId,
      order: item.order,
    })),
  };

  let lastError: unknown = null;
  for (const endpoint of endpoints) {
    try {
      const data = await apiPatch<
        QuestionApiModel[] | { items?: QuestionApiModel[]; data?: QuestionApiModel[]; results?: QuestionApiModel[]; questions?: QuestionApiModel[] },
        {
          question_orders: Array<{ question_id: string; order: number }>;
        }
      >(endpoint, payload);
      return flattenQuestionTree(asArray<QuestionApiModel>(data)).map(mapQuestion);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Failed to reorder questions');
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
      audit_type: string;
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
      note_enabled: boolean;
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
    audit_type: payload.auditType?.trim() || 'compliance',
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
    note_enabled: payload.noteEnabled ?? false,
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
      audit_type?: string;
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
      note_enabled?: boolean;
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
    audit_type: payload.auditType?.trim() || 'compliance',
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
    note_enabled: payload.noteEnabled ?? false,
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

export async function listPublishedCustomerChecklists(options?: ListQueryOptions<PublicChecklistSortBy>) {
  const data = await apiGetWithAuth<
    CustomerChecklist[] | { items?: CustomerChecklist[]; data?: CustomerChecklist[]; results?: CustomerChecklist[]; checklists?: CustomerChecklist[] }
  >(withListQuery('/checklists/', options));
  return asArray<CustomerChecklist>(data);
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

export async function getChecklistBulkTemplateMapping(): Promise<BulkImportTemplateSpec> {
  return apiGetWithAuth<BulkImportTemplateSpec>('/admin/checklists/bulk/template/mapping');
}

export async function verifyChecklistBulkImport(payload: {
  file_content: string;
  file_name: string;
  column_mapping: BulkImportColumnMapping;
  preview_rows?: number;
}): Promise<BulkImportVerifyResponse> {
  return apiPost<BulkImportVerifyResponse, typeof payload>('/admin/checklists/bulk/verify', {
    ...payload,
    preview_rows: payload.preview_rows ?? 10,
  });
}

export async function createChecklistBulkImport(payload: {
  file_content: string;
  file_name: string;
  column_mapping: BulkImportColumnMapping;
  checklist_title: string;
  checklist_description?: string;
  checklist_type_code?: 'compliance';
  checklist_version?: number;
}): Promise<BulkImportCreateResponse> {
  return apiPost<BulkImportCreateResponse, typeof payload>('/admin/checklists/bulk/create', {
    ...payload,
    checklist_type_code: payload.checklist_type_code ?? 'compliance',
    checklist_version: payload.checklist_version ?? 1,
  });
}

export async function getChecklistBulkImportTaskStatus(taskId: string): Promise<BulkImportTaskStatus> {
  return apiGetWithAuth<BulkImportTaskStatus>(`/admin/checklists/bulk/tasks/${taskId}`);
}

export async function uploadAndVerifyChecklistBulkImport(payload: {
  file: File;
  section_col?: string;
  question_id_col?: string;
  child_question_col?: string;
  grandchild_question_col?: string;
  legal_req_col?: string;
  question_text_col?: string;
  severity_col?: string;
}): Promise<BulkImportVerifyResponse> {
  const query = new URLSearchParams();
  query.set('section_col', payload.section_col ?? 'B');
  query.set('question_id_col', payload.question_id_col ?? 'C');
  query.set('child_question_col', payload.child_question_col ?? 'D');
  query.set('grandchild_question_col', payload.grandchild_question_col ?? 'E');
  query.set('legal_req_col', payload.legal_req_col ?? 'F');
  query.set('question_text_col', payload.question_text_col ?? 'H');
  query.set('severity_col', payload.severity_col ?? 'I');
  const formData = new FormData();
  formData.append('file', payload.file);
  return apiPostFormData<BulkImportVerifyResponse>(`/admin/checklists/bulk/upload-and-verify?${query.toString()}`, formData);
}
