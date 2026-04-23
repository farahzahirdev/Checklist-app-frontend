export type RiskLevel = 'low' | 'medium' | 'high';
export type AnswerStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_review';
export type AuditType = 'compliance';

export type ChecklistStatus = 'draft' | 'published';

export interface EvidenceRule {
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
}

export interface ChecklistAnswerOption {
  position: number;
  label: string;
  score: number;
  choiceCode: string;
  description: string;
  illustrativeImageId?: string | null;
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
  questionTitle?: string;
  parentQuestionId?: string | null;
  illustrativeImageId?: string | null;
  securityLevel: RiskLevel;
  answerLogic?: 'answer_only' | 'answer_with_adjustment';
  auditType: AuditType;
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
  evidenceEnabled?: boolean;
  points: number;
  customerAnswer: string | null;
  customerAnswerStatus: AnswerStatus;
  note: string | null;
  evidenceRule: EvidenceRule;
  answerOptions?: ChecklistAnswerOption[];
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
