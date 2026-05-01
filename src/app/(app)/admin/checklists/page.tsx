'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getApiBaseUrl } from '@/lib/api';
import {
  createChecklist,
  createChecklistBulkImport,
  deleteChecklist,
  getAdminChecklists,
  getChecklistBulkImportTasks,
  getChecklistBulkTemplateMapping,
  publishChecklist,
  updateChecklist,
  verifyChecklistBulkImport,
  type BulkImportColumnMapping,
  type BulkImportTaskListItem,
  type BulkImportTemplateSpec,
  type BulkImportVerifyResponse,
} from '@/lib/checklist-api';
import type { Checklist } from '@/lib/checklist-types';
import { useAdminAccess } from '@/lib/admin-access';

type ChecklistStatus = 'draft' | 'published';

type ChecklistCardItem = {
  id: string;
  title: string;
  lawDecree: string;
  status: ChecklistStatus;
  description: string;
  version: string;
};

type ParsedHeaderOption = {
  letter: string;
  displayLabel: string;
  row1: string;
  row2: string;
  columnName: string; // Actual column name for backend
};

const BULK_MAPPING_LABELS: Record<keyof BulkImportColumnMapping, string> = {
  section_name_col: 'Section Name Column',
  question_id_col: 'Parent Question ID Column',
  child_question_col: 'Child Question ID Column',
  grandchild_question_col: 'Grandchild Question ID Column',
  legal_requirement_col: 'Legal Requirement Column',
  question_text_col: 'Question Text Column',
  severity_col: 'Severity Column',
  explanation_col: 'Explanation Column',
  expected_implementation_col: 'Expected Implementation Column',
  source_ref_col: 'Source Reference Column',
  guidance_score_4_col: 'Guidance Score 4 Column',
  guidance_score_3_col: 'Guidance Score 3 Column',
  guidance_score_2_col: 'Guidance Score 2 Column',
  guidance_score_1_col: 'Guidance Score 1 Column',
};

function getColumnBadge(
  key: keyof BulkImportColumnMapping,
  templateSpec: BulkImportTemplateSpec | null,
): 'required' | 'optional' | null {
  if (!templateSpec) return null;
  if (templateSpec.required_columns?.includes(key)) return 'required';
  if (templateSpec.optional_columns?.includes(key)) return 'optional';
  return null;
}

