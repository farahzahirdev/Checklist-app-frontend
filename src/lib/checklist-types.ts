export type RiskLevel = 'low' | 'medium' | 'high';
export type AnswerStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_review';
export type AuditType = 'compliance';

export type ChecklistStatus = 'draft' | 'published';

export interface EvidenceRule {
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
}

export interface Checklist {
  id: string;
  title: string;
  auditType: AuditType;
  lawDecree: string;
  version: string;
  status: ChecklistStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistSection {
  id: string;
  checklistId: string;
  title: string;
  order: number;
}

export interface ChecklistQuestion {
  id: string;
  checklistId: string;
  sectionId: string;
  questionId: string;
  securityLevel: RiskLevel;
  auditType: AuditType;
  legalRequirement: string;
  explanation: string;
  expectedImplementation: string;
  points: number;
  customerAnswer: string | null;
  customerAnswerStatus: AnswerStatus;
  note: string | null;
  evidenceRule: EvidenceRule;
}

export interface EvidenceItem {
  id: string;
  questionId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  previewUrl: string;
  exampleText: string;
}

export interface DomainScore {
  domain: string;
  score: number;
}

export interface Finding {
  id: string;
  finding: string;
  domain: string;
  riskImpact: RiskLevel;
  recommendation: string;
}

export interface ReportSummary {
  reportId: string;
  corporationName: string;
  reportDate: string;
  maturityScore: number;
  maturityOverview: string;
  topPriorities: string[];
  totalQuestionsAnswered: number;
  standardsCovered: string[];
  domainScores: DomainScore[];
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  findings: Finding[];
  highlights: string[];
}
