'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { getActiveCompanyId } from '@/lib/company-context';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';
import { listPurchasedChecklistIds } from '@/lib/customer-payments';
import { listCustomerAssessments } from '@/lib/customer-assessments';
import {
  getCurrentAssessment,
  getAssessmentAnswers,
  getCurrentAssessmentDetail,
  getMediaPreviewUrl,
  saveAssessmentAnswer,
  submitAssessment,
  uploadAssessmentEvidence,
  startAssessment,
  type AssessmentCurrentDetailResponse,
  type AssessmentDetailQuestion,
} from '@/lib/assessment';
import { isAllowedEvidenceFileSize, isAllowedEvidenceMimeType } from '@/lib/upload-rules';
import SecureUploadProgress from '@/components/secure-upload-progress';

type LocalAnswer = {
  answer: string;
  note_text: string;
};

type FlattenedQuestion = AssessmentDetailQuestion & {
  sectionId: string;
  sectionTitle: string;
  depth: 0 | 1;
  parentQuestionTitle?: string;
};

function flattenSectionQuestions(
  sectionId: string,
  sectionTitle: string,
  questions: AssessmentDetailQuestion[],
): FlattenedQuestion[] {
  const rows: FlattenedQuestion[] = [];
  const seenIds = new Set<string>();
  
  questions.forEach((question) => {
    const questionId = String(question.id);
    
    // Only add if we haven't seen this question ID before
    if (!seenIds.has(questionId)) {
      seenIds.add(questionId);
      rows.push({ 
        ...question, 
        sectionId, 
        sectionTitle, 
        depth: 0, 
        parentQuestionTitle: undefined 
      });
    } else {
      console.warn(`[Assessment] Skipping duplicate question ${question.question_id} (id: ${questionId}) in section ${sectionTitle}`);
    }
    
    // Process sub-questions
    (question.sub_questions ?? []).forEach((child) => {
      const childId = String(child.id);
      
      // Only add if we haven't seen this sub-question ID before
      if (!seenIds.has(childId)) {
        seenIds.add(childId);
        rows.push({
          ...child,
          sectionId,
          sectionTitle,
          depth: 1,
          parentQuestionTitle: question.question_title ?? question.question_id ?? 'Parent question',
        });
      } else {
        console.warn(`[Assessment] Skipping duplicate sub-question ${child.question_id} (id: ${childId}) in section ${sectionTitle}`);
      }
    });
  });
  
  return rows;
}

function normalizeAnswerOptionLabel(value: string) {
  const v = value.trim().toLowerCase();
  if (v === 'yes') return 'Yes';
  if (v === 'partial' || v === 'partially') return 'Partially';
  if (v === 'no') return 'No';
  if (v === 'na' || v === "don't know" || v === 'dont know' || v === 'dont_know') return "Don't know";
  return value;
}

function normalizeAnswerValue(value?: string | null) {
  const v = (value ?? '').trim().toLowerCase();
  if (v === '4' || v === '3' || v === '2' || v === '1') return v;
  if (v === 'partial') return 'partially';
  if (v === 'na' || v === "don't know" || v === 'dont know') return 'dont_know';
  if (v === 'yes') return '4';
  if (v === 'partially') return '3';
  if (v === 'no') return '2';
  if (v === 'dont_know') return '1';
  return v;
}

