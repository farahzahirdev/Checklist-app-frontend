'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useCallback, useMemo } from 'react';
import {
  buildCustomerAssessmentQuestionHref,
  CustomerReportDataResponse,
  customerReportOverallPercentage,
  sectionScoreDisplayName,
} from '@/lib/reports';
import { translate, useLocale, type Locale } from '@/lib/i18n';
import { customerReportMessages } from '@/locales/customer-report';

interface ReportDashboardProps {
  data: CustomerReportDataResponse;
  reportId: string;
  checklistId?: string | null;
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

export function riskBandLabel(
  percentage: number,
  t: (key: string, values?: Record<string, string>) => string
): string {
  if (percentage >= 80) return t('dashboard.riskBand.low');
  if (percentage >= 60) return t('dashboard.riskBand.medium');
  return t('dashboard.riskBand.high');
}

function dateLocaleTag(locale: Locale) {
  return locale === 'cs' ? 'cs-CZ' : 'en-GB';
}

/**
 * Score gauge component for visual representation
 */
function ScoreGauge({
  score,
  maxScore,
  percentage,
  t,
}: {
  score: number;
  maxScore: number;
  percentage: number;
  t: (key: string, values?: Record<string, string>) => string;
}) {
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
        {riskBandLabel(percentage, t)}
      </div>
    </div>
  );
}

/**
 * Risk assessment summary
 */
function RiskAssessmentSummary({
  sections,
  findings,
  t,
}: {
  sections: any[];
  findings: any[];
  t: (key: string, values?: Record<string, string>) => string;
}) {
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
        <p className="text-xs font-semibold uppercase text-[#7f1d1d]">{t('dashboard.risk.highAreas')}</p>
        <p className="mt-2 text-2xl font-bold text-[#dc2626]">{highRiskSections.length}</p>
        <p className="mt-1 text-xs text-[#991b1b]">
          {highRiskSections.map((s) => sectionScoreDisplayName(s)).join(', ') || t('dashboard.risk.none')}
        </p>
      </article>

      <article className="rounded-lg border border-[#fef3c7] bg-[#fffbeb] p-3">
        <p className="text-xs font-semibold uppercase text-[#78350f]">{t('dashboard.risk.mediumAreas')}</p>
        <p className="mt-2 text-2xl font-bold text-[#d97706]">{mediumRiskSections.length}</p>
        <p className="mt-1 text-xs text-[#92400e]">
          {mediumRiskSections.map((s) => sectionScoreDisplayName(s)).slice(0, 2).join(', ') || t('dashboard.risk.none')}
        </p>
      </article>

      <article className="rounded-lg border border-[#fecaca] bg-[#fee2e2] p-3">
        <p className="text-xs font-semibold uppercase text-[#7f1d1d]">{t('dashboard.risk.criticalFindings')}</p>
        <p className="mt-2 text-2xl font-bold text-[#dc2626]">{criticalFindings.length}</p>
        <p className="mt-1 text-xs text-[#991b1b]">{t('dashboard.risk.attention')}</p>
      </article>
    </div>
  );
}

/**
 * Score breakdown with visual bars
 */
