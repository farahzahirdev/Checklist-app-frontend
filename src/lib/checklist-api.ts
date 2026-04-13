import { mockChecklist, mockQuestions, mockReportSummary, mockSections } from '@/lib/checklist-mocks';
import type { Checklist, ChecklistQuestion, ChecklistSection, ReportSummary } from '@/lib/checklist-types';

// Frontend handoff note:
// Replace mock returns with real backend calls as soon as CRUD endpoints are available.
// Keep method signatures stable so pages/components do not need refactors.

export async function getAdminChecklists(): Promise<Checklist[]> {
  return [mockChecklist];
}

export async function getChecklistById(_checklistId: string): Promise<Checklist> {
  return mockChecklist;
}

export async function createChecklist(payload: Partial<Checklist>): Promise<Checklist> {
  return {
    ...mockChecklist,
    ...payload,
    id: payload.id ?? `chk-${Date.now()}`,
  } as Checklist;
}

export async function updateChecklist(_checklistId: string, payload: Partial<Checklist>): Promise<Checklist> {
  return {
    ...mockChecklist,
    ...payload,
  } as Checklist;
}

export async function getSectionsByChecklist(_checklistId: string): Promise<ChecklistSection[]> {
  return mockSections;
}

export async function getQuestionsBySection(_checklistId: string, _sectionId: string): Promise<ChecklistQuestion[]> {
  return mockQuestions;
}

export async function createSection(_checklistId: string, payload: Partial<ChecklistSection>): Promise<ChecklistSection> {
  return {
    ...mockSections[0],
    ...payload,
    id: payload.id ?? `sec-${Date.now()}`,
  } as ChecklistSection;
}

export async function createQuestion(
  _checklistId: string,
  _sectionId: string,
  payload: Partial<ChecklistQuestion>,
): Promise<ChecklistQuestion> {
  return {
    ...mockQuestions[0],
    ...payload,
    id: payload.id ?? `q-${Date.now()}`,
  } as ChecklistQuestion;
}

export async function updateQuestion(
  _checklistId: string,
  _sectionId: string,
  _questionId: string,
  payload: Partial<ChecklistQuestion>,
): Promise<ChecklistQuestion> {
  return {
    ...mockQuestions[0],
    ...payload,
  } as ChecklistQuestion;
}

export async function getReportSummary(_assessmentId?: string): Promise<ReportSummary> {
  return mockReportSummary;
}
