import { getCustomerDashboardSummary } from '@/lib/dashboard';
import {
  getCustomerPaymentAnalyticsOverview,
  getCustomerPaymentsWithActiveAccess,
  getCustomerRecentPayments,
  listCustomerPayments,
  listPurchasedChecklistIds,
  type CustomerPaymentAnalyticsOverview,
  type CustomerPaymentRecord,
} from '@/lib/customer-payments';
import { getCustomerReportsPage } from '@/lib/reports';

export type CustomerProfileInsights = {
  purchasedChecklistsCount: number;
  activeAccessCount: number;
  reportsCount: number;
  invoiceCount: number;
  hasPurchasedAudit: boolean;
  hasReports: boolean;
  latestPurchaseTitle: string | null;
  totalSpentDisplay: string | null;
};

function formatTotalSpent(
  analytics: CustomerPaymentAnalyticsOverview | null,
  locale: 'en' | 'cs',
): string | null {
  const formatted = analytics?.total_spent_formatted;
  if (typeof formatted === 'string' && formatted.trim()) {
    return formatted;
  }
  const cents = analytics?.total_spent;
  if (typeof cents === 'number' && !Number.isNaN(cents)) {
    return new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-GB', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  }
  return null;
}

function pickLatestPurchaseTitle(
  recentPayments: CustomerPaymentRecord[],
  analytics: CustomerPaymentAnalyticsOverview | null,
): string | null {
  const succeeded = recentPayments.find((payment) => payment.status === 'succeeded');
  if (succeeded?.checklist_title?.trim()) {
    return succeeded.checklist_title.trim();
  }
  const recent = recentPayments.find((payment) => payment.checklist_title?.trim());
  if (recent?.checklist_title?.trim()) {
    return recent.checklist_title.trim();
  }
  const frequent = analytics?.most_frequent_checklist?.checklist_title?.trim();
  return frequent || null;
}

export async function loadCustomerProfileInsights(locale: 'en' | 'cs' = 'en'): Promise<CustomerProfileInsights> {
  const [dashboard, purchasedIds, activeAccess, reportsPage, paymentsPage, analytics, recentPayments] =
    await Promise.all([
      getCustomerDashboardSummary().catch(() => null),
      listPurchasedChecklistIds().catch(() => [] as string[]),
      getCustomerPaymentsWithActiveAccess().catch(() => ({ payments: [], total: 0 })),
      getCustomerReportsPage({ skip: 0, limit: 1 }).catch(() => ({ reports: [], total: 0 })),
      listCustomerPayments({ limit: 1 }).catch(() => ({ payments: [], total: 0 })),
      getCustomerPaymentAnalyticsOverview().catch(() => null),
      getCustomerRecentPayments(8).catch(() => ({ payments: [], total: 0 })),
    ]);

  const purchasedFromDashboard = dashboard?.paid_checklists_count;
  const purchasedChecklistsCount =
    typeof purchasedFromDashboard === 'number' && purchasedFromDashboard >= 0
      ? purchasedFromDashboard
      : purchasedIds.length;

  const activePayments = activeAccess.payments ?? [];
  const activeAccessCount = activeAccess.total ?? activePayments.length;
  const reportsCount = reportsPage.total ?? 0;
  const invoiceCount = paymentsPage.total ?? 0;

  return {
    purchasedChecklistsCount,
    activeAccessCount,
    reportsCount,
    invoiceCount,
    hasPurchasedAudit: purchasedChecklistsCount > 0,
    hasReports: reportsCount > 0,
    latestPurchaseTitle: pickLatestPurchaseTitle(recentPayments.payments ?? [], analytics),
    totalSpentDisplay: formatTotalSpent(analytics, locale),
  };
}
