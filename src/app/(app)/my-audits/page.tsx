'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { listPublishedCustomerChecklists } from '@/lib/checklist-api';
import { getCustomerAssessmentsDashboard, listCustomerAssessments } from '@/lib/customer-assessments';
import { getActiveAccessWindows, listPurchasedChecklists } from '@/lib/customer-payments';
import { translate, useLocale } from '@/lib/i18n';
import { customerMyAuditsMessages } from '@/locales/customer-my-audits';
import {
  buildMyAuditRows,
  buildRecentActivity,
  CustomerMyAuditsView,
  type MyAuditRow,
  type MyAuditsStats,
} from '@/components/customer-my-audits/customer-my-audits-view';

function resolveCardStatusForStats(row: MyAuditRow): 'ready' | 'inProgress' | 'completed' | 'reportReady' {
  if (row.assessment?.has_report) return 'reportReady';
  if (row.assessment?.status === 'submitted') return 'completed';
  if (row.assessment?.status === 'in_progress') return 'inProgress';
  return 'ready';
}

function computeStats(rows: MyAuditRow[], reportsFromDashboard: number): MyAuditsStats {
  const readyToStart = rows.filter((row) => resolveCardStatusForStats(row) === 'ready').length;
  const inProgress = rows.filter((row) => resolveCardStatusForStats(row) === 'inProgress').length;
  const activeAudits = rows.filter((row) => {
    const status = resolveCardStatusForStats(row);
    return status === 'inProgress' || (row.access && row.access.days_remaining > 0);
  }).length;
  const publishedReports =
    reportsFromDashboard > 0
      ? reportsFromDashboard
      : rows.filter((row) => row.assessment?.has_report).length;

  return { activeAudits, readyToStart, inProgress, publishedReports };
}

export default function MyAuditsPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(customerMyAuditsMessages, locale, key);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<MyAuditRow[]>([]);
  const [reportsCount, setReportsCount] = useState(0);

  const loadAudits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [purchased, checklists, assessmentsResponse, accessWindows, dashboard] = await Promise.all([
        listPurchasedChecklists(),
        listPublishedCustomerChecklists().catch(() => []),
        listCustomerAssessments({
          status: ['not_started', 'in_progress', 'submitted', 'expired', 'closed'],
          limit: 200,
          sort_by: 'updated_at',
          sort_order: 'desc',
        }).catch(() => ({
          assessments: [],
          total: 0,
        })),
        getActiveAccessWindows().catch(() => []),
        getCustomerAssessmentsDashboard().catch(() => null),
      ]);

      const nextRows = buildMyAuditRows(
        purchased,
        checklists,
        assessmentsResponse.assessments ?? [],
        accessWindows,
      );
      setRows(nextRows);
      setReportsCount(dashboard?.summary?.reports_available ?? 0);
    } catch {
      setError(translate(customerMyAuditsMessages, locale, 'errors.load'));
      setRows([]);
      setReportsCount(0);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void loadAudits();
  }, [loadAudits]);

  const stats = useMemo(() => computeStats(rows, reportsCount), [rows, reportsCount]);
  const recentActivity = useMemo(
    () => buildRecentActivity(rows, locale, (key) => translate(customerMyAuditsMessages, locale, key)),
    [rows, locale],
  );

  return (
    <CustomerMyAuditsView
      t={t}
      locale={locale}
      loading={loading}
      error={error}
      rows={rows}
      stats={stats}
      recentActivity={recentActivity}
    />
  );
}
