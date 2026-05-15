import { CHECKLIST_PRIMARY_LANGUAGE, CHECKLIST_SECONDARY_LANGUAGE } from '@/lib/checklist-translation-api';

export type DefaultAnswerOption = {
  label: string;
  score: string;
  choiceCode: string;
  description: string;
};

const DEFAULT_ANSWER_OPTIONS_CS: DefaultAnswerOption[] = [
  {
    label: 'Ano',
    score: '4',
    choiceCode: 'YES',
    description: 'Kontrola je plně implementována.',
  },
  {
    label: 'Možná',
    score: '3',
    choiceCode: 'MAYBE',
    description: 'Kontrola je částečně implementována nebo je nejistá.',
  },
  {
    label: 'Jistě',
    score: '2',
    choiceCode: 'SURE',
    description: 'Kontrola je spolehlivě implementována.',
  },
  {
    label: 'Ne',
    score: '1',
    choiceCode: 'NO',
    description: 'Kontrola není implementována.',
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
    label: 'Maybe',
    score: '3',
    choiceCode: 'MAYBE',
    description: 'Control is partially implemented or uncertain.',
  },
  {
    label: 'Sure',
    score: '2',
    choiceCode: 'SURE',
    description: 'Control is confidently implemented.',
  },
  {
    label: 'No',
    score: '1',
    choiceCode: 'NO',
    description: 'Control is not implemented.',
  },
];

/** English template labels on primary (CS) rows — used for backfill matching. */
export const EN_TEMPLATE_ANSWER_LABELS: Record<string, string> = {
  Yes: 'Ano',
  Maybe: 'Možná',
  Sure: 'Jistě',
  No: 'Ne',
};

/** English template descriptions still stored on primary (CS) rows — used for one-time backfill matching. */
export const EN_TEMPLATE_ANSWER_DESCRIPTIONS: Record<string, string> = {
  'Control is fully implemented.': 'Kontrola je plně implementována.',
  'Control is partially implemented or uncertain.': 'Kontrola je částečně implementována nebo je nejistá.',
  'Control is confidently implemented.': 'Kontrola je spolehlivě implementována.',
  'Control is not implemented.': 'Kontrola není implementována.',
};

export function getDefaultAnswerOptions(locale: string): DefaultAnswerOption[] {
  if (locale === CHECKLIST_SECONDARY_LANGUAGE) {
    return DEFAULT_ANSWER_OPTIONS_EN.map((option) => ({ ...option }));
  }
  return DEFAULT_ANSWER_OPTIONS_CS.map((option) => ({ ...option }));
}

export function getPrimaryDefaultAnswerOptions(): DefaultAnswerOption[] {
  return getDefaultAnswerOptions(CHECKLIST_PRIMARY_LANGUAGE);
}
