'use client';

import { useMemo } from 'react';
import { CustomerReportDataResponse } from '@/lib/reports';

interface ReportDashboardProps {
  data: CustomerReportDataResponse;
  reportId: string;
}

/**
 * Scoring interpretation utility
 */
export function getSeverityColor(percentage: number): { bg: string; text: string; badge: string } {
  if (percentage >= 80) {
    return {
      bg: 'bg-[#e9f8ef]',
      text: 'text-[#2f9960]',
      badge: 'bg-green-100 text-green-800',
    };
  }
  if (percentage >= 60) {
    return {
      bg: 'bg-[#fff9ea]',
      text: 'text-[#d97706]',
      badge: 'bg-amber-100 text-amber-800',
    };
  }
  return {
    bg: 'bg-[#fee2e2]',
    text: 'text-[#dc2626]',
    badge: 'bg-red-100 text-red-800',
  };
}

export function getSeverityLabel(percentage: number): string {
  if (percentage >= 80) return 'Low Risk';
  if (percentage >= 60) return 'Medium Risk';
  return 'High Risk';
}

/**
 * Score gauge component for visual representation
 */
function ScoreGauge({ score, maxScore, percentage }: { score: number; maxScore: number; percentage: number }) {
  const severity = getSeverityColor(percentage);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#f59e0b' : '#ef4444'}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1f2d45]">{Math.round(percentage)}%</div>
            <div className="text-xs text-[#6a7d9a]">{score}/{maxScore}</div>
          </div>
        </div>
      </div>
      <div className={`rounded-full ${severity.badge} px-3 py-1 text-xs font-semibold`}>
        {getSeverityLabel(percentage)}
      </div>
    </div>
  );
}

/**
 * Risk assessment summary
 */
function RiskAssessmentSummary({ sections, findings }: { sections: any[]; findings: any[] }) {
  const highRiskSections = useMemo(
    () => sections.filter((s) => (s.score / s.max_score) * 100 < 60),
    [sections]
  );

  const criticalFindings = useMemo(() => findings.filter((f) => f.priority === 'high'), [findings]);

  const mediumRiskSections = useMemo(() => sections.filter((s) => {
    const pct = (s.score / s.max_score) * 100;
    return pct >= 60 && pct < 80;
  }), [sections]);

  return (
    <div className="grid gap-3 rounded-2xl border border-[#e2e8f5] bg-white p-4 md:grid-cols-3 shadow-sm">
      <article className="rounded-lg border border-[#fee2e2] bg-[#fef2f2] p-3">
        <p className="text-xs font-semibold uppercase text-[#7f1d1d]">High Risk Areas</p>
        <p className="mt-2 text-2xl font-bold text-[#dc2626]">{highRiskSections.length}</p>
        <p className="mt-1 text-xs text-[#991b1b]">{highRiskSections.map((s) => s.section_name).join(', ') || 'None'}</p>
      </article>

      <article className="rounded-lg border border-[#fef3c7] bg-[#fffbeb] p-3">
        <p className="text-xs font-semibold uppercase text-[#78350f]">Medium Risk Areas</p>
        <p className="mt-2 text-2xl font-bold text-[#d97706]">{mediumRiskSections.length}</p>
        <p className="mt-1 text-xs text-[#92400e]">{mediumRiskSections.map((s) => s.section_name).slice(0, 2).join(', ') || 'None'}</p>
      </article>

      <article className="rounded-lg border border-[#fecaca] bg-[#fee2e2] p-3">
        <p className="text-xs font-semibold uppercase text-[#7f1d1d]">Critical Findings</p>
        <p className="mt-2 text-2xl font-bold text-[#dc2626]">{criticalFindings.length}</p>
        <p className="mt-1 text-xs text-[#991b1b]">Require immediate attention</p>
      </article>
    </div>
  );
}

/**
 * Score breakdown with visual bars
 */
