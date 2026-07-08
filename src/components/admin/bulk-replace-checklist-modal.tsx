'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  getChecklistBulkImportTaskStatus,
  getChecklistBulkTemplateMapping,
  replaceChecklistBulkImport,
  verifyChecklistBulkImport,
  type BulkImportColumnMapping,
  type BulkImportTemplateSpec,
  type BulkImportVerifyResponse,
} from '@/lib/checklist-api';
import { translate, useLocale } from '@/lib/i18n';
import { adminChecklistBuilderMessages } from '@/locales/admin-checklist-builder';

type ParsedHeaderOption = {
  letter: string;
  displayLabel: string;
  row1: string;
  row2: string;
  columnName: string;
};

const BULK_COLUMN_I18N_KEY: Record<keyof BulkImportColumnMapping, string> = {
  section_name_col: 'bulkReplace.columns.sectionName',
  question_id_col: 'bulkReplace.columns.parentQuestionId',
  child_question_col: 'bulkReplace.columns.childQuestionId',
  grandchild_question_col: 'bulkReplace.columns.grandchildQuestionId',
  legal_requirement_col: 'bulkReplace.columns.legalRequirement',
  question_text_col: 'bulkReplace.columns.questionText',
  severity_col: 'bulkReplace.columns.severity',
  explanation_col: 'bulkReplace.columns.explanation',
  expected_implementation_col: 'bulkReplace.columns.expectedImplementation',
  source_ref_col: 'bulkReplace.columns.sourceRef',
  guidance_score_4_col: 'bulkReplace.columns.guidanceScore4',
  guidance_score_3_col: 'bulkReplace.columns.guidanceScore3',
  guidance_score_2_col: 'bulkReplace.columns.guidanceScore2',
  guidance_score_1_col: 'bulkReplace.columns.guidanceScore1',
};

const DEFAULT_MAPPING: BulkImportColumnMapping = {
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
};

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

