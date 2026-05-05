'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminAccess } from '@/lib/admin-access';
import {
  createQuestion,
  createSection,
  deleteQuestion,
  deleteSection,
  getChecklistById,
  getQuestionsBySection,
  getSectionsByChecklist,
  reorderSections,
  reorderQuestions,
  uploadChecklistQuestionMedia,
  updateQuestion as updateQuestionApi,
  updateSection as updateSectionApi,
} from '@/lib/checklist-api';
import { getMediaPreviewUrl } from '@/lib/assessment';
import { ADMIN_BUILDER_HEADER_TITLE_CLASS } from '@/app/(app)/admin/admin-page-title';

type RiskLevel = 'low' | 'medium' | 'high';
type AnswerLogic = 'answer_only' | 'answer_with_adjustment';

type PanelAnswerOption = {
  label: string;
  score: string;
  choiceCode: string;
  description: string;
  illustrativeImageId: string;
};

type PanelQuestion = {
  id: string;
  questionId: string;
  questionTitle: string;
  securityLevel: RiskLevel;
  points: string;
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
  answerLogic: AnswerLogic;
  auditType: string;
  parentQuestionId: string;
  evidenceEnabled: boolean;
  noteEnabled: boolean;
  note: string;
  illustrativeImageId: string;
  answerOptions: PanelAnswerOption[];
};

type PanelSection = {
  id: string;
  title: string;
  order: number;
  sourceRef: string;
  questions: PanelQuestion[];
};

type SelectedNode =
  | { type: 'checklist' }
  | { type: 'createSection' }
  | { type: 'createQuestion'; sectionId: string }
  | { type: 'section'; sectionId: string }
  | { type: 'question'; sectionId: string; questionId: string };

const cardClass = 'rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[#607594]';
const inputClass = 'w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]';
const textAreaClass = `${inputClass} min-h-[96px]`;
const sectionHeadingClass =
  'mb-3 border-b border-[#e2e8f5] pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6a7f9d]';
const checkboxClass =
  'h-4 w-4 cursor-pointer rounded border-[#9db2d6] bg-white text-[#2f7dff] accent-[#2f7dff] [color-scheme:light] focus:ring-2 focus:ring-[#2f7dff]/30 focus:ring-offset-0';

function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 90,
  hasError = false,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  minHeight?: number;
  hasError?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  function runCommand(command: 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList' | 'removeFormat') {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand(command);

    // `removeFormat` does not remove list wrappers in contentEditable.
    // Explicitly toggle off active list modes so bullets/numbering are cleared.
    if (command === 'removeFormat') {
      if (document.queryCommandState('insertUnorderedList')) {
        document.execCommand('insertUnorderedList');
      }
      if (document.queryCommandState('insertOrderedList')) {
        document.execCommand('insertOrderedList');
      }
    }

    onChange(editor.innerHTML);
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className={labelClass}>{label}</label>
        <span className="rounded-full bg-[#e6f1fb] px-2 py-0.5 text-[10px] font-semibold text-[#185fa5]">Rich text</span>
      </div>
      <div
        className={`overflow-hidden rounded-xl border bg-white focus-within:border-[#3e69b0] ${
          hasError ? 'border-[#d45f6b] ring-1 ring-[#d45f6b]/30' : 'border-[#d4dced]'
        }`}
      >
        <div className="flex items-center gap-1 border-b border-[#e2e8f5] bg-[#f7f9fe] px-2 py-1">
          <button type="button" className="h-6 w-6 rounded text-xs hover:bg-white" onClick={() => runCommand('bold')}>
            <span className="font-bold">B</span>
          </button>
          <button type="button" className="h-6 w-6 rounded text-xs italic hover:bg-white" onClick={() => runCommand('italic')}>
            I
          </button>
          <button type="button" className="h-6 w-6 rounded text-xs underline hover:bg-white" onClick={() => runCommand('underline')}>
            U
          </button>
          <div className="mx-1 h-4 w-px bg-[#d4dced]" />
          <button type="button" className="h-6 w-6 rounded text-xs hover:bg-white" onClick={() => runCommand('insertUnorderedList')}>
            •
          </button>
          <button type="button" className="h-6 w-6 rounded text-xs hover:bg-white" onClick={() => runCommand('insertOrderedList')}>
            1.
          </button>
          <div className="mx-1 h-4 w-px bg-[#d4dced]" />
          <button type="button" className="h-6 w-6 rounded text-xs hover:bg-white" onClick={() => runCommand('removeFormat')}>
            x
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={(event) => onChange((event.currentTarget as HTMLDivElement).innerHTML)}
          className="px-3 py-2 text-sm text-[#25375a] outline-none [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5"
          style={{ minHeight }}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}

function makeQuestion(index: number): PanelQuestion {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    questionId: '',
    questionTitle: '',
    securityLevel: 'low',
    points: '',
    legalRequirementTitle: '',
    legalRequirementDescription: '',
    explanation: '',
    expectedImplementation: '',
    howItWorks: '',
    guidanceScore4: '',
    guidanceScore3: '',
    guidanceScore2: '',
    guidanceScore1: '',
    recommendationTemplate: '',
    answerLogic: 'answer_only',
    auditType: 'compliance',
    parentQuestionId: '',
    evidenceEnabled: false,
    noteEnabled: false,
    note: '',
    illustrativeImageId: '',
    answerOptions: [
      { label: 'Yes', score: '4', choiceCode: 'YES', description: 'Control is fully implemented.', illustrativeImageId: '' },
      { label: 'Maybe', score: '3', choiceCode: 'MAYBE', description: 'Control is partially implemented or uncertain.', illustrativeImageId: '' },
      { label: 'Sure', score: '2', choiceCode: 'SURE', description: 'Control is confidently implemented.', illustrativeImageId: '' },
      { label: 'No', score: '1', choiceCode: 'NO', description: 'Control is not implemented.', illustrativeImageId: '' },
    ],
  };
}

function fixedScoreForAnswer(index: number): string {
  return String(Math.max(1, 4 - index));
}

function mapApiQuestionToPanelQuestion(question: {
  id: string;
  questionId: string;
  questionTitle?: string;
  securityLevel: RiskLevel;
  legalRequirementTitle?: string;
  legalRequirementDescription?: string;
  legalRequirement: string;
  explanation: string;
  expectedImplementation: string;
  howItWorks?: string;
  guidanceScore4?: string;
  guidanceScore3?: string;
  guidanceScore2?: string;
  guidanceScore1?: string;
  recommendationTemplate?: string;
  answerLogic?: AnswerLogic;
  auditType?: string;
  parentQuestionId?: string | null;
  evidenceEnabled?: boolean;
  noteEnabled?: boolean;
  note: string | null;
  illustrativeImageId?: string | null;
  answerOptions?: Array<{
    label: string;
    score: number;
    choiceCode?: string;
    description?: string;
    illustrativeImageId?: string | null;
  }>;
  points?: number;
}): PanelQuestion {
  const fallbackAnswers = makeQuestion(1).answerOptions;
  const safeQuestionId = String(question.questionId ?? '').trim() || `question_${Math.random().toString(36).slice(2, 7)}`;
  const safeQuestionTitle = String(question.questionTitle ?? '').trim();
  const safeLegalTitle = String(question.legalRequirementTitle ?? question.legalRequirement ?? '');
  const safeLegalDescription = String(question.legalRequirementDescription ?? question.legalRequirement ?? '');
  return {
    id: question.id,
    questionId: safeQuestionId,
    questionTitle: safeQuestionTitle,
    securityLevel: question.securityLevel,
    points: question.points != null ? String(question.points) : '',
    legalRequirementTitle: safeLegalTitle,
    legalRequirementDescription: safeLegalDescription,
    explanation: String(question.explanation ?? ''),
    expectedImplementation: String(question.expectedImplementation ?? ''),
    howItWorks: String(question.howItWorks ?? ''),
    guidanceScore4: String(question.guidanceScore4 ?? ''),
    guidanceScore3: String(question.guidanceScore3 ?? ''),
    guidanceScore2: String(question.guidanceScore2 ?? ''),
    guidanceScore1: String(question.guidanceScore1 ?? ''),
    recommendationTemplate: String(question.recommendationTemplate ?? ''),
    answerLogic: question.answerLogic ?? 'answer_only',
    auditType: String(question.auditType ?? ''),
    parentQuestionId: String(question.parentQuestionId ?? ''),
    evidenceEnabled: Boolean(question.evidenceEnabled),
    noteEnabled: Boolean(question.noteEnabled),
    note: String(question.note ?? ''),
    illustrativeImageId: String(question.illustrativeImageId ?? ''),
    answerOptions:
      question.answerOptions && question.answerOptions.length >= 4
        ? question.answerOptions.slice(0, 4).map((option, index) => ({
            label: String(option.label ?? `Answer ${index + 1}`),
            score: fixedScoreForAnswer(index),
            choiceCode: String(option.choiceCode ?? option.label ?? `OPTION_${index + 1}`),
            description: String(option.description ?? option.label ?? `Answer ${index + 1}`),
            illustrativeImageId: String(option.illustrativeImageId ?? ''),
          }))
        : fallbackAnswers,
  };
}