function isHttpUrl(value?: string | null) {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isAssessmentNotFoundMessage(message: string) {
  const normalized = message.trim().toLowerCase();
  return normalized.includes('assessment not found') || normalized.includes('404');
}

function sanitizeRichHtml(input?: string | null) {
  const raw = String(input ?? '').trim();
  if (!raw) return '';
  if (typeof window === 'undefined') return raw;
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'text/html');
  const allowedTags = new Set(['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 'a']);
  const walk = (node: Element) => {
    const children = Array.from(node.children);
    children.forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        const textNode = doc.createTextNode(child.textContent ?? '');
        child.replaceWith(textNode);
        return;
      }
      const attrs = Array.from(child.attributes);
      attrs.forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (tag === 'a') {
          if (name !== 'href' && name !== 'target' && name !== 'rel') {
            child.removeAttribute(attr.name);
          }
          return;
        }
        child.removeAttribute(attr.name);
      });
      if (tag === 'a') {
        const href = child.getAttribute('href') ?? '';
        if (!/^https?:\/\//i.test(href)) {
          child.removeAttribute('href');
        } else {
          child.setAttribute('target', '_blank');
          child.setAttribute('rel', 'noreferrer noopener');
        }
      }
      walk(child);
    });
  };
  walk(doc.body);
  return doc.body.innerHTML.trim();
}

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const questionPanelTopRef = useRef<HTMLDivElement | null>(null);
  const checklistIdFromQuery = searchParams.get('checklist_id') ?? '';
  const [availableChecklists, setAvailableChecklists] = useState<CustomerChecklist[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [purchasedChecklistIds, setPurchasedChecklistIds] = useState<string[]>([]);
  const [assessmentId, setAssessmentId] = useState('');
  const [assessmentDetail, setAssessmentDetail] = useState<AssessmentCurrentDetailResponse | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState('');
  const [activeQuestionCursor, setActiveQuestionCursor] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>({});
  const [persistedAnswerByQuestionId, setPersistedAnswerByQuestionId] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isWhyThisMattersOpen, setIsWhyThisMattersOpen] = useState(false);
  const [autoSaving, setAutoSaving] = useState<Record<string, boolean>>({});
  const [evidenceLoading, setEvidenceLoading] = useState<Record<string, boolean>>({});
  const [evidencePreviewUrls, setEvidencePreviewUrls] = useState<Record<string, string>>({});
  const [selectedEvidenceFiles, setSelectedEvidenceFiles] = useState<Record<string, File | null>>({});
  const [existingEvidenceFiles, setExistingEvidenceFiles] = useState<Record<string, Array<{
    id: string;
    media_id: string;
    filename: string;
    mime_type: string;
    file_size: number;
    scan_status: string;
    encryption_status: string;
    uploaded_at?: string;
  }>>>({});
  const [showUploadProgress, setShowUploadProgress] = useState<string | null>(null);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [previewUrlsByMediaId, setPreviewUrlsByMediaId] = useState<Record<string, string>>({});
  const [previewErrorsByMediaId, setPreviewErrorsByMediaId] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isSubmittedChecklist, setIsSubmittedChecklist] = useState(false);

  const allQuestions = useMemo(
    () =>
      (assessmentDetail?.sections ?? []).flatMap((section) =>
        flattenSectionQuestions(section.id, section.title, section.questions),
      ),
    [assessmentDetail],
  );
  const activeQuestion = useMemo(() => {
    if (activeQuestionCursor >= 0 && activeQuestionCursor < allQuestions.length) {
      return allQuestions[activeQuestionCursor];
    }
    const explicit = allQuestions.find((question) => question.id === activeQuestionId);
    if (explicit) {
      console.log(`[Assessment] Active question: ${explicit.question_id} (id: ${String(explicit.id)})`);
      return explicit;
    }
    if (selectedSectionId) {
      const fallback = allQuestions.find((question) => question.sectionId === selectedSectionId);
      if (fallback) {
        console.log(`[Assessment] Using fallback (section match): ${fallback.question_id} (id: ${String(fallback.id)})`);
      }
      return fallback;
    }
    const first = allQuestions[0];
    if (first) {
      console.log(`[Assessment] Using first question: ${first.question_id} (id: ${String(first.id)})`);
    }
    return first;
  }, [activeQuestionId, allQuestions, selectedSectionId]);
  const activeAnswer = activeQuestion ? answers[activeQuestion.id] : undefined;
  const sanitizedExplanationHtml = useMemo(
    () => sanitizeRichHtml(activeQuestion?.explanation),
    [activeQuestion?.explanation],
  );
  const sanitizedExpectedImplementationHtml = useMemo(
    () => sanitizeRichHtml(activeQuestion?.expected_implementation),
    [activeQuestion?.expected_implementation],
  );
  const effectiveChecklistId = checklistIdFromQuery || assessmentDetail?.checklist_id || '';

  useEffect(() => {
    let mounted = true;
    async function loadCatalog() {
      setCatalogLoading(true);
      try {
        const catalog = await listPublishedCustomerChecklists({ sortBy: 'updated_at', sortOrder: 'desc', limit: 200 });
        if (!mounted) return;
        setAvailableChecklists(catalog);
      } catch {
        // Don't block assessment if catalog fails.
      } finally {
        if (mounted) setCatalogLoading(false);
      }
    }
    void loadCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadPurchasedChecklistIds() {
      try {
        const ids = await listPurchasedChecklistIds();
        if (!mounted) return;
        const next = Array.from(new Set([...(ids ?? []), ...(effectiveChecklistId ? [effectiveChecklistId] : [])]));
        setPurchasedChecklistIds(next);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('checklist_purchased_ids', JSON.stringify(next));
        }
      } catch {
        // ignore and fall back to localStorage
      }
    }
    void loadPurchasedChecklistIds();
    return () => {
      mounted = false;
    };
  }, [effectiveChecklistId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('checklist_purchased_ids');
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
      const withQuery = effectiveChecklistId ? Array.from(new Set([...list, effectiveChecklistId])) : list;
      setPurchasedChecklistIds((previous) => (previous.length ? Array.from(new Set([...previous, ...withQuery])) : withQuery));
    } catch {
      setPurchasedChecklistIds((previous) =>
        previous.length ? previous : effectiveChecklistId ? [effectiveChecklistId] : [],
      );
    }
  }, [effectiveChecklistId]);

  useEffect(() => {
    // If user reaches assessment without going through payment success in this browser,
    // still treat the loaded assessment checklist as "purchased" for dropdown purposes.
    if (typeof window === 'undefined') return;
    if (!assessmentDetail?.checklist_id) return;
    try {
      const raw = window.localStorage.getItem('checklist_purchased_ids');
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
      const next = Array.from(new Set([...list, assessmentDetail.checklist_id]));
      window.localStorage.setItem('checklist_purchased_ids', JSON.stringify(next));
      setPurchasedChecklistIds((previous) => Array.from(new Set([...previous, ...next])));
    } catch {
      // ignore
    }
  }, [assessmentDetail?.checklist_id]);

  const purchasedOnlyChecklists = useMemo(() => {
    if (!purchasedChecklistIds.length) return [];
    const ids = new Set(purchasedChecklistIds);
    return availableChecklists.filter((item) => ids.has(item.id));
  }, [availableChecklists, purchasedChecklistIds]);

  const checklistSelectOptions = useMemo(() => {
    const base = purchasedOnlyChecklists.map((item) => ({
      id: item.id,
      label: `${item.title} (${item.version})`,
    }));

    if (!effectiveChecklistId) {
      return base;
    }

    const hasCurrent = base.some((item) => item.id === effectiveChecklistId);
    if (hasCurrent) {
      return base;
    }

    const currentLabel = assessmentDetail?.checklist_title
      ? `${assessmentDetail.checklist_title} (current)`
      : 'Current checklist';
    return [{ id: effectiveChecklistId, label: currentLabel }, ...base];
  }, [assessmentDetail?.checklist_title, effectiveChecklistId, purchasedOnlyChecklists]);
  const isNoteEnabledForActiveQuestion = useMemo(() => {
    if (!activeQuestion) {
      return false;
    }
    const questionWithFlexibleNote = activeQuestion as typeof activeQuestion & {
      noteEnabled?: boolean;
    };
    if (typeof questionWithFlexibleNote.note_enabled === 'boolean') {
      return questionWithFlexibleNote.note_enabled;
    }
    if (typeof questionWithFlexibleNote.noteEnabled === 'boolean') {
      return questionWithFlexibleNote.noteEnabled;
    }
    return false;
  }, [activeQuestion]);

  const isEvidenceEnabledForActiveQuestion = useMemo(() => {
    if (!activeQuestion) {
      return false;
    }

    // Backend responses may expose this flag in different shapes.
    const questionWithFlexibleEvidence = activeQuestion as typeof activeQuestion & {
      evidenceEnabled?: boolean;
      evidence_rule?: unknown;
    };

    if (typeof questionWithFlexibleEvidence.evidence_enabled === 'boolean') {
      return questionWithFlexibleEvidence.evidence_enabled;
    }
    if (typeof questionWithFlexibleEvidence.evidenceEnabled === 'boolean') {
      return questionWithFlexibleEvidence.evidenceEnabled;
    }
    return false;
  }, [activeQuestion]);

  const questionsBySection = useMemo(() => {
    const map = new Map<string, FlattenedQuestion[]>();
    allQuestions.forEach((question) => {
      const list = map.get(question.sectionId) ?? [];
      list.push(question);
      map.set(question.sectionId, list);
    });
    return map;
  }, [allQuestions]);

  const questionsInActiveSection = useMemo(() => {
    if (!selectedSectionId) {
      return [];
    }
    return questionsBySection.get(selectedSectionId) ?? [];
  }, [questionsBySection, selectedSectionId]);

  const activeQuestionIndex = useMemo(() => {
    if (!activeQuestion) return -1;
    if (activeQuestionCursor >= 0 && activeQuestionCursor < allQuestions.length) {
      return activeQuestionCursor;
    }
    return allQuestions.findIndex((question) => question.id === activeQuestion.id);
  }, [activeQuestionCursor, allQuestions, activeQuestion]);

  const hasPreviousQuestion = activeQuestionIndex > 0;
  const hasNextQuestion = activeQuestionIndex >= 0 && activeQuestionIndex < allQuestions.length - 1;
  const isOnLastQuestion = allQuestions.length > 0 && activeQuestionIndex === allQuestions.length - 1;
  const answeredQuestionsCount = useMemo(
    () => allQuestions.filter((question) => (answers[question.id]?.answer ?? '').trim().length > 0).length,
    [allQuestions, answers],
  );
  const areAllQuestionsAnswered = allQuestions.length > 0 && answeredQuestionsCount === allQuestions.length;
  const activeSectionQuestionIndex = useMemo(() => {
    if (!activeQuestion || !questionsInActiveSection.length) return -1;
    return questionsInActiveSection.findIndex((question) => question.id === activeQuestion.id);
  }, [activeQuestion, questionsInActiveSection]);
  const isOnLastQuestionOfSection =
    activeSectionQuestionIndex >= 0 && activeSectionQuestionIndex === questionsInActiveSection.length - 1;
  const nextSectionWithQuestions = useMemo(() => {
    if (!assessmentDetail?.sections?.length || !selectedSectionId) return null;
    const currentSectionIndex = assessmentDetail.sections.findIndex((section) => section.id === selectedSectionId);
    if (currentSectionIndex < 0) return null;
    for (let i = currentSectionIndex + 1; i < assessmentDetail.sections.length; i += 1) {
      const section = assessmentDetail.sections[i];
      if ((questionsBySection.get(section.id) ?? []).length > 0) {
        return section;
      }
    }
    return null;
  }, [assessmentDetail?.sections, questionsBySection, selectedSectionId]);

  const sectionProgress = useMemo(() => {
    const bySection: Record<string, { current: number; total: number }> = {};
    questionsBySection.forEach((questions, sectionId) => {
      const total = questions.length;
      let current = 0;
      if (selectedSectionId === sectionId && activeQuestion) {
        const idx = questions.findIndex((question) => question.id === activeQuestion.id);
        current = idx >= 0 ? idx + 1 : 0;
      }
      bySection[sectionId] = { current, total };
    });
    return bySection;
  }, [questionsBySection, selectedSectionId, activeQuestion]);

  const answerOptionsForActive = useMemo(() => {
    const options = activeQuestion?.answer_options ?? [];
    if (options.length) {
      return options.map((option, index) => ({
        key: String(index + 1),
        value: String(
          typeof option.score === 'number' && Number.isFinite(option.score) ? option.score : Math.max(1, 4 - index),
        ),
        label: normalizeAnswerOptionLabel(option.label ?? option.choice_code ?? `Option ${index + 1}`),
        description: option.description ?? '',
      }));
    }
    return [
      { key: '4', value: '4', label: 'Yes', description: 'Fully implemented' },
      { key: '3', value: '3', label: 'Partially', description: 'Some exceptions' },
      { key: '2', value: '2', label: 'No', description: 'Not implemented' },
      { key: '1', value: '1', label: "Don't know", description: 'Not sure' },
    ];
  }, [activeQuestion?.answer_options]);

  const whyThisMattersText = (activeQuestion?.how_it_works || activeQuestion?.explanation || '').trim();

  useEffect(() => {
    setIsWhyThisMattersOpen(false);
  }, [activeQuestionId]);

  async function ensureCurrentAssessmentId() {
    const companyId = getActiveCompanyId() || undefined;
    if (assessmentId) {
      return assessmentId;
    }
    try {
      const current = await getCurrentAssessment(undefined, companyId);
      setAssessmentId(current.assessment_id);
      return current.assessment_id;
    } catch {
      if (!assessmentDetail?.checklist_id) {
        throw new Error('No active checklist found to start assessment.');
      }
      const started = await startAssessment({ checklist_id: assessmentDetail.checklist_id, company_id: companyId });
      setAssessmentId(started.assessment_id);
      return started.assessment_id;
    }
  }

  async function loadAssessmentDetail(options?: {
    suppressNotFoundError?: boolean;
    preferredQuestionId?: string;
    preferredSectionId?: string;
  }) {
    setInitialLoading(true);
    try {
      const companyId = getActiveCompanyId() || undefined;
      let detail: AssessmentCurrentDetailResponse;
      try {
        detail = await getCurrentAssessmentDetail(checklistIdFromQuery || undefined, companyId);
      } catch (initialErr) {
        if (!checklistIdFromQuery) {
          throw initialErr;
        }
        try {
          const list = await listCustomerAssessments({ limit: 200, sort_by: 'updated_at', sort_order: 'desc', company_id: companyId });
          const submittedForChecklist = (list.assessments ?? []).find(
            (item) => item.checklist_id === checklistIdFromQuery && item.status === 'submitted',
          );
          if (submittedForChecklist) {
            setIsSubmittedChecklist(true);
            throw new Error('This assessment is already submitted and cannot be started again.');
          }
        } catch (lookupErr) {
          if (lookupErr instanceof Error && lookupErr.message.includes('already submitted')) {
            throw lookupErr;
          }
        }
        await startAssessment({ checklist_id: checklistIdFromQuery, company_id: companyId });
        detail = await getCurrentAssessmentDetail(checklistIdFromQuery, companyId);
      }
      setIsSubmittedChecklist(detail.status === 'submitted');
      setAssessmentDetail(detail);
      setAssessmentId(detail.assessment_id);
      const initialAnswers: Record<string, LocalAnswer> = {};
      const persistedAnswers: Record<string, boolean> = {};
      const initialEvidenceFiles: Record<string, Array<{
        id: string;
        media_id: string;
        filename: string;
        mime_type: string;
        file_size: number;
        scan_status: string;
        encryption_status: string;
        uploaded_at?: string;
      }>> = {};
      
      detail.sections.forEach((section) => {
        flattenSectionQuestions(section.id, section.title, section.questions).forEach((question) => {
          const normalizedAnswer = normalizeAnswerValue(question.customer_answer);
          initialAnswers[question.id] = {
            answer: normalizedAnswer,
            note_text: question.user_note ?? '',
          };
          if (normalizedAnswer) {
            persistedAnswers[question.id] = true;
          }
          
          // Load evidence files from backend response
          if (question.evidence_files && question.evidence_files.length > 0) {
            // Store existing evidence files from backend
            initialEvidenceFiles[question.id] = question.evidence_files;
          }
        });
      });
      try {
        const savedAnswers = await getAssessmentAnswers(detail.assessment_id);
        savedAnswers.forEach((answerItem) => {
          if (!answerItem.question_id) return;
          const previous = initialAnswers[answerItem.question_id] ?? { answer: '', note_text: '' };
          initialAnswers[answerItem.question_id] = {
            answer: normalizeAnswerValue(answerItem.answer ?? previous.answer ?? ''),
            note_text: answerItem.note_text ?? previous.note_text ?? '',
          };
          if (normalizeAnswerValue(answerItem.answer)) {
            persistedAnswers[answerItem.question_id] = true;
          }
        });
      
      // Set the existing evidence files state
      setExistingEvidenceFiles(initialEvidenceFiles);
      
      } catch {
        // Detail payload already carries answers for most backends.
      }
      setAnswers(initialAnswers);
      setPersistedAnswerByQuestionId(persistedAnswers);
      const flattened = detail.sections.flatMap((section) => flattenSectionQuestions(section.id, section.title, section.questions));
      const preferred = options?.preferredQuestionId
        ? flattened.find((question) => question.id === options.preferredQuestionId)
        : undefined;
      if (preferred) {
        setSelectedSectionId(preferred.sectionId);
        setActiveQuestionId(preferred.id);
        setActiveQuestionCursor(flattened.indexOf(preferred));
      } else {
        const preferredSection = options?.preferredSectionId
          ? detail.sections.find((section) => section.id === options.preferredSectionId)
          : undefined;
        const fallbackSection = preferredSection ?? detail.sections[0];
        const fallbackQuestion = flattened.find((question) => question.sectionId === fallbackSection?.id);
        setSelectedSectionId(fallbackSection?.id ?? '');
        setActiveQuestionId(fallbackQuestion?.id ?? '');
        setActiveQuestionCursor(fallbackQuestion ? flattened.indexOf(fallbackQuestion) : -1);
      }
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assessment details.';
      if (errorMessage.includes('already submitted')) {
        setError('');
        return;
      }
      if (options?.suppressNotFoundError && isAssessmentNotFoundMessage(errorMessage)) {
        return;
      }
      setError(errorMessage);
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    void loadAssessmentDetail();
  }, [checklistIdFromQuery]);

  useEffect(() => {
    setSelectedEvidenceFiles({});
    setEvidencePreviewUrls({});
    setMessage('');
  }, [activeQuestionId]);

  useEffect(() => {
    if (!activeQuestion?.id) return;
    
    const selectedFile = selectedEvidenceFiles[activeQuestion.id];
    if (!selectedFile) {
      setEvidencePreviewUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[activeQuestion.id];
        return newUrls;
      });
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setEvidencePreviewUrls(prev => ({ ...prev, [activeQuestion.id]: url }));
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedEvidenceFiles, activeQuestion?.id]);

  useEffect(() => {
    if (!selectedSectionId) return;
    setCollapsedSections((previous) => ({ ...previous, [selectedSectionId]: false }));
  }, [selectedSectionId]);

  useEffect(() => {
    const mediaId = activeQuestion?.illustrative_image_id;
    if (!mediaId || isHttpUrl(mediaId) || previewUrlsByMediaId[mediaId]) {
      return;
    }
    let cancelled = false;
    void getMediaPreviewUrl(mediaId)
      .then((previewUrl) => {
        if (cancelled || !previewUrl) return;
        setPreviewUrlsByMediaId((previous) => ({ ...previous, [mediaId]: previewUrl }));
        setPreviewErrorsByMediaId((previous) => {
          if (!previous[mediaId]) return previous;
          const next = { ...previous };
          delete next[mediaId];
          return next;
        });
      })
      .catch((err) => {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to load preview image.';
        setPreviewErrorsByMediaId((previous) => ({ ...previous, [mediaId]: errorMessage }));
      });
    return () => {
      cancelled = true;
    };
  }, [activeQuestion?.illustrative_image_id, previewUrlsByMediaId]);

  async function handleAutoSaveAnswer(answerValue: string) {
    if (!activeQuestion) {
      return;
    }
    
    try {
      const currentAssessmentId = await ensureCurrentAssessmentId();
      if (!isUuid(activeQuestion.id)) {
        return;
      }
      
      // Show auto-saving indicator
      setAutoSaving((prev) => ({ ...prev, [activeQuestion.id]: true }));
      
      // Save the answer silently (no loading states)
      await saveAssessmentAnswer(currentAssessmentId, {
        question_id: activeQuestion.id,
        answer: answerValue,
        note_text: answers[activeQuestion.id]?.note_text || undefined,
      });
      
      // Mark as persisted and update active answer
      setPersistedAnswerByQuestionId((previous) => ({ ...previous, [activeQuestion.id]: true }));
      setAnswers((prev) => ({
        ...prev,
        [activeQuestion.id]: {
          answer: answerValue,
          note_text: prev[activeQuestion.id]?.note_text ?? '',
        },
      }));
      
      // Clear auto-saving indicator after a short delay
      setTimeout(() => {
        setAutoSaving((prev) => {
          const next = { ...prev };
          delete next[activeQuestion.id];
          return next;
        });
      }, 1000);
      
    } catch (err) {
      // Clear auto-saving indicator on error
      setAutoSaving((prev) => {
        const next = { ...prev };
        delete next[activeQuestion.id];
        return next;
      });
      
      // Silently handle errors for auto-save (don't disrupt UX)
      console.error('Auto-save failed:', err);
    }
  }

  async function onSaveAnswer() {
    if (!activeQuestion) {
      setError('No active question found.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const currentAssessmentId = await ensureCurrentAssessmentId();
      const payload = answers[activeQuestion.id];
      if (!payload?.answer) {
        throw new Error('Select an answer before saving.');
      }
      if (!isUuid(activeQuestion.id)) {
        throw new Error(
          'Question ID is not a backend UUID yet. Connect assessment questions from backend before saving answers.',
        );
      }
      const result = await saveAssessmentAnswer(currentAssessmentId, {
        question_id: activeQuestion.id,
        answer: payload.answer,
        note_text: payload.note_text || undefined,
      });
      setPersistedAnswerByQuestionId((previous) => ({ ...previous, [activeQuestion.id]: true }));
      await loadAssessmentDetail({
        preferredQuestionId: activeQuestion.id,
        preferredSectionId: activeQuestion.sectionId,
      });
      setMessage(`Answer saved. Completion: ${result.completion_percent}%`);
      toast.success('Answer saved.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save answer.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitAssessment() {
    setError('');
    setMessage('');
    setSubmittingAssessment(true);
    setLoading(true);
    try {
      const currentAssessmentId = await ensureCurrentAssessmentId();
      const result = await submitAssessment(currentAssessmentId, getActiveCompanyId() || undefined);
      setMessage(`Assessment submitted. Completion: ${result.completion_percent}%`);
      toast.success('Assessment submitted.');
      await loadAssessmentDetail({ suppressNotFoundError: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit assessment.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSubmittingAssessment(false);
    }
  }

  async function onUploadEvidence() {
    if (!activeQuestion) {
      setError('No active question found.');
      return;
    }
    const selectedFile = selectedEvidenceFiles[activeQuestion.id];
    if (!selectedFile) {
      setError('Choose an evidence file before uploading.');
      return;
    }
    if (!isAllowedEvidenceMimeType(selectedFile.type)) {
      setError('Unsupported evidence file type.');
      return;
    }
    if (!isAllowedEvidenceFileSize(selectedFile.size)) {
      setError('Evidence file is too large.');
      return;
    }
    if (!isUuid(activeQuestion.id)) {
      setError('Question ID is not a backend UUID yet. Connect backend question IDs before uploading evidence.');
      return;
    }

    setError('');
    setMessage('');
    setShowUploadProgress(activeQuestion.id);
    try {
      const currentAssessmentId = await ensureCurrentAssessmentId();
      await uploadAssessmentEvidence(currentAssessmentId, activeQuestion.id, selectedFile);
      setMessage('Evidence uploaded successfully.');
      toast.success('Evidence uploaded successfully.');
      setSelectedEvidenceFiles(prev => ({ ...prev, [activeQuestion.id]: null }));
      
      // Refresh assessment detail to get updated evidence files
      try {
        const updatedDetail = await getCurrentAssessmentDetail(checklistIdFromQuery);
        setAssessmentDetail(updatedDetail);
        
        // Update existing evidence files for this question
        const currentQuestion = updatedDetail.sections
          .flatMap(s => flattenSectionQuestions(s.id, s.title, s.questions))
          .find(q => q.id === activeQuestion.id);
          
        if (currentQuestion?.evidence_files) {
          setExistingEvidenceFiles(prev => ({
            ...prev,
            [activeQuestion.id]: currentQuestion.evidence_files || []
          }));
        }
      } catch (refreshError) {
        console.error('Failed to refresh evidence files:', refreshError);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload evidence.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setShowUploadProgress(null);
    }
  }

  function goToQuestionByIndex(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= allQuestions.length) return;
    const nextQuestion = allQuestions[nextIndex];
    if (!nextQuestion) return;
    setSelectedSectionId(nextQuestion.sectionId);
    setActiveQuestionId(nextQuestion.id);
    setActiveQuestionCursor(nextIndex);
  }

  function goToNextSection() {
    if (!nextSectionWithQuestions) return;
    const firstQuestionInSection = (questionsBySection.get(nextSectionWithQuestions.id) ?? [])[0];
    if (!firstQuestionInSection) return;
    setSelectedSectionId(nextSectionWithQuestions.id);
    setActiveQuestionId(firstQuestionInSection.id);
    setActiveQuestionCursor(allQuestions.indexOf(firstQuestionInSection));
  }

  function scrollQuestionPanelToTop() {
    questionPanelTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return (
    <section className="space-y-4 bg-[#f4f6fa]">
      <div className="rounded-xl border border-[#d9dee8] bg-white p-4 shadow-[0_1px_3px_rgba(18,32,61,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Assessment</p>
            <p className="mt-1 text-sm text-[#607594]">Switch checklist to view/manage different assessments.</p>
          </div>
          <label className="w-full min-w-0 flex-1 sm:min-w-[280px] sm:max-w-xl">
            <select
              value={effectiveChecklistId}
              onChange={(event) => {
                const nextId = event.target.value;
                const next = nextId ? `/assessment?checklist_id=${encodeURIComponent(nextId)}` : '/assessment';
                window.location.assign(next);
              }}
              className="w-full min-w-0 rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring disabled:opacity-60"
              disabled={catalogLoading || !checklistSelectOptions.length}
            >
              <option value="">
                {catalogLoading
                  ? 'Loading checklists…'
                  : checklistSelectOptions.length
                    ? 'Select checklist'
                    : 'No purchased checklists found'}
              </option>
              {checklistSelectOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {initialLoading ? <p className="text-sm text-[#607594]">Loading assessment details...</p> : null}

      <section className={isSubmittedChecklist ? 'grid gap-4' : 'grid gap-4 lg:grid-cols-[280px_1fr]'}>
        {!isSubmittedChecklist ? (
        <aside className="w-full min-w-0 max-w-[calc(100vw-2rem)] rounded-xl border border-[#d9dee8] bg-white p-4 shadow-[0_1px_3px_rgba(18,32,61,0.08)] sm:max-w-none">
          <h3 className="text-[22px] font-semibold text-[#1f2d45]">Checklist Sections</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(assessmentDetail?.sections ?? []).map((section) => (
                <li key={section.id}>
                  <div
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedSectionId === section.id
                        ? 'border-[#d7e4fa] bg-[#f2f7ff] text-[#20457b]'
                        : 'border-[#e4e8f0] bg-white text-[#3f5677] hover:bg-[#f8faff]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSectionId(section.id);
                          const firstQuestionInSection = (questionsBySection.get(section.id) ?? [])[0];
                          if (firstQuestionInSection) {
                            setActiveQuestionId(firstQuestionInSection.id);
                            setActiveQuestionCursor(allQuestions.indexOf(firstQuestionInSection));
                      } else {
                        setActiveQuestionId('');
                        setActiveQuestionCursor(-1);
                          }
                        }}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full border ${
                            selectedSectionId === section.id
                              ? 'border-[#5c84df] bg-white ring-2 ring-[#dbe7ff]'
                              : 'border-[#b9c2d4] bg-white'
                          }`}
                        >
                          {selectedSectionId === section.id ? (
                            <span className="mx-auto mt-[3px] block h-2 w-2 rounded-full bg-[#5c84df]" />
                          ) : null}
                        </span>
                        <span className="truncate">{section.order}. {section.title}</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#607594]">
                          {sectionProgress[section.id]?.current ?? 0} / {sectionProgress[section.id]?.total ?? 0}
                        </span>
                        {(questionsBySection.get(section.id) ?? []).length > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setCollapsedSections((previous) => ({
                                ...previous,
                                [section.id]: !previous[section.id],
                              }))
                            }
                            className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#d4dced] bg-white text-[#4f6281] hover:bg-[#eef3fc]"
                            aria-label={collapsedSections[section.id] ? 'Expand section questions' : 'Collapse section questions'}
                          >
                            <span className="text-[10px]">{collapsedSections[section.id] ? '▸' : '▾'}</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {(questionsBySection.get(section.id) ?? []).length > 0 && !collapsedSections[section.id] ? (
                    <ul className="mt-1 space-y-1 pl-2">
                      {(() => {
                        let topLevelCounter = 0;
                        let subCounter = 0;
                        return (questionsBySection.get(section.id) ?? []).map((question, index) => {
                          const questionGlobalIndex = allQuestions.indexOf(question);
                          if (question.depth === 0) {
                            topLevelCounter += 1;
                            subCounter = 0;
                          } else {
                            subCounter += 1;
                          }
                          const numberLabel =
                            question.depth === 0 ? `${topLevelCounter}` : `${topLevelCounter}.${subCounter}`;
                          return (
                            <li key={`${section.id}-${question.id}-${index}`}>
                              <button
                                type="button"
                                onClick={() => {
                                  console.log(`[Assessment] Clicked question: ${question.question_id} (id: ${String(question.id)})`);
                                  setSelectedSectionId(section.id);
                                  setActiveQuestionId(question.id);
                                  setActiveQuestionCursor(questionGlobalIndex);
                                }}
                                className={`w-full rounded-md px-2 py-1.5 text-left text-xs transition ${
                                  activeQuestion?.id === question.id
                                    ? (() => {
                                        if (activeQuestion?.id !== question.id) {
                                          console.warn(`[Assessment] Mismatch: activeQuestion.id (${String(activeQuestion?.id)}) !== question.id (${String(question.id)}) but className thinks they match!`);
                                        }
                                        return 'bg-[#eaf1fb] text-[#20457b]';
                                      })()
                                    : 'text-[#4f6281] hover:bg-[#f6f9ff]'
                                }`}
                              >
                                <span className={question.depth === 1 ? 'pl-3' : ''}>
                                  {question.depth === 1 ? '↳ ' : ''}
                                  {numberLabel}. {question.question_title || question.question_id || 'Question'}
                                </span>
                              </button>
                            </li>
                          );
                        });
                      })()}
                    </ul>
                  ) : null}
                </li>
            ))}
          </ul>
        </aside>
        ) : null}

        <div className="w-full min-w-0">
          <div ref={questionPanelTopRef} />
          <article className="w-full min-w-0 max-w-[calc(100vw-2rem)] rounded-xl border border-[#d9dee8] bg-white p-4 shadow-[0_1px_3px_rgba(18,32,61,0.08)] sm:max-w-none sm:p-5">
            {selectedSectionId && questionsInActiveSection.length === 0 ? (
              <div className="mt-3 rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] px-3 py-3 text-sm text-[#607594]">
                No questions for this section yet. Select another section from the left panel.
              </div>
            ) : isSubmittedChecklist ? (
              <div className="mt-3 rounded-lg border border-[#d8e7d8] bg-[#f1f8f1] px-3 py-3 text-sm text-[#2f5c38]">
                <p>This assessment is submitted and cannot be submitted again.</p>
                <div className="mt-3">
                  <Link
                    href="/payment"
                    className="inline-flex items-center rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                  >
                    Purchase new checklist
                  </Link>
                </div>
              </div>
            ) : activeQuestion ? (
              <>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-flex rounded-md bg-[#eaf1fb] px-2 py-1 text-xs font-semibold text-[#2f4f83]">
                      {selectedSectionId
                        ? `${assessmentDetail?.sections.find((s) => s.id === selectedSectionId)?.order ?? 1}. ${activeQuestion.sectionTitle}`
                        : activeQuestion.sectionTitle}
                    </span>
                    {activeQuestion.depth === 1 ? (
                      <p className="text-xs font-medium text-[#6a7f9d]">
                        Sub-question of: {activeQuestion.parentQuestionTitle || 'Parent question'}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-semibold text-[#65748f]">
                      Question {activeQuestionIndex + 1 > 0 ? activeQuestionIndex + 1 : 1} of {allQuestions.length || 1}
                    </p>
                    <div className="relative group">
                    <button
                      type="button"
                      disabled={!whyThisMattersText}
                      aria-label="Why this matters"
                      onClick={() => {
                        if (!whyThisMattersText) return;
                        setIsWhyThisMattersOpen((open) => !open);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#d9e4f5] bg-[#f4f7fc] px-3 py-1.5 text-xs font-semibold text-[#4d6c98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#b8cceb] text-[10px] text-[#5f7fb4]">
                        i
                      </span>
                      <span className="hidden sm:inline">Why this matters</span>
                    </button>
                    {whyThisMattersText && isWhyThisMattersOpen ? (
                      <div className="absolute right-0 top-full z-20 mt-2 w-[351px] max-w-[calc(100vw-2rem)] rounded-lg border border-[#d9e4f5] bg-white p-4 text-sm text-[#3f5677] shadow-lg">
                        {whyThisMattersText}
                      </div>
                    ) : null}
                  </div>
                  </div>
                </div>

                <div className="rounded-lg border border-[#e2e8f5] bg-white p-2">
                  <p className="break-words px-2 py-1 text-[28px] leading-[1.15] font-semibold text-[#1f2d45] sm:text-[44px] sm:leading-[1.1]">
                    {activeQuestion.question_title || activeQuestion.legal_requirement || 'Question'}
                  </p>
                  <div className="mt-3 grid gap-2 md:grid-cols-4">
                    <div className="rounded-md bg-[#f7f9fe] p-2 text-xs">
                      <p className="text-[#607594]">Audit Type</p>
                      <p className="mt-1 font-semibold text-[#1f2d45]">{activeQuestion.audit_type || '-'}</p>
                    </div>
                    <div className="rounded-md bg-[#f7f9fe] p-2 text-xs">
                      <p className="text-[#607594]">Section</p>
                      <p className="mt-1 font-semibold text-[#1f2d45]">{activeQuestion.sectionTitle}</p>
                    </div>
                    <div className="rounded-md bg-[#f7f9fe] p-2 text-xs">
                      <p className="text-[#607594]">Question ID</p>
                      <p className="mt-1 font-semibold text-[#1f2d45]">{activeQuestion.question_id ?? activeQuestion.id}</p>
                    </div>
                    <div className="rounded-md bg-[#f7f9fe] p-2 text-xs">
                      <p className="text-[#607594]">Severity</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 font-semibold capitalize text-[#b23a4f]">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#d95c71]" />
                        {activeQuestion.security_level ?? '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Legal Requirement</p>
                    <p className="mt-2 text-sm text-[#2a3d5f]">
                      {activeQuestion.legal_requirement || '-'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Explanation</p>
                    {sanitizedExplanationHtml ? (
                      <div
                        className="mt-2 space-y-1 text-sm text-[#2a3d5f] [&_li]:ml-4 [&_ol]:list-decimal [&_p]:leading-6 [&_ul]:list-disc"
                        dangerouslySetInnerHTML={{ __html: sanitizedExplanationHtml }}
                      />
                    ) : (
                      <p className="mt-2 text-sm text-[#2a3d5f]">-</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-[2fr_1fr]">
                  <div className="rounded-lg border border-[#d7e7d9] bg-[#eef7ef] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#3f7a4b]">Expected Implementation</p>
                    {sanitizedExpectedImplementationHtml ? (
                      <div
                        className="mt-2 space-y-1 text-sm text-[#2f5c38] [&_li]:ml-4 [&_ol]:list-decimal [&_p]:leading-6 [&_ul]:list-disc"
                        dangerouslySetInnerHTML={{ __html: sanitizedExpectedImplementationHtml }}
                      />
                    ) : (
                      <p className="mt-2 text-sm text-[#2f5c38]">No expected implementation details provided.</p>
                    )}
                  </div>
                  <div className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Example Evidence</p>
                    {(isHttpUrl(activeQuestion.illustrative_image_id) ||
                      (activeQuestion.illustrative_image_id && previewUrlsByMediaId[activeQuestion.illustrative_image_id])) ? (
                      <div className="mt-2 w-full max-w-[220px] overflow-hidden rounded-md border border-[#dbe4f4] bg-white">
                        <img
                          src={
                            isHttpUrl(activeQuestion.illustrative_image_id)
                              ? activeQuestion.illustrative_image_id ?? ''
                              : previewUrlsByMediaId[activeQuestion.illustrative_image_id ?? ''] ?? ''
                          }
                          alt="Example evidence"
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-[#607594]">
                        {activeQuestion.illustrative_image_id
                          ? previewErrorsByMediaId[activeQuestion.illustrative_image_id]
                            ? `Preview unavailable for media ${activeQuestion.illustrative_image_id}: ${previewErrorsByMediaId[activeQuestion.illustrative_image_id]}`
                            : 'Image ID received, but no image URL is available yet.'
                          : 'No example evidence image provided.'}
                      </p>
                    )}
                  </div>
                </div>

                {activeQuestion.admin_note ? (
                  <div className="mt-3 rounded-lg border border-[#e7e2ba] bg-[#fffbea] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8c6f1e]">Admin Guidance</p>
                    <p className="mt-2 whitespace-pre-line text-sm text-[#685527]">{activeQuestion.admin_note}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm text-[#607594]">No questions available for this assessment.</p>
            )}

            {activeQuestion && !isSubmittedChecklist ? (
              <>
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-semibold text-[#1f2d45]">Your answer</p>
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 text-sm">
                    {answerOptionsForActive.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          // Update UI immediately for better UX
                          setAnswers((prev) => ({
                            ...prev,
                            [activeQuestion.id]: {
                              answer: option.value,
                              note_text: prev[activeQuestion.id]?.note_text ?? '',
                            },
                          }));
                          
                          // Auto-save the answer to backend
                          void handleAutoSaveAnswer(option.value);
                        }}
                        className={`rounded-lg border px-3 py-3 text-left relative ${
                          activeAnswer?.answer === option.value
                            ? 'border-[#95c9a0] bg-[#eff8f0] text-[#2f5c38]'
                            : 'border-[#d4dced] bg-white text-[#3f5677] hover:bg-[#f6f9ff]'
                        }`}
                        disabled={autoSaving[activeQuestion.id] || false}
                      >
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-xs opacity-80">{option.description || 'Select this answer'}</p>
                        {autoSaving[activeQuestion.id] && (
                          <div className="absolute top-1 right-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {isNoteEnabledForActiveQuestion ? (
                    <>
                      <p className="text-sm font-semibold text-[#1f2d45]">Add a note <span className="font-normal text-[#7b88a3]">(optional)</span></p>
                      <textarea
                        value={activeAnswer?.note_text ?? ''}
                        onChange={(event) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [activeQuestion.id]: {
                              answer: prev[activeQuestion.id]?.answer ?? '',
                              note_text: event.target.value,
                            },
                          }))
                        }
                        placeholder="Write your note here..."
                        className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                        rows={3}
                      />
                    </>
                  ) : null}
                </div>

                {isEvidenceEnabledForActiveQuestion ? (
                  <div className="mt-4 rounded-lg border border-[#dbe4f4] bg-[#f9fbff] p-3">
                    <p className="text-sm font-semibold text-[#1f2d45]">Upload evidence <span className="font-normal text-[#7b88a3]">(optional)</span></p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        onChange={(event) => setSelectedEvidenceFiles(prev => ({ 
                          ...prev, 
                          [activeQuestion.id]: event.target.files?.[0] ?? null 
                        }))}
                        className="max-w-full rounded-lg border border-[#d4dced] bg-white px-2 py-1 text-xs text-[#3f5677]"
                      />
                      <button
                        type="button"
                        onClick={() => void onUploadEvidence()}
                        disabled={!!showUploadProgress || !selectedEvidenceFiles[activeQuestion.id]}
                        className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {showUploadProgress === activeQuestion.id ? 'Uploading…' : 'Upload evidence'}
                      </button>
                    </div>
                    {/* Display existing evidence files from backend */}
                    {existingEvidenceFiles[activeQuestion.id]?.map((evidenceFile) => (
                      <div key={evidenceFile.id} className="mt-2 max-w-[160px] overflow-visible rounded-md border border-[#dbe4f4] bg-white">
                        <div className="relative">
                          <div className="absolute right-[-4px] top-[-4px] z-50 flex gap-1">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-800" title={`Scan status: ${evidenceFile.scan_status}`}>
                              ✓
                            </span>
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-800" title={`Encryption: ${evidenceFile.encryption_status}`}>
                              🔒
                            </span>
                          </div>
                          <div className="p-2">
                            <p className="truncate text-xs font-medium text-[#1f2d45]">{evidenceFile.filename}</p>
                            <p className="mt-1 text-xs text-[#607594]">{(evidenceFile.file_size / 1024 / 1024).toFixed(2)} MB</p>
                            <p className="mt-1 text-xs text-[#607594]">{evidenceFile.mime_type}</p>
                            {evidenceFile.uploaded_at && (
                              <p className="mt-1 text-xs text-[#607594]">
                                Uploaded: {new Date(evidenceFile.uploaded_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Display new file preview */}
                    {(() => {
                      const selectedFile = selectedEvidenceFiles[activeQuestion.id];
                      const previewUrl = evidencePreviewUrls[activeQuestion.id];
                      if (!selectedFile || !previewUrl) return null;
                      
                      return (
                        <div className="mt-2 max-w-[160px] overflow-visible rounded-md border border-[#dbe4f4] bg-white">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEvidenceFiles(prev => ({ ...prev, [activeQuestion.id]: null }));
                              }}
                              aria-label="Remove evidence preview"
                              className="absolute right-[-4px] top-[-4px] z-50 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ffffff]/90 text-lg font-semibold text-[#243555] shadow hover:bg-[#ffffff]"
                            >
                              ×
                            </button>
                            {selectedFile.type.startsWith('image/') ? (
                              <img
                                src={previewUrl}
                                alt="Evidence preview"
                                className="h-12 w-full object-cover"
                              />
                            ) : selectedFile.type === 'application/pdf' ? (
                              <iframe
                                src={previewUrl}
                                title="Evidence preview (PDF)"
                                className="h-20 w-full"
                              />
                            ) : (
                              <p className="p-2 text-xs text-[#607594]">
                                Preview not available. {selectedFile.name}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    {/* Only show save button if auto-save failed or for manual override */}
                    {!autoSaving[activeQuestion.id] && (
                      <button
                        type="button"
                        onClick={() => void onSaveAnswer()}
                        disabled={loading}
                        className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading
                          ? 'Saving…'
                          : activeQuestion && persistedAnswerByQuestionId[activeQuestion.id]
                            ? 'Update Answer'
                            : 'Save Answer'}
                      </button>
                    )}
                    {autoSaving[activeQuestion.id] && (
                      <div className="flex items-center gap-2 text-sm text-[#607594]">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span>Auto-saving...</span>
                      </div>
                    )}
                    {isOnLastQuestion ? (
                      <button
                        type="button"
                        onClick={() => void onSubmitAssessment()}
                        disabled={loading || submittingAssessment || !areAllQuestionsAnswered}
                        className="rounded-lg border border-[#2f9960] bg-[#e9f8ef] px-3 py-2 text-sm text-[#2f9960] disabled:cursor-not-allowed disabled:opacity-60"
                        title={
                          areAllQuestionsAnswered
                            ? 'Submit completed assessment'
                            : 'Answer all questions in all sections before submitting'
                        }
                      >
                        {submittingAssessment ? 'Submitting…' : 'Submit Assessment'}
                      </button>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                  {isOnLastQuestionOfSection && nextSectionWithQuestions ? (
                    <button
                      type="button"
                      onClick={goToNextSection}
                      className="rounded-lg border border-[#2f4f83] bg-[#eef4ff] px-3 py-2 text-sm font-semibold text-[#2f4f83] hover:bg-[#e2ecff]"
                    >
                      Next Section
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => goToQuestionByIndex(activeQuestionIndex - 1)}
                    disabled={!hasPreviousQuestion}
                    className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      goToQuestionByIndex(activeQuestionIndex + 1);
                      scrollQuestionPanelToTop();
                    }}
                    disabled={!hasNextQuestion}
                    className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-white hover:bg-[#223657] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                  </button>
                  </div>
                </div>
              </>
            ) : null}

            {message ? <p className="mt-3 text-sm text-[#2f9960]">{message}</p> : null}
            {error ? <p className="mt-3 text-sm text-[#c43e53]">{error}</p> : null}
          </article>

        </div>
      </section>

      {/* Secure Upload Progress Modal */}
      {showUploadProgress && (() => {
        const currentQuestionId = showUploadProgress;
        const selectedFile = selectedEvidenceFiles[currentQuestionId];
        if (!selectedFile) return null;
        
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md">
              <SecureUploadProgress
                fileName={selectedFile.name}
                fileSize={selectedFile.size}
                onComplete={(result) => {
                  setShowUploadProgress(null);
                  toast.success('Evidence uploaded successfully!');
                  setSelectedEvidenceFiles(prev => ({ ...prev, [currentQuestionId]: null }));
                }}
                onError={(error) => {
                  setShowUploadProgress(null);
                  toast.error(error);
                }}
              />
            </div>
          </div>
        );
      })()}
    </section>
  );
}
