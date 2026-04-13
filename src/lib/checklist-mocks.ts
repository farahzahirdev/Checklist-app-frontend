import type { Checklist, ChecklistQuestion, ChecklistSection, EvidenceItem, ReportSummary } from '@/lib/checklist-types';
import { EVIDENCE_ALLOWED_MIME_TYPES, EVIDENCE_MAX_FILE_SIZE_BYTES } from '@/lib/upload-rules';

export const mockChecklist: Checklist = {
  id: 'chk-1',
  title: 'Cybersecurity Audit Readiness',
  auditType: 'compliance',
  lawDecree: 'ZKB / Decree No. 409/2025',
  version: 'v1.0',
  status: 'draft',
  createdAt: '2026-04-13T10:00:00Z',
  updatedAt: '2026-04-13T10:00:00Z',
};

export const mockSections: ChecklistSection[] = [
  { id: 'sec-1', checklistId: 'chk-1', title: 'Scope Definition', order: 1 },
  { id: 'sec-2', checklistId: 'chk-1', title: 'Organizational Measures', order: 2 },
];

export const mockQuestions: ChecklistQuestion[] = [
  {
    id: 'q-1',
    checklistId: 'chk-1',
    sectionId: 'sec-1',
    questionId: 'Q-001',
    securityLevel: 'high',
    auditType: 'compliance',
    legalRequirement: 'Section 12 - Scope Definition of Cybersecurity Management',
    explanation: 'Confirm all assets related to the regulated service are included in scope.',
    expectedImplementation: 'Maintain documented scope records and regular review updates.',
    points: 4,
    customerAnswer: null,
    customerAnswerStatus: 'not_started',
    note: null,
    evidenceRule: {
      allowedMimeTypes: [...EVIDENCE_ALLOWED_MIME_TYPES],
      maxFileSizeBytes: EVIDENCE_MAX_FILE_SIZE_BYTES,
    },
  },
];

export const mockEvidence: EvidenceItem = {
  id: 'ev-1',
  questionId: 'q-1',
  fileName: 'network-scope-example.png',
  mimeType: 'image/png',
  sizeBytes: 42000,
  uploadedAt: '2026-04-13T10:00:00Z',
  previewUrl: 'https://placehold.co/1200x800/png',
  exampleText: 'Example evidence: architecture diagram showing scoped primary and supporting assets.',
};

export const mockReportSummary: ReportSummary = {
  reportId: 'RPT-2026-0001',
  corporationName: 'Example Corporation Ltd',
  reportDate: '2026-04-13',
  maturityScore: 67,
  maturityOverview: 'Core controls exist but policy documentation and periodic review are inconsistent.',
  topPriorities: ['Formalize scope review cadence', 'Strengthen asset inventory ownership', 'Close high-risk gaps'],
  totalQuestionsAnswered: 42,
  standardsCovered: ['ISO 27001'],
  domainScores: [
    { domain: 'Governance', score: 70 },
    { domain: 'Risk Management', score: 61 },
    { domain: 'Assets Management', score: 58 },
    { domain: 'Access Control', score: 66 },
    { domain: 'Data Protection', score: 69 },
    { domain: 'Incident Response', score: 63 },
    { domain: 'Compliance', score: 72 },
  ],
  highRisks: 5,
  mediumRisks: 11,
  lowRisks: 18,
  findings: [
    {
      id: 'F-001',
      finding: 'Scope review process is not consistently documented.',
      domain: 'Governance',
      riskImpact: 'high',
      recommendation: 'Set quarterly scope review with evidence trail and owner approvals.',
    },
  ],
  highlights: ['Asset scope baseline is in place', 'Most primary assets have initial mapping completed'],
};