function getColumnBadge(
  key: keyof BulkImportColumnMapping,
  templateSpec: BulkImportTemplateSpec | null,
): 'required' | 'optional' | null {
  if (!templateSpec) return null;
  if (templateSpec.required_columns?.includes(key)) return 'required';
  if (templateSpec.optional_columns?.includes(key)) return 'optional';
  return null;
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
    const display = sub ? (main && main !== sub ? `${main} -> ${sub}` : sub) : main || `Column ${letter}`;

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

type Props = {
  checklistId: string;
  checklistTitle: string;
  checklistDescription: string;
  open: boolean;
  onClose: () => void;
  onCompleted: () => void;
};

export function BulkReplaceChecklistModal({
  checklistId,
  checklistTitle,
  checklistDescription,
  open,
  onClose,
  onCompleted,
}: Props) {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) =>
    translate(adminChecklistBuilderMessages, locale, key, values);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [templateSpec, setTemplateSpec] = useState<BulkImportTemplateSpec | null>(null);
  const [mapping, setMapping] = useState<BulkImportColumnMapping>({ ...DEFAULT_MAPPING });
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState('');
  const [headerOptions, setHeaderOptions] = useState<ParsedHeaderOption[]>([]);
  const [headerPreviewRows, setHeaderPreviewRows] = useState<string[][]>([]);
  const [verifyResult, setVerifyResult] = useState<BulkImportVerifyResponse | null>(null);
  const [verifiedSignature, setVerifiedSignature] = useState('');
  const [loading, setLoading] = useState<'template' | 'verify' | 'replace' | 'poll' | ''>('');
  const [progressDetail, setProgressDetail] = useState('');

  const currentSignature = useMemo(
    () => JSON.stringify({ file: file?.name ?? '', size: file?.size ?? 0, mapping }),
    [file, mapping],
  );
  const canReplace = Boolean(verifyResult?.is_valid && verifiedSignature && verifiedSignature === currentSignature);

  useEffect(() => {
    if (!open || templateSpec) return;
    let cancelled = false;
    (async () => {
      setLoading('template');
      try {
        const spec = await getChecklistBulkTemplateMapping();
        if (cancelled) return;
        setTemplateSpec(spec);
        if (spec.column_mapping_template) {
          setMapping(spec.column_mapping_template);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('bulkReplace.toast.loadTemplateFailed'));
      } finally {
        if (!cancelled) setLoading('');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load template once when modal opens
  }, [open, templateSpec]);

  function resetFileState() {
    setFile(null);
    setFileBase64('');
    setVerifyResult(null);
    setVerifiedSignature('');
    setHeaderOptions([]);
    setHeaderPreviewRows([]);
    setProgressDetail('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleClose() {
    if (loading === 'replace' || loading === 'poll') return;
    resetFileState();
    onClose();
  }

  async function handleFileChange(selected: File | null) {
    setFile(selected);
    setFileBase64('');
    setVerifyResult(null);
    setVerifiedSignature('');
    setHeaderOptions([]);
    setHeaderPreviewRows([]);
    if (!selected) return;
    try {
      const parsed = await parseHeaderOptionsFromFile(selected);
      setHeaderOptions(parsed.options);
      setHeaderPreviewRows(parsed.previewRows);
    } catch {
      // CSV or unsupported preview — mapping still editable via defaults/template values.
    }
  }

  async function handleVerify() {
    if (!file) {
      toast.error(t('bulkReplace.toast.selectFileFirst'));
      return;
    }
    setLoading('verify');
    try {
      const base64 = fileBase64 || (await fileToBase64WithoutPrefix(file));
      setFileBase64(base64);
      const result = await verifyChecklistBulkImport({
        file_content: base64,
        file_name: file.name,
        column_mapping: mapping,
        preview_rows: 10,
      });
      setVerifyResult(result);
      setVerifiedSignature(result.is_valid ? currentSignature : '');
      toast.success(t('bulkReplace.toast.verified'));
    } catch (err) {
      setVerifyResult(null);
      setVerifiedSignature('');
      toast.error(err instanceof Error ? err.message : t('bulkReplace.toast.verifyFailed'));
    } finally {
      setLoading('');
    }
  }

  async function pollTaskUntilDone(taskId: string) {
    setLoading('poll');
    const started = Date.now();
    const timeoutMs = 5 * 60 * 1000;
    while (Date.now() - started < timeoutMs) {
      const status = await getChecklistBulkImportTaskStatus(taskId);
      setProgressDetail(status.detail || status.status);
      if (status.status === 'success' || status.status === 'success_with_warnings') {
        toast.success(status.result?.message || t('bulkReplace.toast.replaceSuccess'));
        resetFileState();
        onCompleted();
        onClose();
        return;
      }
      if (status.status === 'failed') {
        throw new Error(status.error || status.detail || t('bulkReplace.toast.replaceFailed'));
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    throw new Error(t('bulkReplace.toast.replaceTimeout'));
  }

  async function handleReplace() {
    if (!file) {
      toast.error(t('bulkReplace.toast.selectFileFirst'));
      return;
    }
    if (!canReplace) {
      toast.error(t('bulkReplace.toast.verifyFirst'));
      return;
    }
    setLoading('replace');
    setProgressDetail(t('bulkReplace.progress.queued'));
    try {
      const base64 = fileBase64 || (await fileToBase64WithoutPrefix(file));
      setFileBase64(base64);
      const queued = await replaceChecklistBulkImport(checklistId, {
        file_content: base64,
        file_name: file.name,
        column_mapping: mapping,
        checklist_title: checklistTitle.trim() || undefined,
        checklist_description: checklistDescription.trim() || undefined,
      });
      toast.success(t('bulkReplace.toast.replaceStarted'));
      await pollTaskUntilDone(queued.task_id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('bulkReplace.toast.replaceFailed'));
    } finally {
      setLoading('');
      setProgressDetail('');
    }
  }

  if (!open) return null;

  const busy = loading === 'replace' || loading === 'poll';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1f2d45]">{t('bulkReplace.title')}</h2>
            <p className="mt-1 text-sm text-[#607594]">{t('bulkReplace.subtitle')}</p>
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {t('bulkReplace.warning')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#5f7395] hover:bg-[#f3f5fb] disabled:opacity-50"
          >
            {t('bulkReplace.close')}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
          >
            {t('bulkReplace.selectFile')}
          </button>
          <button
            type="button"
            onClick={resetFileState}
            disabled={busy}
            className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-sm font-semibold text-[#5f7395] hover:bg-[#f3f5fb] disabled:opacity-50"
          >
            {t('bulkReplace.clearData')}
          </button>
          {file ? (
            <span className="text-xs text-[#566b8d]">
              {t('bulkReplace.filePrefix')} {file.name}
            </span>
          ) : null}
        </div>

        {headerPreviewRows.length ? (
          <div className="mt-4 rounded-xl border border-[#dbe4f4] p-4">
            <h3 className="text-sm font-semibold text-[#25375a]">{t('bulkReplace.headerPreviewTitle')}</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f9fe] text-left text-[#4a6187]">
                    <th className="border border-[#dbe4f4] px-2 py-1">{t('bulkReplace.table.row')}</th>
                    {headerOptions.map((option) => (
                      <th key={option.columnName} className="border border-[#dbe4f4] px-2 py-1">
                        {option.letter}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {headerPreviewRows.map((row, rowIndex) => (
                    <tr key={`header-row-${rowIndex}`} className="text-[#334866]">
                      <td className="border border-[#dbe4f4] px-2 py-1">
                        {t('bulkReplace.table.headerRowN', { n: String(rowIndex + 1) })}
                      </td>
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
          <h3 className="text-sm font-semibold text-[#25375a]">{t('bulkReplace.columnMapping')}</h3>
          <p className="mt-1 text-xs text-[#607594]">{t('bulkReplace.mappingDescription')}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(Object.entries(mapping) as Array<[keyof BulkImportColumnMapping, string]>).map(([key, value]) => (
              <label key={key} className="block space-y-1 text-xs text-[#566b8d]">
                <span className="flex items-center gap-2">
                  <span>{t(BULK_COLUMN_I18N_KEY[key])}</span>
                  {getColumnBadge(key, templateSpec) === 'required' ? (
                    <span className="rounded-full bg-[#ffe9ec] px-2 py-0.5 text-[10px] font-semibold text-[#a73a46]">
                      {t('bulkReplace.badge.required')}
                    </span>
                  ) : null}
                  {getColumnBadge(key, templateSpec) === 'optional' ? (
                    <span className="rounded-full bg-[#eaf2ff] px-2 py-0.5 text-[10px] font-semibold text-[#355a96]">
                      {t('bulkReplace.badge.optional')}
                    </span>
                  ) : null}
                </span>
                <select
                  value={value}
                  disabled={busy}
                  onChange={(event) => setMapping((previous) => ({ ...previous, [key]: event.target.value }))}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-1.5 text-sm"
                >
                  {headerOptions.length ? (
                    headerOptions.map((option) => (
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleVerify()}
              disabled={loading === 'verify' || busy || !file}
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-xs font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {loading === 'verify' ? t('bulkReplace.verifying') : t('bulkReplace.verifyMapping')}
            </button>
            <button
              type="button"
              onClick={() => void handleReplace()}
              disabled={!canReplace || busy}
              className="rounded-lg border border-[#2d4f83] bg-[#10284f] px-3 py-2 text-xs font-semibold text-[#9bf5be] hover:bg-[#16345f] disabled:opacity-60"
            >
              {busy ? t('bulkReplace.replacing') : t('bulkReplace.replaceFromFile')}
            </button>
            {progressDetail ? <span className="text-xs text-[#566b8d]">{progressDetail}</span> : null}
          </div>
        </div>

        {verifyResult ? (
          <div className="mt-4 rounded-xl border border-[#dbe4f4] p-4">
            <h3 className="text-sm font-semibold text-[#25375a]">{t('bulkReplace.verificationTitle')}</h3>
            <p className="mt-1 text-xs text-[#607594]">
              {t('bulkReplace.verificationSummary', {
                valid: String(verifyResult.valid_rows),
                total: String(verifyResult.total_rows),
                invalid: String(verifyResult.invalid_rows),
              })}
            </p>
            {verifyResult.warnings?.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-700">
                {verifyResult.warnings.map((warning, index) => (
                  <li key={`${warning}-${index}`}>{warning}</li>
                ))}
              </ul>
            ) : null}
            {verifyResult.preview_rows?.length ? (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f7f9fe] text-left text-[#4a6187]">
                      <th className="border border-[#e2e8f5] px-2 py-1">{t('bulkReplace.table.row')}</th>
                      <th className="border border-[#e2e8f5] px-2 py-1">{t('bulkReplace.tablePreview.section')}</th>
                      <th className="border border-[#e2e8f5] px-2 py-1">{t('bulkReplace.tablePreview.questionId')}</th>
                      <th className="border border-[#e2e8f5] px-2 py-1">{t('bulkReplace.tablePreview.severity')}</th>
                      <th className="border border-[#e2e8f5] px-2 py-1">{t('bulkReplace.tablePreview.valid')}</th>
                      <th className="border border-[#e2e8f5] px-2 py-1">{t('bulkReplace.tablePreview.errors')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifyResult.preview_rows.map((row) => (
                      <tr key={row.row_number} className="text-[#334866]">
                        <td className="border border-[#e2e8f5] px-2 py-1">{row.row_number}</td>
                        <td className="border border-[#e2e8f5] px-2 py-1">{row.section_name}</td>
                        <td className="border border-[#e2e8f5] px-2 py-1">{row.parent_question_id}</td>
                        <td className="border border-[#e2e8f5] px-2 py-1">{row.severity}</td>
                        <td className="border border-[#e2e8f5] px-2 py-1">
                          {row.is_valid ? t('bulkReplace.tablePreview.yes') : t('bulkReplace.tablePreview.no')}
                        </td>
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
  );
}
