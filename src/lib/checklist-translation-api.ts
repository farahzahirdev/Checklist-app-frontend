import { apiGetWithAuth, apiPatch, apiPost } from '@/lib/api';

export const CHECKLIST_PRIMARY_LANGUAGE = 'cs';
export const CHECKLIST_SECONDARY_LANGUAGE = 'en';

export type ContentLanguageCode = typeof CHECKLIST_PRIMARY_LANGUAGE | typeof CHECKLIST_SECONDARY_LANGUAGE;

export type ChecklistTranslation = {
  checklistId: string;
  languageCode: string;
  title: string;
  description: string | null;
};

export type SectionTranslation = {
  sectionId: string;
  languageCode: string;
  title: string;
};

export type QuestionAnswerOptionTranslation = {
  position: number;
  label: string | null;
  description: string | null;
};

export type QuestionTranslation = {
  questionId: string;
  languageCode: string;
  questionText: string | null;
  explanation: string | null;
  expectedImplementation: string | null;
  howItWorks: string | null;
  legalRequirementTitle: string | null;
  legalRequirementDescription: string | null;
  guidanceScore4: string | null;
  guidanceScore3: string | null;
  guidanceScore2: string | null;
  guidanceScore1: string | null;
  recommendationTemplate: string | null;
  answerOptions: QuestionAnswerOptionTranslation[] | null;
};

export type QuestionTranslationPayload = {
  question_text?: string | null;
  explanation?: string | null;
  expected_implementation?: string | null;
  how_it_works?: string | null;
  legal_requirement_title?: string | null;
  legal_requirement_description?: string | null;
  guidance_score_4?: string | null;
  guidance_score_3?: string | null;
  guidance_score_2?: string | null;
  guidance_score_1?: string | null;
  recommendation_template?: string | null;
  answer_options?: QuestionAnswerOptionTranslation[] | null;
};

type ChecklistTranslationApi = {
  checklist_id: string;
  language_code: string;
  title: string;
  description: string | null;
};

type SectionTranslationApi = {
  section_id: string;
  language_code: string;
  title: string;
};

type QuestionTranslationApi = {
  question_id: string;
  language_code: string;
  question_text: string | null;
  explanation: string | null;
  expected_implementation: string | null;
  how_it_works: string | null;
  legal_requirement_title: string | null;
  legal_requirement_description: string | null;
  guidance_score_4: string | null;
  guidance_score_3: string | null;
  guidance_score_2: string | null;
  guidance_score_1: string | null;
  recommendation_template: string | null;
  answer_options: QuestionAnswerOptionTranslation[] | null;
};

function isNotFoundError(err: unknown): boolean {
  return err instanceof Error && err.message.includes('404');
}

function mapChecklistTranslation(data: ChecklistTranslationApi): ChecklistTranslation {
  return {
    checklistId: data.checklist_id,
    languageCode: data.language_code,
    title: data.title,
    description: data.description,
  };
}

function mapSectionTranslation(data: SectionTranslationApi): SectionTranslation {
  return {
    sectionId: data.section_id,
    languageCode: data.language_code,
    title: data.title,
  };
}

function mapQuestionTranslation(data: QuestionTranslationApi): QuestionTranslation {
  return {
    questionId: data.question_id,
    languageCode: data.language_code,
    questionText: data.question_text,
    explanation: data.explanation,
    expectedImplementation: data.expected_implementation,
    howItWorks: data.how_it_works,
    legalRequirementTitle: data.legal_requirement_title,
    legalRequirementDescription: data.legal_requirement_description,
    guidanceScore4: data.guidance_score_4,
    guidanceScore3: data.guidance_score_3,
    guidanceScore2: data.guidance_score_2,
    guidanceScore1: data.guidance_score_1,
    recommendationTemplate: data.recommendation_template,
    answerOptions: data.answer_options ?? null,
  };
}