export default function ChecklistPanelListPage() {
  const router = useRouter();
  const { isReadOnly } = useAdminAccess();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ChecklistStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'set' | 'not_set'>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'create' | 'publish' | 'delete' | ''>('');
  const [activeChecklistId, setActiveChecklistId] = useState('');
  const [confirmDeleteChecklistId, setConfirmDeleteChecklistId] = useState<string | null>(null);
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);
  const [isCreateChecklistModalOpen, setIsCreateChecklistModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createLawDecree, setCreateLawDecree] = useState('');
  const [editChecklistId, setEditChecklistId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLawDecree, setEditLawDecree] = useState('');
  const [editStatus, setEditStatus] = useState<'draft' | 'published'>('draft');
  const [editLoading, setEditLoading] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [bulkTemplateSpec, setBulkTemplateSpec] = useState<BulkImportTemplateSpec | null>(null);
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [bulkImportFileBase64, setBulkImportFileBase64] = useState('');
  const [bulkImportTitle, setBulkImportTitle] = useState('');
  const [bulkImportDescription, setBulkImportDescription] = useState('');
  const [bulkImportMapping, setBulkImportMapping] = useState<BulkImportColumnMapping>({
    section_name_col: 'Unnamed: 1',
    question_id_col: 'Question ID',
    child_question_col: 'Unnamed: 5',
    grandchild_question_col: 'Unnamed: 6',
    legal_requirement_col: 'Legal Requirement',
    question_text_col: 'paragraph title',
    severity_col: 'Severity',
    explanation_col: 'Explanation',
    expected_implementation_col: 'Expected Implementation',
    source_ref_col: 'Source',
    guidance_score_4_col: 'Answers yes / 4 points',
    guidance_score_3_col: 'Answers yes / 3 points',
    guidance_score_2_col: 'Answers yes / 2 points',
    guidance_score_1_col: 'Answers yes / 1 points',
  });
  const [bulkVerifyResult, setBulkVerifyResult] = useState<BulkImportVerifyResponse | null>(null);
  const [bulkImportTasks, setBulkImportTasks] = useState<BulkImportTaskListItem[]>([]);
  const [bulkLoading, setBulkLoading] = useState<'template' | 'verify' | 'create' | 'poll' | 'download' | ''>('');
  const [bulkVerifiedSignature, setBulkVerifiedSignature] = useState<string>('');
  const [bulkHeaderOptions, setBulkHeaderOptions] = useState<ParsedHeaderOption[]>([]);
  const [bulkHeaderPreviewRows, setBulkHeaderPreviewRows] = useState<string[][]>([]);
  const currentBulkSignature = useMemo(() => {
    const filePart = bulkImportFile ? `${bulkImportFile.name}:${bulkImportFile.size}:${bulkImportFile.lastModified}` : '';
    const mappingPart = JSON.stringify(bulkImportMapping);
    return `${filePart}::${mappingPart}`;
  }, [bulkImportFile, bulkImportMapping]);
  const canCreateFromFile = Boolean(
    bulkImportFile &&
      bulkVerifyResult?.is_valid &&
      bulkVerifiedSignature &&
      bulkVerifiedSignature === currentBulkSignature &&
      bulkLoading !== 'verify' &&
      bulkLoading !== 'create',
  );

  async function loadChecklists() {
    setLoading(true);
    try {
      const data = await getAdminChecklists();
      setChecklists(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load checklists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadChecklists();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadBulkTaskStatus() {
      try {
        const data = await getChecklistBulkImportTasks();
        if (cancelled) return;
        const tasks = Array.isArray(data.tasks) ? data.tasks : [];
        const sorted = tasks
          .slice()
          .sort(
            (a, b) =>
              new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
          );
        setBulkImportTasks(sorted);
      } catch {
        // Ignore task list hydration errors.
      }
    }
    void loadBulkTaskStatus();
    const intervalId = setInterval(() => {
      void loadBulkTaskStatus();
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const filtered = useMemo(
    () =>
      checklists.filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(search.toLowerCase()) || item.lawDecree.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || item.status === filter;
        const isPriceSet = Boolean(item.stripeInfo?.priceAvailable);
        const matchesPayment =
          paymentFilter === 'all' || (paymentFilter === 'set' ? isPriceSet : !isPriceSet);
        return matchesSearch && matchesFilter && matchesPayment;
      }),
    [checklists, search, filter, paymentFilter],
  );

  const publishedCount = checklists.filter((item) => item.status === 'published').length;
  const draftCount = checklists.filter((item) => item.status === 'draft').length;

  function getFriendlyStripeStatus(priceStatus?: string | null) {
    if (!priceStatus) {
      return { label: 'Stripe status unknown', className: 'bg-[#3a4f73] text-[#d8e6ff]' };
    }
    const normalized = priceStatus.toLowerCase();
    if (normalized === 'active' || normalized === 'available') {
      return { label: 'Price available', className: 'bg-[#1f5b3d] text-[#9bf5be]' };
    }
    if (normalized === 'not_set' || normalized === 'missing' || normalized === 'not_available') {
      return { label: 'Price needed', className: 'bg-[#5f3d1f] text-[#ffd8a0]' };
    }
    if (normalized === 'below_minimum') {
      return { label: 'Price invalid', className: 'bg-[#6a1f2c] text-[#ffd5dd]' };
    }
    if (normalized === 'archived' || normalized === 'inactive') {
      return { label: 'Price inactive', className: 'bg-[#4a3a62] text-[#e0ccff]' };
    }
    return { label: 'Price status pending', className: 'bg-[#3a4f73] text-[#d8e6ff]' };
  }

  function openCreateChecklistModal() {
    setCreateTitle('');
    setCreateLawDecree('');
    setIsCreateChecklistModalOpen(true);
  }

  async function fileToBase64WithoutPrefix(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? '');
        const split = result.split(',');
        resolve(split.length > 1 ? split[1] : result);
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }

  function columnLetterFromIndex(index: number): string {
    let n = index + 1;
    let out = '';
    while (n > 0) {
      const rem = (n - 1) % 26;
      out = String.fromCharCode(65 + rem) + out;
      n = Math.floor((n - 1) / 26);
    }
    return out;
  }

  async function parseHeaderOptionsFromFile(file: File): Promise<{ options: ParsedHeaderOption[]; previewRows: string[][] }> {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { options: [], previewRows: [] };
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      raw: false,
      blankrows: false,
      defval: '',
    }) as string[][];
    const row1 = Array.isArray(rows[0]) ? rows[0].map((value) => String(value ?? '').trim()) : [];
    const row2 = Array.isArray(rows[1]) ? rows[1].map((value) => String(value ?? '').trim()) : [];
    const maxCols = Math.max(row1.length, row2.length);
    const options: ParsedHeaderOption[] = [];
    for (let index = 0; index < maxCols; index += 1) {
      const letter = columnLetterFromIndex(index);
      const main = row1[index] || '';
      const sub = row2[index] || '';
      const display = sub
        ? main && main !== sub
          ? `${main} -> ${sub}`
          : sub
        : main || `Column ${letter}`;
      
      // Generate column name that matches backend expectations
      let columnName = '';
      if (index === 0) {
        columnName = '#';
      } else if (index === 1 && sub === 'Section') {
        columnName = 'Unnamed: 1';
      } else if (index === 2 && main === 'Source') {
        columnName = 'Source';
      } else if (index === 3 && main === 'paragraph title') {
        columnName = 'paragraph title';
      } else if (index === 4 && sub === '1') {
        columnName = 'Question ID';
      } else if (index === 5 && sub === '2') {
        columnName = 'Unnamed: 5';
      } else if (index === 6 && sub === '3') {
        columnName = 'Unnamed: 6';
      } else if (index === 7 && main === 'Legal Requirement') {
        columnName = 'Legal Requirement';
      } else if (index === 8 && main === 'Severity') {
        columnName = 'Severity';
      } else if (index === 9 && main === 'Explanation') {
        columnName = 'Explanation';
      } else if (index === 10 && main === 'Expected Implementation') {
        columnName = 'Expected Implementation';
      } else if (index === 11 && main === 'Answers yes / 4 points') {
        columnName = 'Answers yes / 4 points';
      } else if (index === 12 && main === 'Answers yes / 3 points') {
        columnName = 'Answers yes / 3 points';
      } else if (index === 13 && main === 'Answers yes / 2 points') {
        columnName = 'Answers yes / 2 points';
      } else if (index === 14 && main === 'Answers yes / 1 points') {
        columnName = 'Answers yes / 1 points';
      } else {
        // Fallback to Excel-style letter for unknown columns
        columnName = letter;
      }
      
      options.push({
        letter,
        displayLabel: display,
        row1: main || '-',
        row2: sub || '-',
        columnName,
      });
    }
    return { options, previewRows: [row1, row2] };
  }

  async function openBulkImportModal() {
    setIsBulkImportModalOpen(true);
    setBulkVerifyResult(null);
    if (bulkTemplateSpec) return;
    setBulkLoading('template');
    try {
      const spec = await getChecklistBulkTemplateMapping();
      setBulkTemplateSpec(spec);
      if (spec.column_mapping_template) {
        setBulkImportMapping(spec.column_mapping_template);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load bulk template mapping');
    } finally {
      setBulkLoading('');
    }
  }

  async function handleDownloadTemplate(format: 'csv' | 'xlsx') {
    setBulkLoading('download');
    try {
      const token = typeof window === 'undefined' ? '' : window.localStorage.getItem('checklist_access_token') || '';
      const response = await fetch(`${getApiBaseUrl()}/admin/checklists/bulk/template/download?format=${format}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error(`Failed to download template (${response.status})`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `checklist-import-template.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download template');
    } finally {
      setBulkLoading('');
    }
  }

  async function handleVerifyBulkImport() {
    if (!bulkImportFile) {
      toast.error('Select an import file first.');
      return;
    }
    setBulkLoading('verify');
    try {
      const base64 = bulkImportFileBase64 || (await fileToBase64WithoutPrefix(bulkImportFile));
      setBulkImportFileBase64(base64);
      const result = await verifyChecklistBulkImport({
        file_content: base64,
        file_name: bulkImportFile.name,
        column_mapping: bulkImportMapping,
        preview_rows: 10,
      });
      setBulkVerifyResult(result);
      setBulkVerifiedSignature(result.is_valid ? currentBulkSignature : '');
      toast.success('File verified.');
    } catch (err) {
      setBulkVerifyResult(null);
      setBulkVerifiedSignature('');
      toast.error(err instanceof Error ? err.message : 'Failed to verify import file');
    } finally {
      setBulkLoading('');
    }
  }

  async function handleCreateBulkChecklist() {
    if (!bulkImportFile) {
      toast.error('Select an import file first.');
      return;
    }
    if (!canCreateFromFile) {
      toast.error('Verify mapping successfully before creating checklist.');
      return;
    }
    if (!bulkImportTitle.trim()) {
      toast.error('Checklist title is required.');
      return;
    }
    if (!bulkImportDescription.trim()) {
      toast.error('Law decree is required.');
      return;
    }
    setBulkLoading('create');
    try {
      const base64 = bulkImportFileBase64 || (await fileToBase64WithoutPrefix(bulkImportFile));
      setBulkImportFileBase64(base64);
      const created = await createChecklistBulkImport({
        file_content: base64,
        file_name: bulkImportFile.name,
        column_mapping: bulkImportMapping,
        checklist_title: bulkImportTitle.trim(),
        checklist_description: bulkImportDescription.trim(),
        checklist_type_code: 'compliance',
      });
      setBulkImportTasks((previous) => {
        const pendingTask: BulkImportTaskListItem = {
          task_id: created.task_id,
          celery_state: created.status,
          status: created.status,
          detail: created.detail,
          checklist_title: bulkImportTitle.trim(),
          checklist_description: bulkImportDescription.trim(),
          created_at: new Date().toISOString(),
        };
        return [pendingTask, ...previous.filter((task) => task.task_id !== created.task_id)];
      });
      setIsBulkImportModalOpen(false);
      toast.success('Import started. Task is queued.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start bulk import');
    } finally {
      setBulkLoading('');
    }
  }

  async function handleCreateChecklist() {
    if (!createTitle.trim() || !createLawDecree.trim()) {
      toast.error('Title and law decree are required.');
      return;
    }
    setActionLoading('create');
    try {
      const created = await createChecklist({
        title: createTitle.trim(),
        lawDecree: createLawDecree.trim(),
      });
      toast.success('Checklist created.');
      setChecklists((previous) => [created, ...previous]);
      setIsCreateChecklistModalOpen(false);
      router.replace(`/admin/checklists/${created.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create checklist');
    } finally {
      setActionLoading('');
    }
  }

  async function handlePublish(checklistId: string) {
    const checklist = checklists.find((item) => item.id === checklistId);
    if (!checklist?.stripeInfo?.priceAvailable) {
      if ((checklist?.stripeInfo?.priceStatus || '').toLowerCase() === 'below_minimum') {
        toast.error('Price is not valid. Price cannot be below 0.5 USD.');
        return;
      }
      toast.error('Price needed. Set Stripe price before publishing this checklist.');
      return;
    }
    setActionLoading('publish');
    setActiveChecklistId(checklistId);
    try {
      await publishChecklist(checklistId);
      toast.success('Checklist published.');
      await loadChecklists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish checklist');
    } finally {
      setActionLoading('');
      setActiveChecklistId('');
    }
  }

  async function handleDelete(checklistId: string) {
    setActionLoading('delete');
    setActiveChecklistId(checklistId);
    try {
      await deleteChecklist(checklistId);
      toast.success('Checklist deleted.');
      setChecklists((previous) => previous.filter((item) => item.id !== checklistId));
      setConfirmDeleteChecklistId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete checklist');
    } finally {
      setActionLoading('');
      setActiveChecklistId('');
    }
  }

  function openEditModal(checklist: Checklist) {
    setEditChecklistId(checklist.id);
    setEditTitle(checklist.title);
    setEditLawDecree(checklist.lawDecree);
    setEditStatus(checklist.status);
    setOpenCardMenuId(null);
  }

  async function handleUpdateChecklist() {
    if (!editChecklistId) return;
    if (!editTitle.trim() || !editLawDecree.trim()) {
      toast.error('Title and law decree are required.');
      return;
    }
    setEditLoading(true);
    try {
      const updated = await updateChecklist(editChecklistId, {
        title: editTitle.trim(),
        lawDecree: editLawDecree.trim(),
        status: editStatus,
      });
      setChecklists((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
      setEditChecklistId(null);
      toast.success('Checklist updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update checklist');
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <section className="relative min-h-screen bg-[linear-gradient(160deg,#eef3fb_0%,#f8fbff_45%,#eef4ff_100%)] text-[#1f2d45]">
      <div className="w-full px-6 py-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#1f2d45]">Checklists</h1>
          </div>
          {!isReadOnly ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void openBulkImportModal()}
                className="rounded-lg border border-[#2d4f83] bg-[#10284f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#16345f]"
              >
                Import CSV/Excel
              </button>
              <button
                type="button"
                onClick={openCreateChecklistModal}
                disabled={actionLoading === 'create'}
                className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657]"
              >
                {actionLoading === 'create' ? 'Creating...' : '+ New checklist'}
              </button>
            </div>
          ) : null}
        </header>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9db8e6]">Total checklists</p>
            <p className="mt-2 text-2xl font-semibold text-white">{checklists.length}</p>
          </div>
          <div className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9db8e6]">Published</p>
            <p className="mt-2 text-2xl font-semibold text-[#7cf0aa]">{publishedCount}</p>
          </div>
          <div className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9db8e6]">Drafts</p>
            <p className="mt-2 text-2xl font-semibold text-[#a9c7ff]">{draftCount}</p>
          </div>
          <div className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9db8e6]">Published ratio</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {checklists.length ? `${Math.round((publishedCount / checklists.length) * 100)}%` : '0%'}
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search checklists..."
            className="min-w-[280px] flex-1 rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]"
          />
          <div className="flex rounded-xl border border-[#d4dced] bg-[linear-gradient(130deg,#ffffff_0%,#f2f7ff_100%)] p-1">
            {(['all', 'draft', 'published'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${
                  filter === value ? 'bg-[#182843] text-white' : 'text-[#5f7395] hover:bg-[#edf4ff]'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-[#d4dced] bg-[linear-gradient(130deg,#ffffff_0%,#f2f7ff_100%)] p-1">
            {([
              { id: 'all', label: 'All prices' },
              { id: 'set', label: 'Price set' },
              { id: 'not_set', label: 'Price needed' },
            ] as const).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPaymentFilter(option.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  paymentFilter === option.id ? 'bg-[#182843] text-white' : 'text-[#5f7395] hover:bg-[#edf4ff]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-h-[220px]">
          {filtered.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-white xl:min-w-0 xl:flex-1 xl:truncate">{item.title}</h2>
                    <div className="relative flex items-center gap-2 xl:shrink-0 xl:flex-wrap xl:justify-end">
                      {item.stripeInfo ? (
                        <span className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${getFriendlyStripeStatus(item.stripeInfo.priceStatus).className}`}>
                          {getFriendlyStripeStatus(item.stripeInfo.priceStatus).label}
                        </span>
                      ) : null}
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                          item.status === 'published'
                            ? 'bg-[#1f5b3d] text-[#9bf5be]'
                            : 'bg-[#163a72] text-[#c4d6f7]'
                        }`}
                      >
                        {item.status}
                      </span>
                      {!isReadOnly ? (
                        <button
                          type="button"
                          onClick={() => setOpenCardMenuId((prev) => (prev === item.id ? null : item.id))}
                          className="rounded-md border border-[#2d4f83] bg-[#10284f] px-2 py-1 text-xs font-semibold text-[#dce8ff] hover:bg-[#16345f]"
                          aria-label="Checklist options"
                        >
                          ...
                        </button>
                      ) : null}
                      {!isReadOnly && openCardMenuId === item.id ? (
                        <div className="absolute right-0 top-8 z-20 min-w-[120px] rounded-lg border border-[#d4dced] bg-white p-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="w-full rounded-md px-3 py-1.5 text-left text-xs font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteChecklistId(item.id);
                              setOpenCardMenuId(null);
                            }}
                            className="w-full rounded-md px-3 py-1.5 text-left text-xs font-semibold text-[#a73a46] hover:bg-[#fff1f3]"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-[#9db8e6]">{item.lawDecree}</p>
                  <p className="mb-4 text-sm text-[#d8e6ff]">Version: {item.version}</p>
                  {item.stripeInfo?.priceAvailable && item.stripeInfo.priceAmountCents !== null && item.stripeInfo.priceCurrency ? (
                    <p className="mb-2 text-xs text-[#cfe3ff]">
                      Price: {(item.stripeInfo.priceAmountCents / 100).toFixed(2)} {item.stripeInfo.priceCurrency.toUpperCase()}
                    </p>
                  ) : null}
                  {item.warning ? <p className="mb-3 text-xs text-amber-200">{item.warning}</p> : null}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/checklists/${item.id}`)}
                      className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657]"
                    >
                      Open panel
                    </button>
                    {!isReadOnly && item.status === 'draft' ? (
                      <button
                        type="button"
                        onClick={() => void handlePublish(item.id)}
                        disabled={(actionLoading === 'publish' && activeChecklistId === item.id) || !item.stripeInfo?.priceAvailable}
                        className="rounded-lg border border-[#2d4f83] bg-[#10284f] px-3 py-2 text-xs font-semibold text-[#9bf5be] hover:bg-[#16345f] disabled:opacity-60"
                        title={item.stripeInfo?.priceAvailable ? 'Publish checklist' : 'Price needed before publishing'}
                      >
                        {actionLoading === 'publish' && activeChecklistId === item.id ? 'Publishing...' : 'Publish'}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#cad5ea] bg-[linear-gradient(160deg,#ffffff_0%,#f3f7ff_100%)] p-10 text-center shadow-sm">
              <p className="text-base font-semibold text-[#25375a]">No checklists found</p>
              <p className="mt-1 text-sm text-[#607594]">Try a different search or filter.</p>
            </div>
          )}
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/65 backdrop-blur-[1px]">
              <div className="flex items-center gap-3 rounded-xl border border-[#dbe4f4] bg-white px-4 py-3 shadow-sm">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2d4f83] border-t-transparent" />
                <span className="text-sm font-medium text-[#1f2d45]">Loading checklists...</span>
              </div>
            </div>
          ) : null}
        </div>

        {bulkImportTasks.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bulkImportTasks.map((task) => (
              <div key={task.task_id} className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9db8e6]">Import progress</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {task.checklist_title && task.checklist_title !== 'Unknown'
                        ? task.checklist_title
                        : 'Bulk checklist creation'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#e6f1fb] px-2 py-1 text-[11px] font-semibold text-[#185fa5]">
                        Status: {task.status}
                      </span>
                    </div>
                    {task.detail ? (
                      <p className="mt-2 text-xs text-[#d8e6ff]">{task.detail}</p>
                    ) : (
                      <p className="mt-2 text-xs text-[#9db8e6]">Task is pending execution.</p>
                    )}
                    {task.result?.status?.toLowerCase() === 'success' ? (
                      <p className="mt-2 text-xs font-medium text-[#9bf5be]">
                        Checklist created: {task.result.checklist_title} ({task.result.total_rows_processed} rows)
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isReadOnly && confirmDeleteChecklistId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-[#1f2d45]">Delete checklist?</h2>
              <p className="mt-2 text-sm text-[#607594]">
                This action cannot be undone. Are you sure you want to delete this checklist?
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteChecklistId(null)}
                  disabled={actionLoading === 'delete'}
                  className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(confirmDeleteChecklistId)}
                  disabled={actionLoading === 'delete'}
                  className="rounded-lg border border-[#d45f6b] bg-[#fff1f3] px-3 py-1.5 text-sm font-semibold text-[#a73a46] disabled:opacity-60"
                >
                  {actionLoading === 'delete' ? 'Deleting...' : 'Confirm delete'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {!isReadOnly && isCreateChecklistModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-[#1f2d45]">New checklist</h2>
              <p className="mt-1 text-sm text-[#607594]">Fill checklist details before creating.</p>
              <div className="mt-4 space-y-3">
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Title *</span>
                  <input
                    value={createTitle}
                    onChange={(event) => setCreateTitle(event.target.value)}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                    placeholder="Checklist title"
                  />
                </label>
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Law decree *</span>
                  <input
                    value={createLawDecree}
                    onChange={(event) => setCreateLawDecree(event.target.value)}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                    placeholder="Law decree"
                  />
                </label>
                              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateChecklistModalOpen(false)}
                  disabled={actionLoading === 'create'}
                  className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreateChecklist()}
                  disabled={actionLoading === 'create'}
                  className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                >
                  {actionLoading === 'create' ? 'Creating...' : 'Create checklist'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {!isReadOnly && editChecklistId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-[#1f2d45]">Edit checklist</h2>
              <p className="mt-1 text-sm text-[#607594]">Update checklist metadata.</p>
              <div className="mt-4 space-y-3">
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Title *</span>
                  <input
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                  />
                </label>
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Law decree *</span>
                  <input
                    value={editLawDecree}
                    onChange={(event) => setEditLawDecree(event.target.value)}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                  />
                </label>
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Status *</span>
                  <select
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value as 'draft' | 'published')}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </label>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditChecklistId(null)}
                  disabled={editLoading}
                  className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleUpdateChecklist()}
                  disabled={editLoading}
                  className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                >
                  {editLoading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {!isReadOnly && isBulkImportModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4 py-6">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#1f2d45]">Bulk checklist import</h2>
                  <p className="mt-1 text-sm text-[#607594]">Upload CSV/Excel, verify mappings, then create checklist in background.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBulkImportModalOpen(false)}
                  className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff]"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-[#3b4d6c]">
                  <span className="font-medium">Checklist title *</span>
                  <input
                    value={bulkImportTitle}
                    onChange={(event) => setBulkImportTitle(event.target.value)}
                    className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                    placeholder="Imported checklist title"
                  />
                </label>
              </div>

              <label className="mt-3 block space-y-2 text-sm text-[#3b4d6c]">
                <span className="font-medium">Law decree *</span>
                <textarea
                  value={bulkImportDescription}
                  onChange={(event) => setBulkImportDescription(event.target.value)}
                  className="min-h-[84px] w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2"
                />
              </label>

              <div className="mt-3 grid gap-3 rounded-xl border border-[#dbe4f4] bg-[#f8fbff] p-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => void handleDownloadTemplate('csv')}
                  disabled={bulkLoading === 'download'}
                  className="rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] hover:bg-[#edf4ff] disabled:opacity-60"
                >
                  Download CSV template
                </button>
                <button
                  type="button"
                  onClick={() => void handleDownloadTemplate('xlsx')}
                  disabled={bulkLoading === 'download'}
                  className="rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] hover:bg-[#edf4ff] disabled:opacity-60"
                >
                  Download Excel template
                </button>
                <label className="flex cursor-pointer items-center justify-center rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
                  Select file
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0] ?? null;
                      setBulkImportFile(file);
                      setBulkVerifyResult(null);
                      setBulkVerifiedSignature('');
                      setBulkHeaderOptions([]);
                      setBulkHeaderPreviewRows([]);
                      if (!file) {
                        setBulkImportFileBase64('');
                        return;
                      }
                      try {
                        const base64 = await fileToBase64WithoutPrefix(file);
                        setBulkImportFileBase64(base64);
                        const parsed = await parseHeaderOptionsFromFile(file);
                        setBulkHeaderOptions(parsed.options);
                        setBulkHeaderPreviewRows(parsed.previewRows);
                      } catch {
                        setBulkImportFileBase64('');
                        setBulkHeaderOptions([]);
                        setBulkHeaderPreviewRows([]);
                      }
                    }}
                  />
                </label>
              </div>

              {bulkImportFile ? (
                <p className="mt-2 text-xs text-[#5f7395]">
                  File: <span className="font-semibold text-[#25375a]">{bulkImportFile.name}</span>
                </p>
              ) : null}
              {bulkHeaderPreviewRows.length ? (
                <div className="mt-2 rounded-xl border border-[#dbe4f4] bg-[#f8fbff] p-3">
                  <p className="text-xs font-semibold text-[#3b4d6c]">Detected header rows preview</p>
                  <div className="mt-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <table className="min-w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#eef3fb] text-left text-[#4a6187]">
                          <th className="border border-[#dbe4f4] px-2 py-1">Row</th>
                          {bulkHeaderPreviewRows[0].map((_, colIndex) => (
                            <th key={`col-${colIndex}`} className="border border-[#dbe4f4] px-2 py-1">
                              Column {colIndex + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bulkHeaderPreviewRows.map((row, rowIndex) => (
                          <tr key={`header-row-${rowIndex}`} className="text-[#334866]">
                            <td className="border border-[#dbe4f4] px-2 py-1">Header row {rowIndex + 1}</td>
                            {row.map((value, colIndex) => (
                              <td key={`header-cell-${rowIndex}-${colIndex}`} className="border border-[#dbe4f4] px-2 py-1">
                                {value || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 rounded-xl border border-[#dbe4f4] p-4">
                <h3 className="text-sm font-semibold text-[#25375a]">Column mapping</h3>
                {bulkTemplateSpec?.description ? <p className="mt-1 text-xs text-[#607594]">{bulkTemplateSpec.description}</p> : null}
                <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {(Object.entries(bulkImportMapping) as Array<[keyof BulkImportColumnMapping, string]>).map(([key, value]) => (
                    <label key={key} className="block space-y-1 text-xs text-[#566b8d]">
                      <span className="flex items-center gap-2">
                        <span>{BULK_MAPPING_LABELS[key]}</span>
                        {getColumnBadge(key, bulkTemplateSpec) === 'required' ? (
                          <span className="rounded-full bg-[#ffe9ec] px-2 py-0.5 text-[10px] font-semibold text-[#a73a46]">
                            Required
                          </span>
                        ) : null}
                        {getColumnBadge(key, bulkTemplateSpec) === 'optional' ? (
                          <span className="rounded-full bg-[#eaf2ff] px-2 py-0.5 text-[10px] font-semibold text-[#355a96]">
                            Optional
                          </span>
                        ) : null}
                      </span>
                      <select
                        value={value}
                        onChange={(event) =>
                          setBulkImportMapping((previous) => ({ ...previous, [key]: event.target.value }))
                        }
                        className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-1.5 text-sm"
                      >
                        {bulkHeaderOptions.length ? (
                          bulkHeaderOptions.map((option) => (
                            <option key={`${key}-${option.columnName}`} value={option.columnName}>
                              {option.displayLabel}
                            </option>
                          ))
                        ) : (
                          <option value={value}>{value}</option>
                        )}
                      </select>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleVerifyBulkImport()}
                    disabled={bulkLoading === 'verify' || !bulkImportFile}
                    className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                  >
                    {bulkLoading === 'verify' ? 'Verifying...' : 'Verify mapping'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCreateBulkChecklist()}
                    disabled={!canCreateFromFile}
                    className="rounded-lg border border-[#2d4f83] bg-[#10284f] px-3 py-2 text-xs font-semibold text-[#9bf5be] hover:bg-[#16345f] disabled:opacity-60"
                  >
                    {bulkLoading === 'create' ? 'Creating...' : 'Create checklist from file'}
                  </button>
                </div>
              </div>

              {bulkVerifyResult ? (
                <div className="mt-4 rounded-xl border border-[#dbe4f4] p-4">
                  <h3 className="text-sm font-semibold text-[#25375a]">Verification result</h3>
                  <p className="mt-1 text-xs text-[#607594]">
                    Valid rows: {bulkVerifyResult.valid_rows}/{bulkVerifyResult.total_rows} | Invalid rows: {bulkVerifyResult.invalid_rows}
                  </p>
                  {bulkVerifyResult.warnings?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-700">
                      {bulkVerifyResult.warnings.map((warning, index) => (
                        <li key={`${warning}-${index}`}>{warning}</li>
                      ))}
                    </ul>
                  ) : null}
                  {bulkVerifyResult.preview_rows?.length ? (
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#f7f9fe] text-left text-[#4a6187]">
                            <th className="border border-[#e2e8f5] px-2 py-1">Row</th>
                            <th className="border border-[#e2e8f5] px-2 py-1">Section</th>
                            <th className="border border-[#e2e8f5] px-2 py-1">Question ID</th>
                            <th className="border border-[#e2e8f5] px-2 py-1">Severity</th>
                            <th className="border border-[#e2e8f5] px-2 py-1">Valid</th>
                            <th className="border border-[#e2e8f5] px-2 py-1">Errors</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkVerifyResult.preview_rows.map((row) => (
                            <tr key={row.row_number} className="text-[#334866]">
                              <td className="border border-[#e2e8f5] px-2 py-1">{row.row_number}</td>
                              <td className="border border-[#e2e8f5] px-2 py-1">{row.section_name}</td>
                              <td className="border border-[#e2e8f5] px-2 py-1">{row.parent_question_id}</td>
                              <td className="border border-[#e2e8f5] px-2 py-1">{row.severity}</td>
                              <td className="border border-[#e2e8f5] px-2 py-1">{row.is_valid ? 'Yes' : 'No'}</td>
                              <td className="border border-[#e2e8f5] px-2 py-1">{row.errors?.join(', ') || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              ) : null}

            </div>
          </div>
        ) : null}

      </div>
    </section>
  );
}