function ScoreBreakdown({ sections, chapters }: { sections: any[]; chapters: any[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Section Scores */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[#243555]">Section Scores</h3>
        <div className="space-y-3">
          {sections.map((section) => {
            const severity = getSeverityColor(section.percentage);
            return (
              <div key={section.section_id} className="rounded-lg border border-[#e2e8f5] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-[#243555]">{section.section_name}</h4>
                  <span className={`text-sm font-bold ${severity.text}`}>{Math.round(section.percentage)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                  <div
                    className={`h-full ${section.percentage >= 80 ? 'bg-green-500' : section.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(section.percentage, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#6a7d9a]">
                  Score: {section.score}/{section.max_score}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chapter Breakdown */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[#243555]">Chapter Breakdown</h3>
        <div className="space-y-3">
          {chapters.map((chapter) => {
            const severity = getSeverityColor(chapter.percentage);
            return (
              <div key={chapter.chapter_code} className="rounded-lg border border-[#e2e8f5] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-[#243555]">{chapter.title}</h4>
                  <span className={`text-sm font-bold ${severity.text}`}>{Math.round(chapter.percentage)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                  <div
                    className={`h-full ${chapter.percentage >= 80 ? 'bg-green-500' : chapter.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(chapter.percentage, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#6a7d9a]">
                  Score: {chapter.score}/{chapter.max_score} · Findings: {chapter.findings_count}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/**
 * Findings priority filter and display
 */
function FindingsSection({ findings }: { findings: any[] }) {
  const findingsByPriority = useMemo(() => {
    return {
      high: findings.filter((f) => f.priority === 'high'),
      medium: findings.filter((f) => f.priority === 'medium'),
      low: findings.filter((f) => f.priority === 'low'),
    };
  }, [findings]);

  const priorityConfig = {
    high: { bg: 'bg-[#fee2e2]', text: 'text-[#dc2626]', badge: 'bg-red-100 text-red-800', label: 'Critical' },
    medium: {
      bg: 'bg-[#fff9ea]',
      text: 'text-[#d97706]',
      badge: 'bg-amber-100 text-amber-800',
      label: 'Warning',
    },
    low: { bg: 'bg-[#eff6ff]', text: 'text-[#0284c7]', badge: 'bg-blue-100 text-blue-800', label: 'Info' },
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-[#243555]">Findings & Recommendations</h2>

      {/* Priority Summary */}
      <div className="grid gap-3 md:grid-cols-3">
        {Object.entries(findingsByPriority).map(([priority, items]) => (
          <div key={priority} className={`rounded-lg border border-[#e2e8f5] ${priorityConfig[priority as 'high' | 'medium' | 'low'].bg} p-3`}>
            <p className={`text-xs font-semibold uppercase ${priorityConfig[priority as 'high' | 'medium' | 'low'].text}`}>
              {priorityConfig[priority as 'high' | 'medium' | 'low'].label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${priorityConfig[priority as 'high' | 'medium' | 'low'].text}`}>{items.length}</p>
          </div>
        ))}
      </div>

      {/* All Findings */}
      <div className="space-y-3">
        {findings.length === 0 ? (
          <p className="rounded-lg border border-[#e2e8f5] bg-white p-4 text-center text-sm text-[#6a7d9a]">
            No findings reported. Excellent assessment results!
          </p>
        ) : (
          findings.map((finding, idx) => {
            const config = priorityConfig[finding.priority as 'high' | 'medium' | 'low'];
            return (
              <article key={`${finding.question_text}-${idx}`} className={`rounded-lg border border-[#e2e8f5] ${config.bg} p-4 shadow-sm`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className={`inline-block rounded-md ${config.badge} px-2 py-1 text-xs font-semibold mb-2`}>
                      {config.label}
                    </div>
                    <p className="text-sm font-semibold text-[#243555] mt-1">{finding.question_text}</p>
                    <p className="mt-2 text-sm text-[#6a7d9a]">
                      <span className="font-semibold">Answer:</span> {finding.answer}
                    </p>
                    <p className="mt-2 text-sm text-[#2b3e60]">
                      <span className="font-semibold">Recommendation:</span> {finding.recommendation}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

/**
 * Main Report Dashboard Component
 */
export function ReportDashboard({ data, reportId }: ReportDashboardProps) {
  const overallPercentage = (data.overall_score / data.max_possible_score) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Score Summary */}
      <div className="rounded-2xl border border-[#e2e8f5] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#243555] mb-4">Assessment Summary</h2>
        <div className="grid gap-4 md:grid-cols-4 items-center">
          <div>
            <ScoreGauge score={data.overall_score} maxScore={data.max_possible_score} percentage={overallPercentage} />
          </div>
          <div className="md:col-span-3">
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-[#6a7d9a]">Overall Score</dt>
                <dd className="text-2xl font-bold text-[#1f2d45]">
                  {Math.round(data.overall_score)} / {data.max_possible_score}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-[#6a7d9a]">Completion Rate</dt>
                <dd className="text-2xl font-bold text-[#1f2d45]">{Math.round(data.completion_percentage)}%</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-[#6a7d9a]">Total Findings</dt>
                <dd className="text-2xl font-bold text-[#1f2d45]">{data.findings.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-[#6a7d9a]">Risk Level</dt>
                <dd className={`text-lg font-bold ${getSeverityColor(overallPercentage).text}`}>
                  {getSeverityLabel(overallPercentage)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <RiskAssessmentSummary sections={data.section_scores} findings={data.findings} />

      {/* Score Breakdown */}
      <ScoreBreakdown sections={data.section_scores} chapters={data.chapter_data} />

      {/* Findings */}
      <FindingsSection findings={data.findings} />

      {/* Admin Summaries */}
      {data.section_summaries.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#243555]">Admin Comments</h2>
          <div className="space-y-3">
            {data.section_summaries.map((summary, index) => (
              <article key={`${summary.section_id}-${index}`} className="rounded-lg border border-[#e2e8f5] bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-[#243555]">{summary.chapter_code}</h3>
                <p className="mt-2 text-sm text-[#6a7d9a]">{summary.summary_text}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Public Suggestions */}
      {data.public_suggestions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#243555]">Suggestions for Improvement</h2>
          <div className="space-y-3">
            {data.public_suggestions.map((suggestion, index) => (
              <article key={`${suggestion.created_at}-${index}`} className="rounded-lg border border-[#e9f5ff] bg-[#f0f9ff] p-4 shadow-sm">
                <p className="text-sm text-[#0c4a6e]">{suggestion.suggestion_text}</p>
                <p className="mt-2 text-xs text-[#0369a1]">
                  Shared {new Date(suggestion.created_at).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
