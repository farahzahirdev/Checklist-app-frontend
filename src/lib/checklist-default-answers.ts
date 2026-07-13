import { CHECKLIST_PRIMARY_LANGUAGE, CHECKLIST_SECONDARY_LANGUAGE } from '@/lib/checklist-translation-api';

export type DefaultAnswerOption = {
  label: string;
  score: string;
  choiceCode: string;
  description: string;
};

/** Canonical short answer labels — the only values allowed in the Answer field. */
export const CANONICAL_ANSWER_LABELS_EN = ['Yes', 'Partially', 'No', "Don't know"] as const;
export const CANONICAL_ANSWER_LABELS_CS = ['Ano', 'Částečně', 'Ne', 'Nevím'] as const;

const DEFAULT_ANSWER_OPTIONS_CS: DefaultAnswerOption[] = [
  {
    label: 'Ano',
    score: '4',
    choiceCode: 'YES',
    description: 'Kontrola je plně implementována.',
  },
  {
    label: 'Částečně',
    score: '3',
    choiceCode: 'PARTIAL',
    description: 'Kontrola je částečně implementována.',
  },
  {
    label: 'Ne',
    score: '2',
    choiceCode: 'NO',
    description: 'Kontrola není implementována.',
  },
  {
    label: 'Nevím',
    score: '1',
    choiceCode: 'DONT_KNOW',
    description: 'Nelze posoudit nebo není známo.',
  },
];

const DEFAULT_ANSWER_OPTIONS_EN: DefaultAnswerOption[] = [
  {
    label: 'Yes',
    score: '4',
    choiceCode: 'YES',
    description: 'Control is fully implemented.',
  },
  {
    label: 'Partially',
    score: '3',
    choiceCode: 'PARTIAL',
    description: 'Control is partially implemented.',
  },
  {
    label: 'No',
    score: '2',
    choiceCode: 'NO',
    description: 'Control is not implemented.',
  },
  {
    label: "Don't know",
    score: '1',
    choiceCode: 'DONT_KNOW',
    description: 'Cannot assess or unknown.',
  },
];

/** Legacy English template labels still present in older data. */
export const EN_TEMPLATE_ANSWER_LABELS: Record<string, string> = {
  Yes: 'Ano',
  Partially: 'Částečně',
  "Don't know": 'Nevím',
  No: 'Ne',
  // Older template set
  Maybe: 'Částečně',
  Sure: 'Ne',
};

/** English template descriptions still stored on primary (CS) rows — used for one-time backfill matching. */
export const EN_TEMPLATE_ANSWER_DESCRIPTIONS: Record<string, string> = {
  'Control is fully implemented.': 'Kontrola je plně implementována.',
  'Control is partially implemented.': 'Kontrola je částečně implementována.',
  'Control is partially implemented or uncertain.': 'Kontrola je částečně implementována.',
  'Control is confidently implemented.': 'Kontrola není implementována.',
  'Control is not implemented.': 'Kontrola není implementována.',
  'Cannot assess or unknown.': 'Nelze posoudit nebo není známo.',
};

const ALLOWED_LABEL_SET = new Set(
  [
    ...CANONICAL_ANSWER_LABELS_EN,
    ...CANONICAL_ANSWER_LABELS_CS,
    'Maybe',
    'Sure',
    'Možná',
    'Jistě',
    'Dont know',
    "I don't know",
    'I don’t know',
    'Nevim',
  ].map((label) => label.trim().toLowerCase()),
);

export function getDefaultAnswerOptions(locale: string): DefaultAnswerOption[] {
  if (locale === CHECKLIST_SECONDARY_LANGUAGE) {
    return DEFAULT_ANSWER_OPTIONS_EN.map((option) => ({ ...option }));
  }
  return DEFAULT_ANSWER_OPTIONS_CS.map((option) => ({ ...option }));
}

export function getPrimaryDefaultAnswerOptions(): DefaultAnswerOption[] {
  return getDefaultAnswerOptions(CHECKLIST_PRIMARY_LANGUAGE);
}

export function getFixedAnswerOption(index: number, locale: string): DefaultAnswerOption {
  const defaults = getDefaultAnswerOptions(locale);
  return defaults[Math.min(Math.max(index, 0), defaults.length - 1)]!;
}

export function isAllowedAnswerLabel(value: string): boolean {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return false;
  return ALLOWED_LABEL_SET.has(normalized);
}

/**
 * Force the Answer label to the canonical short option for this slot.
 * If the stored label was free text and description is empty, move that text into description.
 */
export function coerceAnswerOptionToCanonical<
  T extends { label: string; description: string; choiceCode?: string; score?: string },
>(option: T, index: number, locale: string): T & { label: string; description: string; choiceCode: string; score: string } {
  const fixed = getFixedAnswerOption(index, locale);
  const rawLabel = String(option.label ?? '').trim();
  const existingDescription = String(option.description ?? '').trim();

  let description = existingDescription;
  if (!description && rawLabel && !isAllowedAnswerLabel(rawLabel)) {
    const stripped = stripLeadingCanonicalChoice(rawLabel);
    description = stripped || rawLabel;
  }

  return {
    ...option,
    label: fixed.label,
    score: fixed.score,
    choiceCode: fixed.choiceCode,
    description,
  };
}

function stripLeadingCanonicalChoice(rawLabel: string): string {
  const pattern =
    /^(don't know|dont know|i don't know|i don’t know|nevim|nevím|partially|partial|maybe|sure|yes|no|ano|částečně|castecne|možná|mozna|jistě|jiste)\b[\s:–—\-.]*/i;
  return rawLabel.replace(pattern, '').trim();
}