function ScoreBreakdown({
  sections,
  chapters,
  t,
}: {
  sections: any[];
  chapters: any[];
  t: (key: string, values?: Record<string, string>) => string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Section Scores */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[#243555]">{t('dashboard.sections.title')}</h3>
        <div className="space-y-3">
          {sections.map((section) => {
            const severity = getSeverityColor(section.percentage);
            return (
              <div key={section.section_id} className="rounded-lg border border-[#e2e8f5] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-[#243555]">{sectionScoreDisplayName(section)}</h4>
                  <span className={`text-sm font-bold ${severity.text}`}>{Math.round(section.percentage)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                  <div
                    className={`h-full ${section.percentage >= 80 ? 'bg-green-500' : section.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(section.percentage, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#6a7d9a]">
                  {t('dashboard.sections.scoreLine', {
                    score: String(section.score),
                    max: String(section.max_score),
                  })}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chapter Breakdown */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[#243555]">{t('dashboard.chapters.title')}</h3>
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
                  {t('dashboard.chapters.scoreLine', {
                    score: String(chapter.score),
                    max: String(chapter.max_score),
                    findings: String(chapter.findings_count),
                  })}
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
function FindingsSection({
  findings,
  id,
  t,
}: {
  findings: any[];
  id?: string;
  t: (key: string, values?: Record<string, string>) => string;
}) {
  const findingsByPriority = useMemo(() => {
    return {
      high: findings.filter((f) => f.priority === 'high'),
      medium: findings.filter((f) => f.priority === 'medium'),
      low: findings.filter((f) => f.priority === 'low'),
    };
  }, [findings]);

  const priorityConfig = useMemo(
    () => ({
      high: {
        bg: 'bg-[#fee2e2]',
        text: 'text-[#dc2626]',
        badge: 'bg-red-100 text-red-800',
        label: t('dashboard.findings.priority.critical'),
      },
      medium: {
        bg: 'bg-[#fff9ea]',
        text: 'text-[#d97706]',
        badge: 'bg-amber-100 text-amber-800',
        label: t('dashboard.findings.priority.warning'),
      },
      low: {
        bg: 'bg-[#eff6ff]',
        text: 'text-[#0284c7]',
        badge: 'bg-blue-100 text-blue-800',
        label: t('dashboard.findings.priority.info'),
      },
    }),
    [t]
  );

  return (
    <section id={id} className="space-y-4 scroll-mt-24">
      <h2 className="text-xl font-semibold text-[#243555]">{t('dashboard.findings.title')}</h2>

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
            {t('dashboard.findings.empty')}
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
                      <span className="font-semibold">{t('dashboard.findings.answer')}</span>{' '}
                      {finding.answer?.trim() ? finding.answer : '—'}
                    </p>
                    <p className="mt-2 text-sm text-[#2b3e60]">
                      <span className="font-semibold">{t('dashboard.findings.recommendation')}</span>{' '}
                      {finding.recommendation?.trim() ? finding.recommendation : '—'}
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
export function ReportDashboard({ data, reportId: _reportId, checklistId }: ReportDashboardProps) {
  const { locale } = useLocale();
  const overallPercentage = customerReportOverallPercentage(data);
  const t = useCallback(
    (key: string, values?: Record<string, string>) => translate(customerReportMessages, locale, key, values),
    [locale]
  );
  const dateTag = dateLocaleTag(locale);

  return (
    <div className="space-y-6">
      {/* Overall Score Summary */}
      <div className="rounded-2xl border border-[#e2e8f5] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#243555] mb-4">{t('dashboard.summary.title')}</h2>
        <div className="grid gap-4 md:grid-cols-4 items-center">
          <div>
            <ScoreGauge
              score={data.overall_score}
              maxScore={data.max_possible_score}
              percentage={overallPercentage}
              t={t}
            />
          </div>
          <div className="md:col-span-3">
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-[#6a7d9a]">{t('dashboard.summary.overallScore')}</dt>
                <dd className="text-2xl font-bold text-[#1f2d45]">
                  {Math.round(data.overall_score)} / {data.max_possible_score}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-[#6a7d9a]">{t('dashboard.summary.completionRate')}</dt>
                <dd className="text-2xl font-bold text-[#1f2d45]">{Math.round(data.completion_percentage)}%</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-[#6a7d9a]">{t('dashboard.summary.totalFindings')}</dt>
                <dd className="text-2xl font-bold text-[#1f2d45]">{data.findings.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-[#6a7d9a]">{t('dashboard.summary.riskLevel')}</dt>
                <dd className={`text-lg font-bold ${getSeverityColor(overallPercentage).text}`}>
                  {riskBandLabel(overallPercentage, t)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <RiskAssessmentSummary sections={data.section_scores} findings={data.findings} t={t} />

      {/* Score Breakdown */}
      <ScoreBreakdown sections={data.section_scores} chapters={data.chapter_data} t={t} />

      {/* Findings */}
      <FindingsSection findings={data.findings} id="report-findings-dashboard" t={t} />

      {/* Admin Summaries */}
      {data.section_summaries.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('dashboard.adminComments')}</h2>
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
        <section id="report-suggestions" className="space-y-3 scroll-mt-24">
          <h2 className="text-xl font-semibold text-[#243555]">{t('dashboard.suggestions.title')}</h2>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {data.public_suggestions.map((suggestion, index) => {
              const questionHref = buildCustomerAssessmentQuestionHref({
                assessmentId: data.assessment_id,
                checklistId,
                questionId: suggestion.question_id,
              });
              const sharedLabel = t('dashboard.suggestions.shared', {
                date: new Date(suggestion.created_at).toLocaleDateString(dateTag),
              });
              const cardClassName =
                'h-full rounded-lg border border-[#e9f5ff] bg-[#f0f9ff] p-4 shadow-sm transition-colors';
              if (!questionHref) {
                return (
                  <article key={`${suggestion.created_at}-${index}`} className={cardClassName}>
                    <p className="text-sm text-[#0c4a6e]">{suggestion.suggestion_text}</p>
                    <p className="mt-2 text-xs text-[#0369a1]">{sharedLabel}</p>
                  </article>
                );
              }
              return (
                <Link
                  key={`${suggestion.created_at}-${index}`}
                  href={questionHref as Route}
                  className={`${cardClassName} block hover:border-[#7dd3fc] hover:bg-[#e0f2fe] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284c7]`}
                  aria-label={t('dashboard.suggestions.viewQuestion')}
                >
                  <p className="text-sm text-[#0c4a6e]">{suggestion.suggestion_text}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#0369a1]">
                    <span>{sharedLabel}</span>
                    <span className="font-semibold text-[#0284c7]">{t('dashboard.suggestions.viewQuestion')}</span>
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
