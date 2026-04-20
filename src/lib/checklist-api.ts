import { apiDelete, apiGetWithAuth, apiPatch, apiPost } from '@/lib/api';
import { mockReportSummary } from '@/lib/checklist-mocks';
import type { Checklist, ChecklistQuestion, ChecklistSection, ReportSummary } from '@/lib/checklist-types';

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
  security_level: 'low' | 'medium' | 'high';
  audit_type: 'compliance';
  legal_requirement: string;
  explanation: string;
  expected_implementation: string;
  points: number;
  customer_answer: string | null;
  customer_answer_status: 'not_started' | 'in_progress' | 'completed' | 'needs_review';
  note: string | null;
  evidence_rule: {
    allowed_mime_types: string[];
    max_file_size_bytes: number;
  };
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
    securityLevel: data.security_level,
    auditType: data.audit_type,
    legalRequirement: data.legal_requirement,
    explanation: data.explanation,
    expectedImplementation: data.expected_implementation,
    points: data.points,
    customerAnswer: data.customer_answer,
    customerAnswerStatus: data.customer_answer_status,
    note: data.note,
    evidenceRule: {
      allowedMimeTypes: data.evidence_rule.allowed_mime_types,
      maxFileSizeBytes: data.evidence_rule.max_file_size_bytes,
    },
  };
}

function parseChecklistVersion(input: string | number | undefined, fallback: number): number {
  const raw = String(input ?? '').trim();
  const majorMatch = raw.match(/^v?\s*(\d+)/i);
  if (!majorMatch) {
    return fallback;
  }
  const parsed = Number.parseInt(majorMatch[1], 10);
  return Number.isNaN(parsed) ? fallback : parsed;
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
  const parsedVersion = parseChecklistVersion(payload.version, 1);
  const data = await apiPost<
    ChecklistApiModel,
    {
      title: string;
      law_decree: string;
      version: number;
      status: 'draft' | 'published';
    }
  >(
    '/admin/checklists',
    {
      title: payload.title ?? '',
      law_decree: payload.lawDecree ?? '',
      version: parsedVersion,
      status: payload.status ?? 'draft',
    },
  );
  return mapChecklist(data);
}

export async function updateChecklist(checklistId: string, payload: Partial<Checklist>): Promise<Checklist> {
  const hasVersion = payload.version !== undefined && payload.version !== null && String(payload.version).trim() !== '';
  const parsedVersion = hasVersion ? parseChecklistVersion(payload.version, 1) : undefined;
  const data = await apiPatch<
    ChecklistApiModel,
    {
      title?: string;
      law_decree?: string;
      version?: number;
      status?: 'draft' | 'published';
    }
  >(
    `/admin/checklists/${checklistId}`,
    {
      title: payload.title,
      law_decree: payload.lawDecree,
      version: parsedVersion,
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
  return data.map(mapQuestion);
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

export async function createQuestion(
  checklistId: string,
  sectionId: string,
  payload: Partial<ChecklistQuestion>,
): Promise<ChecklistQuestion> {
  const data = await apiPost<
    QuestionApiModel,
    {
      question_id: string;
      note?: string;
      security_level: 'low' | 'medium' | 'high';
      legal_requirement: string;
      explanation: string;
      expected_implementation: string;
      points?: number; // Optional: will be derived from security_level if not provided
    }
  >(`/admin/checklists/${checklistId}/sections/${sectionId}/questions`, {
    question_id: payload.questionId ?? '',
    note: payload.note ?? undefined,
    security_level: payload.securityLevel ?? 'low',
    legal_requirement: payload.legalRequirement ?? '',
    explanation: payload.explanation ?? '',
    expected_implementation: payload.expectedImplementation ?? '',
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
      note?: string;
      security_level?: 'low' | 'medium' | 'high';
      legal_requirement?: string;
      explanation?: string;
      expected_implementation?: string;
      points?: number;
      order?: number;
    }
  >(`/admin/checklists/${checklistId}/sections/${sectionId}/questions/${questionId}`, {
    question_id: payload.questionId,
    note: payload.note ?? undefined,
    security_level: payload.securityLevel,
    legal_requirement: payload.legalRequirement,
    explanation: payload.explanation,
    expected_implementation: payload.expectedImplementation,
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