export default function ChecklistPanelBuilderPage() {
  const params = useParams<{ checklistId: string }>();
  const checklistId = String(params.checklistId);
  const { isReadOnly } = useAdminAccess();

  const [title, setTitle] = useState('Checklist Builder Draft');
  const [lawDecree, setLawDecree] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [sections, setSections] = useState<PanelSection[]>([
    {
      id: 's-1',
      title: 'Section 1',
      order: 1,
      sourceRef: '',
      questions: [makeQuestion(1)],
    },
  ]);
  const [selected, setSelected] = useState<SelectedNode>({ type: 'checklist' });
  const [loadingChecklist, setLoadingChecklist] = useState(true);
  const [loadingSections, setLoadingSections] = useState(true);
  const [sectionActionLoading, setSectionActionLoading] = useState<'create' | 'save' | 'delete' | ''>('');
  const [questionActionLoading, setQuestionActionLoading] = useState<'create' | 'save' | 'delete' | ''>('');
  const [addingQuestionSectionId, setAddingQuestionSectionId] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionOrder, setNewSectionOrder] = useState('1');
  const [newSectionSourceRef, setNewSectionSourceRef] = useState('');
  const [addQuestionSectionId, setAddQuestionSectionId] = useState('');
  const [newQuestionDraft, setNewQuestionDraft] = useState<PanelQuestion>(makeQuestion(1));
  const [confirmDeleteSectionId, setConfirmDeleteSectionId] = useState<string | null>(null);
  const [confirmDeleteQuestionTarget, setConfirmDeleteQuestionTarget] = useState<{
    sectionId: string;
    questionId: string;
    isSubQuestion: boolean;
  } | null>(null);
  const [uploadingMediaKey, setUploadingMediaKey] = useState<string | null>(null);
  const [newQuestionImagePreviewUrl, setNewQuestionImagePreviewUrl] = useState('');
  const [editQuestionImagePreview, setEditQuestionImagePreview] = useState<{ questionId: string; url: string } | null>(null);
  const [previewUrlsByMediaId, setPreviewUrlsByMediaId] = useState<Record<string, string>>({});
  const [previewErrorsByMediaId, setPreviewErrorsByMediaId] = useState<Record<string, string>>({});
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<string[]>([]);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [reorderingSections, setReorderingSections] = useState(false);
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);
  const [reorderingQuestionsSectionId, setReorderingQuestionsSectionId] = useState<string | null>(null);
  const [createQuestionMissingFields, setCreateQuestionMissingFields] = useState<string[]>([]);
  const [editQuestionMissingFields, setEditQuestionMissingFields] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    function openSidebarOnLargeScreens() {
      if (mq.matches) setSidebarOpen(true);
    }
    openSidebarOnLargeScreens();
    mq.addEventListener('change', openSidebarOnLargeScreens);
    return () => mq.removeEventListener('change', openSidebarOnLargeScreens);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    if (
      selected.type === 'section' ||
      selected.type === 'question' ||
      selected.type === 'createSection' ||
      selected.type === 'createQuestion'
    ) {
      setSidebarOpen(false);
    }
  }, [selected]);

  useEffect(() => {
    return () => {
      if (newQuestionImagePreviewUrl) {
        URL.revokeObjectURL(newQuestionImagePreviewUrl);
      }
      if (editQuestionImagePreview?.url) {
        URL.revokeObjectURL(editQuestionImagePreview.url);
      }
    };
  }, [newQuestionImagePreviewUrl, editQuestionImagePreview]);

  useEffect(() => {
    if (selected.type !== 'createQuestion') {
      setCreateQuestionMissingFields([]);
    }
    if (selected.type !== 'question') {
      setEditQuestionMissingFields([]);
    }
  }, [selected]);

  useEffect(() => {
    let cancelled = false;
    async function loadChecklist() {
      setLoadingChecklist(true);
      try {
        const data = await getChecklistById(checklistId);
        if (cancelled) return;
        setTitle(data.title);
        setLawDecree(data.lawDecree);
        setStatus(data.status);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Failed to load checklist');
        }
      } finally {
        if (!cancelled) {
          setLoadingChecklist(false);
        }
      }
    }
    void loadChecklist();
    return () => {
      cancelled = true;
    };
  }, [checklistId]);

  useEffect(() => {
    let cancelled = false;
    async function loadSections() {
      setLoadingSections(true);
      try {
        const data = await getSectionsByChecklist(checklistId);
        const sortedSections = data.sort((a, b) => a.order - b.order);

        const questionResults = await Promise.all(
          sortedSections.map(async (section) => {
            try {
              const questions = await getQuestionsBySection(checklistId, section.id);
              const mappedQuestions = questions
                .map((question) => {
                  try {
                    return mapApiQuestionToPanelQuestion(question);
                  } catch {
                    return null;
                  }
                })
                .filter((question): question is PanelQuestion => Boolean(question));
              return { sectionId: section.id, questions: mappedQuestions, failed: false };
            } catch {
              // Some backends return error for empty section questions. Treat as no questions.
              return { sectionId: section.id, questions: [], failed: true };
            }
          }),
        );

        const questionMap: Record<string, ReturnType<typeof mapApiQuestionToPanelQuestion>[]> = {};
        const failedCount = questionResults.filter((result) => result.failed).length;
        questionResults.forEach((result) => {
          questionMap[result.sectionId] = result.questions;
        });

        if (cancelled) return;
        const nextSections = sortedSections.map((section) => ({
          id: section.id,
          title: section.title,
          order: section.order,
          sourceRef: section.sourceRef ?? '',
          questions: questionMap[section.id] ?? [],
        }));
        setSections(nextSections);
        setSelected((previous) => {
          if (!nextSections.length) return { type: 'checklist' };
          if (previous.type === 'checklist') {
            return { type: 'section', sectionId: nextSections[0].id };
          }
          return previous;
        });
        if (failedCount > 0 && failedCount < sortedSections.length) {
          toast.message('Some sections have no question data yet.');
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Failed to load sections');
          setSections([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingSections(false);
        }
      }
    }
    void loadSections();
    return () => {
      cancelled = true;
    };
  }, [checklistId]);

  const selectedSection = useMemo(
    () =>
      selected.type === 'section' || selected.type === 'question'
        ? sections.find((section) => section.id === selected.sectionId) ?? null
        : null,
    [sections, selected],
  );

  const selectedQuestion = useMemo(
    () =>
      selected.type === 'question'
        ? selectedSection?.questions.find((question) => question.id === selected.questionId) ?? null
        : null,
    [selected, selectedSection],
  );

  const parentQuestionForDraft = useMemo(() => {
    if (!newQuestionDraft.parentQuestionId) return null;
    return (
      sections
        .flatMap((section) => section.questions)
        .find((question) => question.id === newQuestionDraft.parentQuestionId) ?? null
    );
  }, [newQuestionDraft.parentQuestionId, sections]);

  const orderedSections = useMemo(
    () => sections.slice().sort((a, b) => a.order - b.order),
    [sections],
  );
  const isBuilderLoading = loadingChecklist || loadingSections;

  function updateSection(sectionId: string, patch: Partial<PanelSection>) {
    setSections((previous) =>
      previous.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)),
    );
  }

  function updateQuestion(sectionId: string, questionId: string, patch: Partial<PanelQuestion>) {
    setSections((previous) =>
      previous.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId ? { ...question, ...patch } : question,
              ),
            },
      ),
    );
  }

  function buildAnswerOptionsPayload(question: PanelQuestion) {
    return question.answerOptions.map((option, index) => ({
      position: index + 1,
      label: option.label.trim() || `Answer ${index + 1}`,
      score: Number.parseInt(fixedScoreForAnswer(index), 10),
      choiceCode: (option.choiceCode.trim() || option.label.trim() || `OPTION_${index + 1}`)
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_'),
      description: option.description.trim() || option.label.trim() || `Answer ${index + 1}`,
      illustrativeImageId: option.illustrativeImageId.trim() || null,
    }));
  }

  function addSection() {
    const nextOrder = sections.reduce((max, section) => Math.max(max, section.order), 0) + 1;
    setNewSectionTitle(`Section ${nextOrder}`);
    setNewSectionOrder(String(nextOrder));
    setNewSectionSourceRef('');
    setSelected({ type: 'createSection' });
  }

  async function handleConfirmCreateSection() {
    const title = newSectionTitle.trim();
    const order = Number.parseInt(newSectionOrder, 10);
    if (!title || !order || order < 1) {
      toast.error('Please provide valid section title and order.');
      return;
    }
    const hasDuplicateOrder = sections.some((section) => section.order === order);
    if (hasDuplicateOrder) {
      toast.error(`Display order ${order} already exists. Please choose a different order.`);
      return;
    }
    setSectionActionLoading('create');
    try {
      const created = await createSection(checklistId, { title, order, sourceRef: newSectionSourceRef.trim() });
      const newSection: PanelSection = {
        id: created.id,
        title: created.title,
        order: created.order,
        sourceRef: created.sourceRef ?? '',
        questions: [],
      };
      setSections((previous) => [...previous, newSection]);
      setSelected({ type: 'section', sectionId: newSection.id });
      setNewSectionTitle('');
      setNewSectionOrder('1');
      setNewSectionSourceRef('');
      toast.success('Section created.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create section');
    } finally {
      setSectionActionLoading('');
    }
  }

  async function handleSaveSection(sectionId: string) {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    setSectionActionLoading('save');
    try {
      const saved = await updateSectionApi(checklistId, sectionId, {
        title: section.title,
        order: section.order,
        sourceRef: section.sourceRef,
      });
      setSections((previous) =>
        previous.map((item) =>
          item.id === sectionId
            ? { ...item, title: saved.title, order: saved.order, sourceRef: saved.sourceRef ?? '' }
            : item,
        ),
      );
      toast.success('Section saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save section');
    } finally {
      setSectionActionLoading('');
    }
  }

  async function handleDeleteSection(sectionId: string) {
    setSectionActionLoading('delete');
    try {
      await deleteSection(checklistId, sectionId);
      setSections((previous) => previous.filter((item) => item.id !== sectionId));
      setSelected({ type: 'checklist' });
      setConfirmDeleteSectionId(null);
      toast.success('Section deleted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete section');
    } finally {
      setSectionActionLoading('');
    }
  }

  function buildUniqueQuestionId(parentQuestionId?: string): string {
    const existingIds = new Set(
      sections
        .flatMap((section) => section.questions.map((question) => question.questionId.trim()))
        .filter(Boolean),
    );

    if (parentQuestionId) {
      const parent = sections.flatMap((section) => section.questions).find((question) => question.id === parentQuestionId);
      const parentCode = parent?.questionId?.trim() || 'question';
      let suffix = 1;
      let candidate = `${parentCode}_${suffix}`;
      while (existingIds.has(candidate)) {
        suffix += 1;
        candidate = `${parentCode}_${suffix}`;
      }
      return candidate;
    }

    let counter = 1;
    let candidate = `question_${counter}`;
    while (existingIds.has(candidate)) {
      counter += 1;
      candidate = `question_${counter}`;
    }
    return candidate;
  }

  function getQuestionDepthInSection(section: PanelSection, questionId: string): number {
    const byId = new Map(section.questions.map((question) => [question.id, question] as const));
    let depth = 0;
    let current = byId.get(questionId);
    while (current?.parentQuestionId) {
      const parent = byId.get(current.parentQuestionId);
      if (!parent) break;
      depth += 1;
      current = parent;
    }
    return depth;
  }

  function addQuestion(sectionId: string, parentQuestionId?: string) {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;
    if (parentQuestionId) {
      const parentDepth = getQuestionDepthInSection(section, parentQuestionId);
      if (parentDepth >= 1) {
        toast.error('Subquestions cannot have subquestions.');
        return;
      }
    }
    const nextIndex = (section?.questions.length ?? 0) + 1;
    setAddQuestionSectionId(sectionId);
    const nextDraft = makeQuestion(nextIndex);
    if (parentQuestionId) {
      nextDraft.parentQuestionId = parentQuestionId;
    }
    setNewQuestionDraft(nextDraft);
    setSelected({ type: 'createQuestion', sectionId });
  }

  function getSectionQuestionHierarchy(
    section: PanelSection,
  ): Array<{ question: PanelQuestion; displayCode: string; isSubQuestion: boolean; depth: number }> {
    const byParent = new Map<string, PanelQuestion[]>();
    const roots: PanelQuestion[] = [];
    const ids = new Set(section.questions.map((question) => question.id));

    section.questions.forEach((question) => {
      const parentId = question.parentQuestionId?.trim();
      if (parentId && ids.has(parentId)) {
        const siblings = byParent.get(parentId) ?? [];
        siblings.push(question);
        byParent.set(parentId, siblings);
      } else {
        roots.push(question);
      }
    });

    const ordered: Array<{ question: PanelQuestion; displayCode: string; isSubQuestion: boolean; depth: number }> = [];
    const visit = (question: PanelQuestion, displayCode: string, isSubQuestion: boolean, depth: number) => {
      if (depth > 1) return;
      ordered.push({ question, displayCode, isSubQuestion, depth });
      const children = byParent.get(question.id) ?? [];
      if (depth >= 1) return;
      children.forEach((child, childIndex) => {
        visit(child, `${displayCode}.${childIndex + 1}`, true, depth + 1);
      });
    };

    roots.forEach((root, rootIndex) => {
      visit(root, `${rootIndex + 1}`, false, 0);
    });
    return ordered;
  }

  async function handleConfirmCreateQuestion() {
    if (!addQuestionSectionId) return;
    if (uploadingMediaKey === 'create-question-image') {
      toast.error('Please wait until example image upload completes.');
      return;
    }
    const draftQuestion = newQuestionDraft;
    const derivedPoints = draftQuestion.securityLevel === 'low' ? 1 : draftQuestion.securityLevel === 'medium' ? 3 : 4;
    const missingFields = [] as string[];
    if (!draftQuestion.questionId.trim() && !draftQuestion.questionTitle.trim()) missingFields.push('questionTitle');
    if (!draftQuestion.legalRequirementDescription.trim()) missingFields.push('legalRequirementDescription');
    if (!draftQuestion.explanation.trim()) missingFields.push('explanation');
    if (!draftQuestion.expectedImplementation.trim()) missingFields.push('expectedImplementation');

    // Validate answer labels and descriptions
    const missingAnswerLabels: number[] = [];
    const missingAnswerDescriptions: number[] = [];
    draftQuestion.answerOptions.forEach((opt, idx) => {
      if (!String(opt.label ?? '').trim()) missingAnswerLabels.push(idx);
      if (!String(opt.description ?? '').trim()) missingAnswerDescriptions.push(idx);
    });

    // Compose missing fields for UI highlighting
    const answerFieldKeys: string[] = [];
    missingAnswerLabels.forEach((i) => answerFieldKeys.push(`answer_label_${i}`));
    missingAnswerDescriptions.forEach((i) => answerFieldKeys.push(`answer_description_${i}`));
    const allMissing = [...missingFields, ...answerFieldKeys];
    if (allMissing.length > 0) {
      setCreateQuestionMissingFields(allMissing);
      if (missingFields.includes('questionTitle')) {
        toast.error('Please fill title');
        return;
      }
      if (missingAnswerLabels.length > 0) {
        toast.error('Please fill answer');
        return;
      }
      if (missingAnswerDescriptions.length > 0) {
        toast.error('Please fill description');
        return;
      }
      // Fallback
      toast.error('Please fill required question fields.');
      return;
    }
    setCreateQuestionMissingFields([]);
    setQuestionActionLoading('create');
    setAddingQuestionSectionId(addQuestionSectionId);
    try {
      const created = await createQuestion(checklistId, addQuestionSectionId, {
        questionId: draftQuestion.questionId,
        questionTitle: draftQuestion.questionTitle || draftQuestion.questionId,
        parentQuestionId: draftQuestion.parentQuestionId || undefined,
        securityLevel: draftQuestion.securityLevel,
        auditType: draftQuestion.auditType,
        legalRequirementTitle: draftQuestion.legalRequirementTitle,
        legalRequirementDescription: draftQuestion.legalRequirementDescription,
        legalRequirement: draftQuestion.legalRequirementDescription || draftQuestion.legalRequirementTitle,
        explanation: draftQuestion.explanation,
        expectedImplementation: draftQuestion.expectedImplementation,
        howItWorks: draftQuestion.howItWorks,
        guidanceScore4: draftQuestion.guidanceScore4,
        guidanceScore3: draftQuestion.guidanceScore3,
        guidanceScore2: draftQuestion.guidanceScore2,
        guidanceScore1: draftQuestion.guidanceScore1,
        recommendationTemplate: draftQuestion.recommendationTemplate,
        answerLogic: draftQuestion.answerLogic,
        evidenceEnabled: draftQuestion.evidenceEnabled,
        noteEnabled: draftQuestion.noteEnabled,
        note: draftQuestion.note || null,
        illustrativeImageId: draftQuestion.illustrativeImageId || undefined,
        points: derivedPoints,
        answerOptions: buildAnswerOptionsPayload(draftQuestion),
      });
      const newQuestion = mapApiQuestionToPanelQuestion(created);
      setSections((previous) =>
        previous.map((item) =>
          item.id === addQuestionSectionId ? { ...item, questions: [...item.questions, newQuestion] } : item,
        ),
      );
      setSelected({ type: 'question', sectionId: addQuestionSectionId, questionId: newQuestion.id });
      setAddQuestionSectionId('');
      toast.success('Question created.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create question');
    } finally {
      setQuestionActionLoading('');
      setAddingQuestionSectionId('');
    }
  }

  async function handleSaveQuestion(sectionId: string, questionId: string) {
    const section = sections.find((item) => item.id === sectionId);
    const question = section?.questions.find((item) => item.id === questionId);
    if (!question) return;
    const missingFields = [] as string[];
    if (!question.questionId.trim() && !question.questionTitle.trim()) missingFields.push('questionTitle');
    if (!question.legalRequirementDescription.trim()) missingFields.push('legalRequirementDescription');
    if (!question.explanation.trim()) missingFields.push('explanation');
    if (!question.expectedImplementation.trim()) missingFields.push('expectedImplementation');

    // Validate answer labels and descriptions
    const missingAnswerLabels: number[] = [];
    const missingAnswerDescriptions: number[] = [];
    question.answerOptions.forEach((opt, idx) => {
      if (!String(opt.label ?? '').trim()) missingAnswerLabels.push(idx);
      if (!String(opt.description ?? '').trim()) missingAnswerDescriptions.push(idx);
    });

    const answerFieldKeys: string[] = [];
    missingAnswerLabels.forEach((i) => answerFieldKeys.push(`answer_label_${i}`));
    missingAnswerDescriptions.forEach((i) => answerFieldKeys.push(`answer_description_${i}`));
    const allMissing = [...missingFields, ...answerFieldKeys];
    if (allMissing.length > 0) {
      setEditQuestionMissingFields(allMissing);
      if (missingFields.includes('questionTitle')) {
        toast.error('Please fill title');
        return;
      }
      if (missingAnswerLabels.length > 0) {
        toast.error('Please fill answer');
        return;
      }
      if (missingAnswerDescriptions.length > 0) {
        toast.error('Please fill description');
        return;
      }
      toast.error('Please fill required question fields.');
      return;
    }
    setEditQuestionMissingFields([]);
    const derivedPoints = question.securityLevel === 'low' ? 1 : question.securityLevel === 'medium' ? 3 : 4;
    setQuestionActionLoading('save');
    try {
      await updateQuestionApi(checklistId, sectionId, questionId, {
        questionId: question.questionId,
        questionTitle: question.questionTitle || question.questionId,
        parentQuestionId: question.parentQuestionId || undefined,
        securityLevel: question.securityLevel,
        auditType: question.auditType,
        legalRequirementTitle: question.legalRequirementTitle,
        legalRequirementDescription: question.legalRequirementDescription,
        legalRequirement: question.legalRequirementDescription || question.legalRequirementTitle,
        explanation: question.explanation,
        expectedImplementation: question.expectedImplementation,
        howItWorks: question.howItWorks,
        guidanceScore4: question.guidanceScore4,
        guidanceScore3: question.guidanceScore3,
        guidanceScore2: question.guidanceScore2,
        guidanceScore1: question.guidanceScore1,
        recommendationTemplate: question.recommendationTemplate,
        answerLogic: question.answerLogic,
        evidenceEnabled: question.evidenceEnabled,
        noteEnabled: question.noteEnabled,
        note: question.note || null,
        illustrativeImageId: question.illustrativeImageId || undefined,
        points: derivedPoints,
        answerOptions: buildAnswerOptionsPayload(question),
      });
      toast.success('Question saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save question');
    } finally {
      setQuestionActionLoading('');
    }
  }

  async function handleDeleteQuestion(sectionId: string, questionId: string) {
    setQuestionActionLoading('delete');
    try {
      await deleteQuestion(checklistId, sectionId, questionId);
      setSections((previous) =>
        previous.map((item) =>
          item.id === sectionId
            ? { ...item, questions: item.questions.filter((question) => question.id !== questionId) }
            : item,
        ),
      );
      setSelected({ type: 'section', sectionId });
      setConfirmDeleteQuestionTarget(null);
      toast.success('Question deleted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete question');
    } finally {
      setQuestionActionLoading('');
    }
  }

  async function uploadQuestionImage(file: File): Promise<string> {
    const uploaded = await uploadChecklistQuestionMedia(file);
    return uploaded.id;
  }

  function isHttpUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  // Generate preview URLs for illustrative images when questions are loaded
  useEffect(() => {
    const allQuestions = sections.flatMap(section => section.questions);
    const mediaIds = new Set<string>();
    
    // Collect all unique illustrative image IDs
    allQuestions.forEach(question => {
      if (question.illustrativeImageId && !isHttpUrl(question.illustrativeImageId)) {
        mediaIds.add(question.illustrativeImageId);
      }
      question.answerOptions.forEach(option => {
        if (option.illustrativeImageId && !isHttpUrl(option.illustrativeImageId)) {
          mediaIds.add(option.illustrativeImageId);
        }
      });
    });

    // Load preview URLs for media IDs that aren't already loaded
    mediaIds.forEach(mediaId => {
      if (!previewUrlsByMediaId[mediaId]) {
        let cancelled = false;
        getMediaPreviewUrl(mediaId)
          .then((previewUrl) => {
            if (cancelled || !previewUrl) return;
            setPreviewUrlsByMediaId(previous => ({ ...previous, [mediaId]: previewUrl }));
            setPreviewErrorsByMediaId(previous => {
              if (!previous[mediaId]) return previous;
              const next = { ...previous };
              delete next[mediaId];
              return next;
            });
          })
          .catch((err) => {
            if (cancelled) return;
            const errorMessage = err instanceof Error ? err.message : 'Failed to load preview image.';
            setPreviewErrorsByMediaId(previous => ({ ...previous, [mediaId]: errorMessage }));
          });
        
        return () => {
          cancelled = true;
        };
      }
    });
  }, [sections, previewUrlsByMediaId]);

  async function handleSectionDrop(targetSectionId: string) {
    if (!draggedSectionId || draggedSectionId === targetSectionId || reorderingSections) {
      setDraggedSectionId(null);
      setDragOverSectionId(null);
      return;
    }

    const previousSections = sections;
    const nextOrdered = orderedSections.slice();
    const fromIndex = nextOrdered.findIndex((section) => section.id === draggedSectionId);
    const toIndex = nextOrdered.findIndex((section) => section.id === targetSectionId);
    if (fromIndex < 0 || toIndex < 0) {
      setDraggedSectionId(null);
      setDragOverSectionId(null);
      return;
    }

    const [moved] = nextOrdered.splice(fromIndex, 1);
    nextOrdered.splice(toIndex, 0, moved);
    const reordered = nextOrdered.map((section, index) => ({ ...section, order: index + 1 }));
    setSections(reordered);

    setReorderingSections(true);
    try {
      await reorderSections(
        checklistId,
        reordered.map((section) => ({ sectionId: section.id, order: section.order })),
      );
      toast.success('Section order updated.');
    } catch (err) {
      setSections(previousSections);
      toast.error(err instanceof Error ? err.message : 'Failed to reorder sections');
    } finally {
      setReorderingSections(false);
      setDraggedSectionId(null);
      setDragOverSectionId(null);
    }
  }

  async function handleQuestionDrop(sectionId: string, targetQuestionId: string) {
    if (!draggedQuestionId || draggedQuestionId === targetQuestionId) return;

    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;

    const hierarchy = getSectionQuestionHierarchy(section);
    const draggedEntry = hierarchy.find((item) => item.question.id === draggedQuestionId);
    const targetEntry = hierarchy.find((item) => item.question.id === targetQuestionId);
    if (!draggedEntry || !targetEntry) return;

    if (draggedEntry.depth !== 0 || targetEntry.depth !== 0) {
      toast.error('Only top-level questions can be reordered.');
      setDraggedQuestionId(null);
      setDragOverQuestionId(null);
      return;
    }

    const rootIds = hierarchy.filter((item) => item.depth === 0).map((item) => item.question.id);
    const sourceIndex = rootIds.indexOf(draggedQuestionId);
    const targetIndex = rootIds.indexOf(targetQuestionId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const reorderedRootIds = [...rootIds];
    const [moved] = reorderedRootIds.splice(sourceIndex, 1);
    reorderedRootIds.splice(targetIndex, 0, moved);

    const childrenByParent = new Map<string, string[]>();
    hierarchy
      .filter((item) => item.depth === 1 && item.question.parentQuestionId)
      .forEach((item) => {
        const parentId = String(item.question.parentQuestionId);
        const siblings = childrenByParent.get(parentId) ?? [];
        siblings.push(item.question.id);
        childrenByParent.set(parentId, siblings);
      });

    const visibleIds = reorderedRootIds.flatMap((rootId) => [rootId, ...(childrenByParent.get(rootId) ?? [])]);

    const byId = new Map(section.questions.map((question) => [question.id, question] as const));
    const hiddenQuestions = section.questions.filter((question) => !visibleIds.includes(question.id));
    const nextQuestions = visibleIds
      .map((id) => byId.get(id))
      .filter((question): question is PanelQuestion => Boolean(question))
      .concat(hiddenQuestions);

    const previousSections = sections;
    setReorderingQuestionsSectionId(sectionId);
    setSections((previous) =>
      previous.map((item) => (item.id === sectionId ? { ...item, questions: nextQuestions } : item)),
    );

    try {
      const reordered = await reorderQuestions(
        checklistId,
        sectionId,
        nextQuestions.map((question, index) => ({ questionId: question.id, order: index + 1 })),
      );
      const mapped = reordered.map(mapApiQuestionToPanelQuestion);
      setSections((previous) =>
        previous.map((item) => (item.id === sectionId ? { ...item, questions: mapped } : item)),
      );
      toast.success('Question order updated.');
    } catch (err) {
      setSections(previousSections);
      toast.error(err instanceof Error ? err.message : 'Failed to reorder questions');
    } finally {
      setReorderingQuestionsSectionId(null);
      setDraggedQuestionId(null);
      setDragOverQuestionId(null);
    }
  }

  return (
    <section className="relative flex h-[100dvh] min-h-0 max-h-[100dvh] flex-col overflow-hidden bg-[linear-gradient(160deg,#eef3fb_0%,#f8fbff_45%,#eef4ff_100%)] text-[#1f2d45]">
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#1f3f73] bg-[linear-gradient(180deg,#071a39,#0b2a57)] px-3 py-3 shadow-sm sm:gap-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/checklists"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2d4f83] bg-[#10284f] text-sm font-semibold text-white hover:bg-[#16345f]"
              aria-label="Back to checklist dashboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 90 90"
                className="h-4 w-4 fill-current"
                aria-hidden="true"
              >
                <path d="M 0.053 44.915 l 33.782 -19.553 v 13.353 h 56.029 c 0.075 0 0.136 0.061 0.136 0.136 v 12.298 c 0 0.075 -0.061 0.136 -0.136 0.136 H 33.835 v 13.353 L 0.053 45.085 C -0.018 45.05 -0.018 44.95 0.053 44.915 z" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2d4f83] bg-[#10284f] text-white hover:bg-[#16345f] lg:hidden"
              aria-expanded={sidebarOpen}
              aria-controls="checklist-builder-nav"
              title={sidebarOpen ? 'Hide structure panel' : 'Show structure panel'}
            >
              {sidebarOpen ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M9 12h11"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M4 6h16M4 12h10M4 18h16M18 9l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="ml-2 min-w-0 flex-1 basis-[min(100%,12rem)] py-0.5 sm:ml-3">
            <h1 className={ADMIN_BUILDER_HEADER_TITLE_CLASS}>Checklist Content Builder</h1>
            <p className="mt-0.5 truncate text-[11px] text-[#9db8e6] sm:text-xs">{title || 'Untitled checklist'}</p>
          </div>
        </header>

        <div className="relative flex min-h-0 min-w-0 flex-1">
          {sidebarOpen ? (
            <button
              type="button"
              aria-label="Close structure panel"
              className="absolute inset-0 z-30 bg-[#0b1220]/45 backdrop-blur-[1px] transition-opacity lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}
          <aside
            id="checklist-builder-nav"
            inert={!sidebarOpen ? true : undefined}
            className={[
              'flex min-h-0 shrink-0 flex-col border-r border-[#dde6f5] bg-[linear-gradient(180deg,#071a39,#0b2a57)] p-4 text-[#d8e6ff]',
              'transition-[transform,box-shadow] duration-200 ease-out lg:relative lg:z-0 lg:w-[280px] lg:translate-x-0 lg:shadow-none xl:w-[320px]',
              'max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:w-[min(100vw-2.5rem,320px)] max-lg:max-w-[320px]',
              sidebarOpen
                ? 'max-lg:translate-x-0 max-lg:shadow-[6px_0_28px_rgba(7,26,57,0.28)]'
                : 'max-lg:pointer-events-none max-lg:-translate-x-full max-lg:shadow-none',
            ].join(' ')}
          >
            {!isReadOnly ? (
              <button
                type="button"
                onClick={addSection}
                disabled={loadingSections || sectionActionLoading === 'create'}
                className="mb-4 w-full rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
              >
                {sectionActionLoading === 'create' ? 'Adding...' : '+ Add section'}
              </button>
            ) : null}

            <div className="mb-3 rounded-lg border border-[#2d4f83] bg-[#10284f] px-3 py-2 text-left">
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#9db8e6]">Checklist</p>
              <p className="mt-1 text-sm font-semibold text-white">{title || 'Untitled checklist'}</p>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {loadingSections ? <p className="px-2 text-xs text-[#c4d6f7]">Loading sections...</p> : null}
              {!loadingSections && sections.length === 0 ? (
                <p className="px-2 text-xs text-[#c4d6f7]">No sections found for this checklist.</p>
              ) : null}
              {orderedSections.map((section) => (
                  <div
                    key={section.id}
                    draggable={!isReadOnly && !reorderingSections}
                    onDragStart={() => {
                      if (isReadOnly) return;
                      setDraggedSectionId(section.id);
                    }}
                    onDragOver={(event) => {
                      if (isReadOnly) return;
                      event.preventDefault();
                      if (dragOverSectionId !== section.id) setDragOverSectionId(section.id);
                    }}
                    onDragEnd={() => {
                      setDraggedSectionId(null);
                      setDragOverSectionId(null);
                    }}
                    onDrop={(event) => {
                      if (isReadOnly) return;
                      event.preventDefault();
                      void handleSectionDrop(section.id);
                    }}
                    className={`rounded-lg border bg-[#10284f] p-2 ${
                      dragOverSectionId === section.id ? 'border-[#5ea2ff]' : 'border-[#2d4f83]'
                    } ${reorderingSections ? 'opacity-80' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {!isReadOnly ? (
                        <span className="cursor-grab px-1 text-xs text-[#9db8e6]" title="Drag to reorder">
                          ⋮⋮
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsedSectionIds((previous) =>
                            previous.includes(section.id)
                              ? previous.filter((id) => id !== section.id)
                              : [...previous, section.id],
                          )
                        }
                        className="rounded-md p-1 text-[#c4d6f7] hover:bg-[#16345f]"
                        aria-label={collapsedSectionIds.includes(section.id) ? 'Expand section' : 'Collapse section'}
                        title={collapsedSectionIds.includes(section.id) ? 'Expand section' : 'Collapse section'}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className={`h-3.5 w-3.5 transition-transform ${collapsedSectionIds.includes(section.id) ? '-rotate-90' : ''}`}
                          aria-hidden="true"
                        >
                          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelected({ type: 'section', sectionId: section.id })}
                        className={`flex-1 rounded-md px-2 py-2 text-left text-sm ${
                          selected.type === 'section' && selected.sectionId === section.id
                            ? 'bg-[#163a72] text-white'
                            : 'text-[#d8e6ff] hover:bg-[#16345f]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{section.order}. {section.title || 'Untitled section'}</span>
                          <span className="rounded bg-[#163a72] px-1.5 py-0.5 text-[10px] font-semibold text-[#c4d6f7]">
                            {section.questions.length}
                          </span>
                        </div>
                      </button>
                      {!isReadOnly ? (
                        <button
                          type="button"
                          aria-label="Delete section"
                          title="Delete section"
                          onClick={() => setConfirmDeleteSectionId(section.id)}
                          disabled={sectionActionLoading === 'delete'}
                          className="p-1 text-[#bf2e2e] hover:text-[#a52828] disabled:opacity-60"
                        >
                        <svg viewBox="0 0 90 90" fill="none" className="h-4 w-4" aria-hidden="true">
                          <path
                            d="M64.71 90H25.291c-4.693 0-8.584-3.67-8.859-8.355l-3.928-67.088c-.048-.825.246-1.633.812-2.234.567-.601 1.356-.941 2.183-.941h59.002c.826 0 1.615.341 2.183.941.566.601.86 1.409.813 2.234l-3.928 67.089C73.294 86.33 69.403 90 64.71 90ZM18.679 17.381l3.743 63.913C22.51 82.812 23.771 84 25.291 84H64.71c1.52 0 2.779-1.188 2.868-2.705l3.742-63.914H18.679Z"
                            fill="currentColor"
                          />
                          <path
                            d="M80.696 17.381H9.304c-1.657 0-3-1.343-3-3s1.343-3 3-3h71.393c1.657 0 3 1.343 3 3S82.354 17.381 80.696 17.381Z"
                            fill="currentColor"
                          />
                          <path
                            d="M58.729 17.381H31.271c-1.657 0-3-1.343-3-3V8.789C28.271 3.943 32.214 0 37.061 0h15.879c4.847 0 8.789 3.943 8.789 8.789v5.592c0 1.657-1.343 3-3 3ZM34.271 11.381h21.457V8.789C55.729 7.251 54.478 6 52.939 6H37.061c-1.538 0-2.789 1.251-2.789 2.789v2.592Z"
                            fill="currentColor"
                          />
                          <path
                            d="M58.33 74.991c-.06 0-.118-.002-.179-.005-1.653-.097-2.916-1.517-2.819-3.171l2.474-42.244c.097-1.655 1.508-2.933 3.171-2.819 1.653.097 2.916 1.516 2.819 3.17l-2.474 42.245C61.229 73.761 59.906 74.991 58.33 74.991Z"
                            fill="currentColor"
                          />
                          <path
                            d="M31.669 74.991c-1.577 0-2.898-1.23-2.992-2.824l-2.473-42.245c-.097-1.654 1.165-3.073 2.819-3.17 1.646-.111 3.073 1.165 3.17 2.819l2.473 42.244c.097 1.654-1.165 3.074-2.819 3.171-.059.003-.118.005-.178.005Z"
                            fill="currentColor"
                          />
                          <path
                            d="M45 74.991c-1.657 0-3-1.343-3-3V29.747c0-1.657 1.343-3 3-3s3 1.343 3 3v42.244c0 1.657-1.343 3-3 3Z"
                            fill="currentColor"
                          />
                        </svg>
                        </button>
                      ) : null}
                    </div>

                    {!collapsedSectionIds.includes(section.id) ? (
                      <>
                        <div className="mt-2 space-y-1">
                          {getSectionQuestionHierarchy(section).map(({ question, displayCode, isSubQuestion, depth }) => {
                            const canAddSub = depth < 1;
                            return (
                              <div
                                key={question.id}
                                draggable={!isReadOnly && !isSubQuestion && !reorderingSections && !reorderingQuestionsSectionId}
                                onDragStart={() => {
                                  if (isReadOnly) return;
                                  if (isSubQuestion) return;
                                  setDraggedQuestionId(question.id);
                                }}
                                onDragOver={(event) => {
                                  if (isReadOnly) return;
                                  if (isSubQuestion) return;
                                  event.preventDefault();
                                  if (dragOverQuestionId !== question.id) setDragOverQuestionId(question.id);
                                }}
                                onDragEnd={() => {
                                  setDraggedQuestionId(null);
                                  setDragOverQuestionId(null);
                                }}
                                onDrop={(event) => {
                                  if (isReadOnly) return;
                                  if (isSubQuestion) return;
                                  event.preventDefault();
                                  void handleQuestionDrop(section.id, question.id);
                                }}
                                className={`flex items-center gap-1 rounded-md ${!isSubQuestion && dragOverQuestionId === question.id ? 'ring-1 ring-[#5ea2ff]' : ''}`}
                              >
                                {!isReadOnly && !isSubQuestion ? (
                                  <span className="cursor-grab px-1 text-[10px] text-[#9db8e6]" title="Drag to reorder questions">
                                    ⋮⋮
                                  </span>
                                ) : (
                                  <span className="w-4" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSelected({ type: 'question', sectionId: section.id, questionId: question.id })}
                                  className={`flex-1 rounded-md px-2 py-1.5 text-left text-xs ${
                                    selected.type === 'question' && selected.questionId === question.id
                                      ? 'bg-[#163a72] text-white'
                                      : 'text-[#c4d6f7] hover:bg-[#16345f]'
                                  } ${isSubQuestion ? 'ml-3 border-l border-[#2d4f83] pl-3' : ''}`}
                                >
                                  {isSubQuestion ? '↳ ' : ''}Q{displayCode}: {question.questionTitle || question.questionId || 'Untitled question'}
                                </button>
                                {!isReadOnly ? (
                                  <button
                                    type="button"
                                    onClick={() => addQuestion(section.id, question.id)}
                                    disabled={
                                      !canAddSub ||
                                      (questionActionLoading === 'create' && addingQuestionSectionId === section.id) ||
                                      reorderingSections
                                    }
                                    className="rounded-md border border-dashed border-[#5d84be] px-2 py-1 text-[10px] font-semibold text-[#d8e6ff] hover:bg-[#16345f] disabled:cursor-not-allowed disabled:opacity-40"
                                    title={canAddSub ? 'Add subquestion' : 'Subquestions cannot have subquestions'}
                                  >
                                    + Sub
                                  </button>
                                ) : null}
                              </div>
                            );
                          })}
                          {section.questions.length === 0 ? (
                            <p className="px-2 py-1 text-[11px] text-[#9db8e6]">No questions loaded</p>
                          ) : null}
                        </div>

                        {!isReadOnly ? (
                          <button
                            type="button"
                            onClick={() => addQuestion(section.id)}
                            disabled={(questionActionLoading === 'create' && addingQuestionSectionId === section.id) || reorderingSections}
                            className="mt-2 w-full rounded-md border border-dashed border-[#5d84be] px-2 py-1.5 text-xs font-semibold text-[#d8e6ff] hover:bg-[#16345f] disabled:opacity-60"
                          >
                            {questionActionLoading === 'create' && addingQuestionSectionId === section.id ? 'Adding question...' : '+ Add question'}
                          </button>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ))}
            </div>
          </aside>

          <main className="relative z-0 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 lg:p-6">
            {selected.type === 'section' && selectedSection ? (
              <div className={`${cardClass} space-y-4`}>
                {isReadOnly ? <p className="rounded-lg border border-[#dbe4f4] bg-[#f7f9fe] px-3 py-2 text-xs text-[#5f7395]">Read-only mode: editing actions are disabled for auditor.</p> : null}
                <fieldset disabled={isReadOnly} className="space-y-4">
                <h2 className="text-lg font-semibold">Section</h2>
                <div>
                  <label className={labelClass}>Section title *</label>
                  <input
                    value={selectedSection.title}
                    onChange={(event) => updateSection(selectedSection.id, { title: event.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Display order *</label>
                  <input
                    type="number"
                    min={1}
                    value={selectedSection.order}
                    onChange={(event) => updateSection(selectedSection.id, { order: Number(event.target.value) || 1 })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Source</label>
                  <input
                    value={selectedSection.sourceRef}
                    onChange={(event) => updateSection(selectedSection.id, { sourceRef: event.target.value })}
                    className={inputClass}
                    placeholder="Source reference"
                  />
                </div>
                {!isReadOnly ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSaveSection(selectedSection.id)}
                      disabled={sectionActionLoading === 'save'}
                      className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                    >
                      {sectionActionLoading === 'save' ? 'Saving...' : 'Save section'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteSection(selectedSection.id)}
                      disabled={sectionActionLoading === 'delete'}
                      className="rounded-lg border border-[#d45f6b] bg-[#fff1f3] px-3 py-2 text-xs font-semibold text-[#a73a46] disabled:opacity-60"
                    >
                      {sectionActionLoading === 'delete' ? 'Deleting...' : 'Delete section'}
                    </button>
                  </div>
                ) : null}
                </fieldset>
              </div>
            ) : null}

            {!isReadOnly && selected.type === 'createSection' ? (
              <div className={`${cardClass} space-y-4`}>
                <h2 className="text-lg font-semibold">Add section</h2>
                <p className="text-sm text-[#607594]">Enter section details before creating it.</p>
                <div>
                  <label className={labelClass}>Section title *</label>
                  <input
                    value={newSectionTitle}
                    onChange={(event) => setNewSectionTitle(event.target.value)}
                    className={inputClass}
                    placeholder="Section title"
                  />
                </div>
                <div>
                  <label className={labelClass}>Display order *</label>
                  <input
                    value={newSectionOrder}
                    onChange={(event) => setNewSectionOrder(event.target.value.replace(/[^\d]/g, ''))}
                    className={inputClass}
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className={labelClass}>Source</label>
                  <input
                    value={newSectionSourceRef}
                    onChange={(event) => setNewSectionSourceRef(event.target.value)}
                    className={inputClass}
                    placeholder="Source reference"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected({ type: 'checklist' })}
                    disabled={sectionActionLoading === 'create'}
                    className="rounded-lg border border-[#d4dced] px-3 py-2 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleConfirmCreateSection()}
                    disabled={sectionActionLoading === 'create'}
                    className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                  >
                    {sectionActionLoading === 'create' ? 'Creating...' : 'Create section'}
                  </button>
                </div>
              </div>
            ) : null}

            {!isReadOnly && selected.type === 'createQuestion' ? (
              <div className={`${cardClass} space-y-4`}>
                <div className="flex items-start justify-between gap-3 border-b border-[#e2e8f5] pb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1f2d45]">Add question</h2>
                    <p className="mt-1 text-sm text-[#607594]">Fill question details before creating.</p>
                    {newQuestionDraft.parentQuestionId ? (
                      <p className="mt-1 text-xs text-[#3e69b0]">
                        Creating subquestion for parent:{' '}
                        {parentQuestionForDraft?.questionTitle || parentQuestionForDraft?.questionId || 'Unknown question'}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className={sectionHeadingClass}>Basic information</div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Question ID *</label>
                    <input
                      value={newQuestionDraft.questionId}
                      onChange={(event) => setNewQuestionDraft((previous) => ({ ...previous, questionId: event.target.value }))}
                      className={`${inputClass} ${createQuestionMissingFields.includes('questionId') ? 'border-[#d45f6b] ring-1 ring-[#d45f6b]/30' : ''}`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Severity level *</label>
                    <select
                      value={newQuestionDraft.securityLevel}
                      onChange={(event) =>
                        setNewQuestionDraft((previous) => ({ ...previous, securityLevel: event.target.value as RiskLevel }))
                      }
                      className={inputClass}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Audit type</label>
                    <input
                      value={newQuestionDraft.auditType}
                      onChange={(event) =>
                        setNewQuestionDraft((previous) => ({ ...previous, auditType: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className={sectionHeadingClass + ' md:col-span-2'}>Legal requirement</div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Legal requirement title</label>
                    <input
                      value={newQuestionDraft.legalRequirementTitle}
                      onChange={(event) =>
                        setNewQuestionDraft((previous) => ({ ...previous, legalRequirementTitle: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <RichTextEditor
                      label="Legal requirement description *"
                      value={newQuestionDraft.legalRequirementDescription}
                      onChange={(next) =>
                        setNewQuestionDraft((previous) => ({ ...previous, legalRequirementDescription: next }))
                      }
                      placeholder="Describe the legal or regulatory basis..."
                      minHeight={80}
                      hasError={createQuestionMissingFields.includes('legalRequirementDescription')}
                    />
                  </div>
                  <div className={sectionHeadingClass + ' md:col-span-2'}>Content & guidance</div>
                  <div>
                    <RichTextEditor
                      label="Explanation *"
                      value={newQuestionDraft.explanation}
                      onChange={(next) => setNewQuestionDraft((previous) => ({ ...previous, explanation: next }))}
                      placeholder="Why this control matters..."
                      minHeight={90}
                      hasError={createQuestionMissingFields.includes('explanation')}
                    />
                  </div>
                  <div>
                    <RichTextEditor
                      label="Expected implementation *"
                      value={newQuestionDraft.expectedImplementation}
                      onChange={(next) =>
                        setNewQuestionDraft((previous) => ({ ...previous, expectedImplementation: next }))
                      }
                      placeholder="• Step 1"
                      minHeight={90}
                      hasError={createQuestionMissingFields.includes('expectedImplementation')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Why this matters</label>
                    <textarea
                      value={newQuestionDraft.howItWorks}
                      onChange={(event) =>
                        setNewQuestionDraft((previous) => ({ ...previous, howItWorks: event.target.value }))
                      }
                      className={textAreaClass}
                    />
                  </div>
                  <div className={sectionHeadingClass + ' md:col-span-2'}>Options</div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e8f5] bg-[#f8fbff] px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[#1f2d45]">Upload evidence enabled</p>
                        <p className="text-xs text-[#607594]">Allow customers to attach files as evidence</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={newQuestionDraft.evidenceEnabled}
                        onChange={(event) =>
                          setNewQuestionDraft((previous) => ({ ...previous, evidenceEnabled: event.target.checked }))
                        }
                        className={checkboxClass}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e8f5] bg-[#f8fbff] px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[#1f2d45]">User note enabled</p>
                        <p className="text-xs text-[#607594]">Allow users to add a note for this question</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={newQuestionDraft.noteEnabled}
                        onChange={(event) =>
                          setNewQuestionDraft((previous) => ({
                            ...previous,
                            noteEnabled: event.target.checked,
                            note: previous.note,
                          }))
                        }
                        className={checkboxClass}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Note from admin (optional)</label>
                    <textarea
                      value={newQuestionDraft.note}
                      onChange={(event) => setNewQuestionDraft((previous) => ({ ...previous, note: event.target.value }))}
                      className={textAreaClass}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <p className={sectionHeadingClass}>Answer options (4 required)</p>
                    <div className="space-y-2">
                      {newQuestionDraft.answerOptions.map((option, index) => (
                        <div key={`new-answer-option-${index}`} className="rounded-xl border border-[#e2e8f5] bg-[#fbfcff] p-3">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="rounded-full border border-[#d4dced] bg-white px-2 py-0.5 text-[11px] font-medium text-[#607594]">
                              Answer {index + 1}
                            </span>
                            <span className="text-sm font-medium text-[#1f2d45]">{option.label || `Answer ${index + 1}`}</span>
                            <span className="rounded-full bg-[#e6f1fb] px-2 py-0.5 text-[11px] font-medium text-[#185fa5]">
                              score: {fixedScoreForAnswer(index)}
                            </span>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                          <input
                            value={option.label}
                            onChange={(event) =>
                              setNewQuestionDraft((previous) => ({
                                ...previous,
                                answerOptions: previous.answerOptions.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, label: event.target.value } : item,
                                ),
                              }))
                            }
                            className={`${inputClass} ${createQuestionMissingFields.includes(`answer_label_${index}`) ? 'border-[#d45f6b] ring-1 ring-[#d45f6b]/30' : ''}`}
                            placeholder={`Answer ${index + 1} label`}
                          />
                          <input
                            type="number"
                            min={1}
                            max={4}
                            value={fixedScoreForAnswer(index)}
                            readOnly
                            className={`${inputClass} cursor-not-allowed bg-[#eef3fb] text-[#607594]`}
                            placeholder="Score (1-4)"
                          />
                          </div>
                          <div className="mt-3">
                            <label className={labelClass}>Description</label>
                            <textarea
                              value={option.description}
                              onChange={(event) =>
                                setNewQuestionDraft((previous) => ({
                                  ...previous,
                                  answerOptions: previous.answerOptions.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, description: event.target.value } : item,
                                  ),
                                }))
                              }
                              className={`${textAreaClass} ${createQuestionMissingFields.includes(`answer_description_${index}`) ? 'border-[#d45f6b] ring-1 ring-[#d45f6b]/30' : ''}`}
                              placeholder="Answer description"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <p className={sectionHeadingClass}>Question image (optional)</p>
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-[#d4dced] bg-[#fbfdff] px-3 py-2 text-sm text-[#607594]">
                      <span>Upload example image - resolves to UUID on upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const mediaKey = 'create-question-image';
                          setUploadingMediaKey(mediaKey);
                          void uploadQuestionImage(file)
                            .then((mediaId) => {
                              const previewUrl = URL.createObjectURL(file);
                              setNewQuestionImagePreviewUrl((previous) => {
                                if (previous) URL.revokeObjectURL(previous);
                                return previewUrl;
                              });
                              setNewQuestionDraft((previous) => ({ ...previous, illustrativeImageId: mediaId }));
                              toast.success('Question image uploaded.');
                            })
                            .catch((err) => {
                              toast.error(err instanceof Error ? err.message : 'Failed to upload image');
                            })
                            .finally(() => {
                              setUploadingMediaKey(null);
                              event.target.value = '';
                            });
                        }}
                      />
                    </label>
                    {uploadingMediaKey === 'create-question-image' ? (
                      <p className="text-xs text-[#607594]">Uploading...</p>
                    ) : null}
                    {newQuestionImagePreviewUrl ? (
                      <div className="relative mt-2 w-full max-w-[280px] overflow-hidden rounded-xl border border-[#d4dced] bg-white">
                        <button
                          type="button"
                          onClick={() => {
                            setNewQuestionImagePreviewUrl((previous) => {
                              if (previous) URL.revokeObjectURL(previous);
                              return '';
                            });
                            setNewQuestionDraft((previous) => ({ ...previous, illustrativeImageId: '' }));
                          }}
                          className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0b1220]/70 text-sm font-semibold text-white hover:bg-[#0b1220]"
                          aria-label="Remove example image"
                        >
                          ×
                        </button>
                        <img src={newQuestionImagePreviewUrl} alt="Example image preview" className="h-16 w-full object-cover" />
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected({ type: 'section', sectionId: selected.sectionId })}
                    disabled={questionActionLoading === 'create'}
                    className="rounded-lg border border-[#d4dced] px-3 py-2 text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleConfirmCreateQuestion()}
                    disabled={questionActionLoading === 'create' || uploadingMediaKey === 'create-question-image'}
                    className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                  >
                    {questionActionLoading === 'create' ? 'Creating...' : 'Create question'}
                  </button>
                </div>
              </div>
            ) : null}

            {selected.type === 'question' && selectedSection && selectedQuestion ? (
              <div className={`${cardClass} space-y-4`}>
                {isReadOnly ? <p className="rounded-lg border border-[#dbe4f4] bg-[#f7f9fe] px-3 py-2 text-xs text-[#5f7395]">Read-only mode: editing actions are disabled for auditor.</p> : null}
                <fieldset disabled={isReadOnly} className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-[#e2e8f5] pb-3">
                  <div>
                    <h2 className="text-lg font-semibold">Edit question</h2>
                    <p className="text-sm text-[#607594]">Update question details.</p>
                  </div>
                </div>
                <div className={sectionHeadingClass}>Basic information</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Question ID *</label>
                    <input
                      value={selectedQuestion.questionId}
                      onChange={(event) =>
                        updateQuestion(selectedSection.id, selectedQuestion.id, { questionId: event.target.value })
                      }
                      className={`${inputClass} ${editQuestionMissingFields.includes('questionId') ? 'border-[#d45f6b] ring-1 ring-[#d45f6b]/30' : ''}`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Severity level *</label>
                    <select
                      value={selectedQuestion.securityLevel}
                      onChange={(event) =>
                        updateQuestion(selectedSection.id, selectedQuestion.id, {
                          securityLevel: event.target.value as RiskLevel,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Audit type</label>
                    <input
                      value={selectedQuestion.auditType}
                      onChange={(event) =>
                        updateQuestion(selectedSection.id, selectedQuestion.id, { auditType: event.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className={sectionHeadingClass}>Legal requirement</div>
                <div>
                  <label className={labelClass}>Legal requirement title</label>
                  <input
                    value={selectedQuestion.legalRequirementTitle}
                    onChange={(event) =>
                      updateQuestion(selectedSection.id, selectedQuestion.id, {
                        legalRequirementTitle: event.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <RichTextEditor
                    label="Legal requirement description *"
                    value={selectedQuestion.legalRequirementDescription}
                    onChange={(next) =>
                      updateQuestion(selectedSection.id, selectedQuestion.id, {
                        legalRequirementDescription: next,
                      })
                    }
                    placeholder="Describe the legal or regulatory basis..."
                    minHeight={80}
                    hasError={editQuestionMissingFields.includes('legalRequirementDescription')}
                  />
                </div>
                <div className={sectionHeadingClass}>Content & guidance</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <RichTextEditor
                      label="Explanation *"
                      value={selectedQuestion.explanation}
                      onChange={(next) =>
                        updateQuestion(selectedSection.id, selectedQuestion.id, { explanation: next })
                      }
                      placeholder="Why this control matters..."
                      minHeight={90}
                      hasError={editQuestionMissingFields.includes('explanation')}
                    />
                  </div>
                  <div>
                    <RichTextEditor
                      label="Expected implementation *"
                      value={selectedQuestion.expectedImplementation}
                      onChange={(next) =>
                        updateQuestion(selectedSection.id, selectedQuestion.id, {
                          expectedImplementation: next,
                        })
                      }
                      placeholder="• Step 1"
                      minHeight={90}
                      hasError={editQuestionMissingFields.includes('expectedImplementation')}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Why this matters</label>
                  <textarea
                    value={selectedQuestion.howItWorks}
                    onChange={(event) =>
                      updateQuestion(selectedSection.id, selectedQuestion.id, { howItWorks: event.target.value })
                    }
                    className={textAreaClass}
                  />
                </div>

                <div className={sectionHeadingClass}>Options</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e8f5] bg-[#f8fbff] px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[#1f2d45]">Upload evidence enabled</p>
                        <p className="text-xs text-[#607594]">Allow customers to attach files as evidence</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedQuestion.evidenceEnabled}
                        onChange={(event) =>
                          updateQuestion(selectedSection.id, selectedQuestion.id, {
                            evidenceEnabled: event.target.checked,
                          })
                        }
                        className={checkboxClass}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#e2e8f5] bg-[#f8fbff] px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[#1f2d45]">User note enabled</p>
                        <p className="text-xs text-[#607594]">Allow users to add a note for this question</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedQuestion.noteEnabled}
                        onChange={(event) =>
                          updateQuestion(selectedSection.id, selectedQuestion.id, {
                            noteEnabled: event.target.checked,
                            note: selectedQuestion.note,
                          })
                        }
                        className={checkboxClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Note from admin (optional)</label>
                  <textarea
                    value={selectedQuestion.note}
                    onChange={(event) => updateQuestion(selectedSection.id, selectedQuestion.id, { note: event.target.value })}
                    className={textAreaClass}
                  />
                </div>

                <div className="space-y-2">
                  <p className={sectionHeadingClass}>Answer options (4 required)</p>
                  <div className="space-y-2">
                    {selectedQuestion.answerOptions.map((option, index) => (
                      <div key={`answer-option-${index}`} className="rounded-xl border border-[#e2e8f5] bg-[#fbfcff] p-3">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded-full border border-[#d4dced] bg-white px-2 py-0.5 text-[11px] font-medium text-[#607594]">
                            Answer {index + 1}
                          </span>
                          <span className="text-sm font-medium text-[#1f2d45]">{option.label || `Answer ${index + 1}`}</span>
                          <span className="rounded-full bg-[#e6f1fb] px-2 py-0.5 text-[11px] font-medium text-[#185fa5]">
                            score: {fixedScoreForAnswer(index)}
                          </span>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                        <input
                          value={option.label}
                          onChange={(event) =>
                            updateQuestion(selectedSection.id, selectedQuestion.id, {
                              answerOptions: selectedQuestion.answerOptions.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, label: event.target.value } : item,
                              ),
                            })
                          }
                          className={`${inputClass} ${editQuestionMissingFields.includes(`answer_label_${index}`) ? 'border-[#d45f6b] ring-1 ring-[#d45f6b]/30' : ''}`}
                          placeholder={`Answer ${index + 1} label`}
                        />
                        <input
                          type="number"
                          min={1}
                          max={4}
                          value={fixedScoreForAnswer(index)}
                          readOnly
                          className={`${inputClass} cursor-not-allowed bg-[#eef3fb] text-[#607594]`}
                          placeholder="Score (1-4)"
                        />
                        </div>
                        <div className="mt-3">
                          <label className={labelClass}>Description</label>
                          <textarea
                            value={option.description}
                            onChange={(event) =>
                              updateQuestion(selectedSection.id, selectedQuestion.id, {
                                answerOptions: selectedQuestion.answerOptions.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, description: event.target.value } : item,
                                ),
                              })
                            }
                            className={`${textAreaClass} ${editQuestionMissingFields.includes(`answer_description_${index}`) ? 'border-[#d45f6b] ring-1 ring-[#d45f6b]/30' : ''}`}
                            placeholder="Answer description"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className={sectionHeadingClass}>Question image (optional)</p>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-[#d4dced] bg-[#fbfdff] px-3 py-2 text-sm text-[#607594]">
                    <span>Upload example image - resolves to UUID on upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const mediaKey = `edit-question-${selectedQuestion.id}`;
                        setUploadingMediaKey(mediaKey);
                        void uploadQuestionImage(file)
                          .then((mediaId) => {
                            const previewUrl = URL.createObjectURL(file);
                            setEditQuestionImagePreview((previous) => {
                              if (previous?.url) URL.revokeObjectURL(previous.url);
                              return { questionId: selectedQuestion.id, url: previewUrl };
                            });
                            updateQuestion(selectedSection.id, selectedQuestion.id, { illustrativeImageId: mediaId });
                            toast.success('Question image uploaded.');
                          })
                          .catch((err) => {
                            toast.error(err instanceof Error ? err.message : 'Failed to upload image');
                          })
                          .finally(() => {
                            setUploadingMediaKey(null);
                            event.target.value = '';
                          });
                      }}
                    />
                  </label>
                  {uploadingMediaKey === `edit-question-${selectedQuestion.id}` ? (
                    <p className="text-xs text-[#607594]">Uploading...</p>
                  ) : null}
                  {editQuestionImagePreview?.questionId === selectedQuestion.id ? (
                    <div className="relative mt-2 w-full max-w-[280px] overflow-hidden rounded-xl border border-[#dced] bg-white">
                      <button
                        type="button"
                        onClick={() => {
                          setEditQuestionImagePreview((previous) => {
                            if (previous?.url) URL.revokeObjectURL(previous.url);
                            return null;
                          });
                          updateQuestion(selectedSection.id, selectedQuestion.id, { illustrativeImageId: '' });
                        }}
                        className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0b1220]/70 text-sm font-semibold text-white hover:bg-[#0b1220]"
                        aria-label="Remove example image"
                      >
                        ×
                      </button>
                      <img src={editQuestionImagePreview.url} alt="Example image preview" className="h-20 w-full object-cover" />
                    </div>
                  ) : selectedQuestion.illustrativeImageId && (isHttpUrl(selectedQuestion.illustrativeImageId) || previewUrlsByMediaId[selectedQuestion.illustrativeImageId]) ? (
                    <div className="relative mt-2 w-full max-w-[280px] overflow-hidden rounded-xl border border-[#dced] bg-white">
                      <button
                        type="button"
                        onClick={() => {
                          updateQuestion(selectedSection.id, selectedQuestion.id, { illustrativeImageId: '' });
                        }}
                        className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0b1220]/70 text-sm font-semibold text-white hover:bg-[#0b1220]"
                        aria-label="Remove example image"
                      >
                        ×
                      </button>
                      <img 
                        src={
                          isHttpUrl(selectedQuestion.illustrativeImageId)
                            ? selectedQuestion.illustrativeImageId
                            : previewUrlsByMediaId[selectedQuestion.illustrativeImageId]
                        } 
                        alt="Example image preview" 
                        className="h-20 w-full object-cover" 
                      />
                    </div>
                  ) : previewErrorsByMediaId[selectedQuestion.illustrativeImageId || ''] ? (
                    <div className="mt-2 text-xs text-[#d45f6b]">
                      Failed to load image: {previewErrorsByMediaId[selectedQuestion.illustrativeImageId || '']}
                    </div>
                  ) : null}
                </div>
                {!isReadOnly ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSaveQuestion(selectedSection.id, selectedQuestion.id)}
                      disabled={questionActionLoading === 'save'}
                      className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                    >
                      {questionActionLoading === 'save' ? 'Saving...' : 'Save question'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDeleteQuestionTarget({
                          sectionId: selectedSection.id,
                          questionId: selectedQuestion.id,
                          isSubQuestion: Boolean(selectedQuestion.parentQuestionId),
                        })
                      }
                      disabled={questionActionLoading === 'delete'}
                      className="rounded-lg border border-[#d45f6b] bg-[#fff1f3] px-3 py-2 text-xs font-semibold text-[#a73a46] disabled:opacity-60"
                    >
                      {questionActionLoading === 'delete'
                        ? 'Deleting...'
                        : selectedQuestion.parentQuestionId
                          ? 'Delete subquestion'
                          : 'Delete question'}
                    </button>
                  </div>
                ) : null}
                </fieldset>
              </div>
            ) : null}
          </main>
        </div>
        {!isReadOnly && confirmDeleteSectionId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-[#1f2d45]">Delete section?</h2>
              <p className="mt-1 text-sm text-[#607594]">
                This action will permanently remove this section and all of its questions.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteSectionId(null)}
                  disabled={sectionActionLoading === 'delete'}
                  className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteSection(confirmDeleteSectionId)}
                  disabled={sectionActionLoading === 'delete'}
                  className="rounded-lg border border-[#d45f6b] bg-[#fff1f3] px-3 py-1.5 text-sm font-semibold text-[#a73a46] hover:bg-[#ffe6ea] disabled:opacity-60"
                >
                  {sectionActionLoading === 'delete' ? 'Deleting...' : 'Delete section'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {!isReadOnly && confirmDeleteQuestionTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-[#1f2d45]">
                {confirmDeleteQuestionTarget.isSubQuestion ? 'Delete subquestion?' : 'Delete question?'}
              </h2>
              <p className="mt-1 text-sm text-[#607594]">
                This action will permanently remove this {confirmDeleteQuestionTarget.isSubQuestion ? 'subquestion' : 'question'}.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteQuestionTarget(null)}
                  disabled={questionActionLoading === 'delete'}
                  className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void handleDeleteQuestion(confirmDeleteQuestionTarget.sectionId, confirmDeleteQuestionTarget.questionId)
                  }
                  disabled={questionActionLoading === 'delete'}
                  className="rounded-lg border border-[#d45f6b] bg-[#fff1f3] px-3 py-1.5 text-sm font-semibold text-[#a73a46] hover:bg-[#ffe6ea] disabled:opacity-60"
                >
                  {questionActionLoading === 'delete'
                    ? 'Deleting...'
                    : confirmDeleteQuestionTarget.isSubQuestion
                      ? 'Delete subquestion'
                      : 'Delete question'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {isBuilderLoading ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/65 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-xl border border-[#dbe4f4] bg-white px-4 py-3 shadow-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2d4f83] border-t-transparent" />
            <span className="text-sm font-medium text-[#1f2d45]">Loading checklist data...</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