export async function getChecklistTranslation(
  checklistId: string,
  languageCode: string,
): Promise<ChecklistTranslation | null> {
  try {
    const data = await apiGetWithAuth<ChecklistTranslationApi>(
      `/admin/checklists/${checklistId}/translations/${languageCode}`,
    );
    return mapChecklistTranslation(data);
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

export async function createChecklistTranslation(
  checklistId: string,
  payload: { language_code: string; title: string; description?: string | null },
): Promise<ChecklistTranslation> {
  const data = await apiPost<ChecklistTranslationApi, typeof payload>(
    `/admin/checklists/${checklistId}/translations`,
    payload,
  );
  return mapChecklistTranslation(data);
}

export async function updateChecklistTranslation(
  checklistId: string,
  languageCode: string,
  payload: { title?: string; description?: string | null },
): Promise<ChecklistTranslation> {
  const data = await apiPatch<ChecklistTranslationApi, typeof payload>(
    `/admin/checklists/${checklistId}/translations/${languageCode}`,
    payload,
  );
  return mapChecklistTranslation(data);
}

export async function upsertChecklistTranslation(
  checklistId: string,
  languageCode: string,
  payload: { title: string; description?: string | null },
): Promise<ChecklistTranslation> {
  try {
    return await updateChecklistTranslation(checklistId, languageCode, payload);
  } catch (err) {
    if (!isNotFoundError(err)) throw err;
    return createChecklistTranslation(checklistId, { language_code: languageCode, ...payload });
  }
}

export async function getSectionTranslation(
  checklistId: string,
  sectionId: string,
  languageCode: string,
): Promise<SectionTranslation | null> {
  try {
    const data = await apiGetWithAuth<SectionTranslationApi>(
      `/admin/checklists/${checklistId}/sections/${sectionId}/translations/${languageCode}`,
    );
    return mapSectionTranslation(data);
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

export async function createSectionTranslation(
  checklistId: string,
  sectionId: string,
  payload: { language_code: string; title: string },
): Promise<SectionTranslation> {
  const data = await apiPost<SectionTranslationApi, typeof payload>(
    `/admin/checklists/${checklistId}/sections/${sectionId}/translations`,
    payload,
  );
  return mapSectionTranslation(data);
}

export async function updateSectionTranslation(
  checklistId: string,
  sectionId: string,
  languageCode: string,
  payload: { title?: string },
): Promise<SectionTranslation> {
  const data = await apiPatch<SectionTranslationApi, typeof payload>(
    `/admin/checklists/${checklistId}/sections/${sectionId}/translations/${languageCode}`,
    payload,
  );
  return mapSectionTranslation(data);
}

export async function upsertSectionTranslation(
  checklistId: string,
  sectionId: string,
  languageCode: string,
  payload: { title: string },
): Promise<SectionTranslation> {
  try {
    return await updateSectionTranslation(checklistId, sectionId, languageCode, payload);
  } catch (err) {
    if (!isNotFoundError(err)) throw err;
    return createSectionTranslation(checklistId, sectionId, { language_code: languageCode, ...payload });
  }
}

export async function getQuestionTranslation(
  checklistId: string,
  sectionId: string,
  questionId: string,
  languageCode: string,
): Promise<QuestionTranslation | null> {
  try {
    const data = await apiGetWithAuth<QuestionTranslationApi>(
      `/admin/checklists/${checklistId}/sections/${sectionId}/questions/${questionId}/translations/${languageCode}`,
    );
    return mapQuestionTranslation(data);
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

export async function createQuestionTranslation(
  checklistId: string,
  sectionId: string,
  questionId: string,
  payload: QuestionTranslationPayload & { language_code: string },
): Promise<QuestionTranslation> {
  const data = await apiPost<QuestionTranslationApi, typeof payload>(
    `/admin/checklists/${checklistId}/sections/${sectionId}/questions/${questionId}/translations`,
    payload,
  );
  return mapQuestionTranslation(data);
}

export async function updateQuestionTranslation(
  checklistId: string,
  sectionId: string,
  questionId: string,
  languageCode: string,
  payload: QuestionTranslationPayload,
): Promise<QuestionTranslation> {
  const data = await apiPatch<QuestionTranslationApi, typeof payload>(
    `/admin/checklists/${checklistId}/sections/${sectionId}/questions/${questionId}/translations/${languageCode}`,
    payload,
  );
  return mapQuestionTranslation(data);
}

export async function upsertQuestionTranslation(
  checklistId: string,
  sectionId: string,
  questionId: string,
  languageCode: string,
  payload: QuestionTranslationPayload,
): Promise<QuestionTranslation> {
  try {
    return await updateQuestionTranslation(checklistId, sectionId, questionId, languageCode, payload);
  } catch (err) {
    if (!isNotFoundError(err)) throw err;
    return createQuestionTranslation(checklistId, sectionId, questionId, { language_code: languageCode, ...payload });
  }
}

export function buildAnswerOptionsTranslationPayload(
  answerOptions: Array<{ label: string; description: string }>,
): QuestionAnswerOptionTranslation[] {
  return answerOptions.map((option, index) => ({
    position: index + 1,
    label: option.label.trim() || null,
    description: option.description.trim() || null,
  }));
}

export function buildQuestionTranslationPayload(fields: {
  legalRequirementTitle: string;
  legalRequirementDescription: string;
  explanation: string;
  expectedImplementation: string;
  howItWorks: string;
  guidanceScore4: string;
  guidanceScore3: string;
  guidanceScore2: string;
  guidanceScore1: string;
  recommendationTemplate: string;
  questionTitle?: string;
  answerOptions?: Array<{ label: string; description: string }>;
}): QuestionTranslationPayload {
  return {
    question_text: fields.legalRequirementTitle || fields.questionTitle || '',
    legal_requirement_title: fields.legalRequirementTitle,
    legal_requirement_description: fields.legalRequirementDescription,
    explanation: fields.explanation,
    expected_implementation: fields.expectedImplementation,
    how_it_works: fields.howItWorks,
    guidance_score_4: fields.guidanceScore4,
    guidance_score_3: fields.guidanceScore3,
    guidance_score_2: fields.guidanceScore2,
    guidance_score_1: fields.guidanceScore1,
    recommendation_template: fields.recommendationTemplate,
    answer_options: fields.answerOptions
      ? buildAnswerOptionsTranslationPayload(fields.answerOptions)
      : null,
  };
}

function mergeAnswerOptionTranslations<T extends { label: string; description: string }>(
  baseOptions: T[],
  translated: QuestionAnswerOptionTranslation[] | null | undefined,
): T[] {
  if (!translated?.length) {
    return baseOptions;
  }
  const byPosition = new Map(translated.map((item) => [item.position, item]));
  return baseOptions.map((option, index) => {
    const translation = byPosition.get(index + 1);
    if (!translation) {
      return option;
    }
    return {
      ...option,
      label: translation.label?.trim() ? translation.label : option.label,
      description: translation.description?.trim() ? translation.description : option.description,
    };
  });
}

export function applyQuestionTranslationToPanel<
  T extends {
    legalRequirementTitle: string;
    legalRequirementDescription: string;
    explanation: string;
    expectedImplementation: string;
    howItWorks: string;
    guidanceScore4: string;
    guidanceScore3: string;
    guidanceScore2: string;
    guidanceScore1: string;
    recommendationTemplate: string;
    answerOptions: Array<{ label: string; description: string }>;
  },
>(base: T, translation: QuestionTranslation): T {
  return {
    ...base,
    legalRequirementTitle: translation.legalRequirementTitle ?? base.legalRequirementTitle,
    legalRequirementDescription: translation.legalRequirementDescription ?? base.legalRequirementDescription,
    explanation: translation.explanation ?? base.explanation,
    expectedImplementation: translation.expectedImplementation ?? base.expectedImplementation,
    howItWorks: translation.howItWorks ?? base.howItWorks,
    guidanceScore4: translation.guidanceScore4 ?? base.guidanceScore4,
    guidanceScore3: translation.guidanceScore3 ?? base.guidanceScore3,
    guidanceScore2: translation.guidanceScore2 ?? base.guidanceScore2,
    guidanceScore1: translation.guidanceScore1 ?? base.guidanceScore1,
    recommendationTemplate: translation.recommendationTemplate ?? base.recommendationTemplate,
    answerOptions: mergeAnswerOptionTranslations(base.answerOptions, translation.answerOptions),
  };
}
