import { apiGetWithAuth } from '@/lib/api';

export type CustomerPaymentRecord = {
  id: string;
  user_id: string;
  checklist_id: string;
  checklist_title: string;
  checklist_description: string | null;
  checklist_version: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  amount_formatted: string | null;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  access_window_start: string | null;
  access_window_end: string | null;
  is_access_active: boolean;
  days_of_access: number | null;
};

export type CustomerPaymentsListResponse = {
  payments: CustomerPaymentRecord[];
  total: number;
  page?: number;
  size?: number;
  pages?: number;
  summary?: Record<string, unknown>;
};

export type CustomerPaymentsListParams = {
  status?: string;
  checklist_id?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  has_active_access?: boolean;
  search?: string;
  skip?: number;
  limit?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
};

function buildPaymentsQuery(params?: CustomerPaymentsListParams): string {
  if (!params) return '';
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.checklist_id) query.set('checklist_id', params.checklist_id);
  if (params.date_from) query.set('date_from', params.date_from);
  if (params.date_to) query.set('date_to', params.date_to);
  if (typeof params.min_amount === 'number') query.set('min_amount', String(params.min_amount));
  if (typeof params.max_amount === 'number') query.set('max_amount', String(params.max_amount));
  if (typeof params.has_active_access === 'boolean') query.set('has_active_access', String(params.has_active_access));
  if (params.search) query.set('search', params.search);
  if (typeof params.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params.limit === 'number') query.set('limit', String(params.limit));
  if (params.order_by) query.set('order_by', params.order_by);
  if (params.order_direction) query.set('order_direction', params.order_direction);
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export async function listCustomerPayments(params?: CustomerPaymentsListParams) {
  return apiGetWithAuth<CustomerPaymentsListResponse>(`/customer/payments/${buildPaymentsQuery(params)}`);
}

export async function getCustomerPaymentSummary() {
  return apiGetWithAuth<Record<string, unknown>>('/customer/payments/summary');
}

export async function getCustomerPaymentDashboard() {
  return apiGetWithAuth<Record<string, unknown>>('/customer/payments/dashboard');
}

export async function getCustomerPaymentDetails(paymentId: string) {
  return apiGetWithAuth<Record<string, unknown>>(`/customer/payments/${encodeURIComponent(paymentId)}`);
}

export async function getCustomerPaymentAnalyticsOverview() {
  return apiGetWithAuth<Record<string, unknown>>('/customer/payments/analytics/overview');
}

export async function getCustomerRecentPayments(limit = 10) {
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  return apiGetWithAuth<CustomerPaymentsListResponse>(`/customer/payments/recent?${query.toString()}`);
}

export async function getCustomerSuccessfulPayments(params?: { skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiGetWithAuth<CustomerPaymentsListResponse>(`/customer/payments/successful${qs ? `?${qs}` : ''}`);
}

export async function getCustomerPaymentsWithActiveAccess() {
  return apiGetWithAuth<CustomerPaymentsListResponse>('/customer/payments/active-access');
}

export async function getCustomerPaymentsByChecklist(checklistId: string, params?: { skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiGetWithAuth<CustomerPaymentsListResponse>(
    `/customer/payments/by-checklist/${encodeURIComponent(checklistId)}${qs ? `?${qs}` : ''}`,
  );
}

export async function getCustomerSpendingByMonth(months = 12) {
  const query = new URLSearchParams();
  query.set('months', String(months));
  return apiGetWithAuth<string[]>(`/customer/payments/stats/spending-by-month?${query.toString()}`);
}

export async function getCustomerChecklistSpendingBreakdown() {
  return apiGetWithAuth<string[]>('/customer/payments/stats/checklist-breakdown');
}

export async function getCustomerPaymentFrequencyStats() {
  return apiGetWithAuth<Record<string, unknown>>('/customer/payments/stats/payment-frequency');
}

export async function searchCustomerPayments(q: string, params?: { skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  query.set('q', q);
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  return apiGetWithAuth<CustomerPaymentsListResponse>(`/customer/payments/search?${query.toString()}`);
}

export async function filterCustomerPayments(params?: CustomerPaymentsListParams) {
  return apiGetWithAuth<CustomerPaymentsListResponse>(`/customer/payments/filter${buildPaymentsQuery(params)}`);
}

type PurchasedChecklistItem =
  | string
  | {
      checklist_id?: string | null;
      checklist_title?: string | null;
      total_payments?: number;
      total_amount?: number;
      last_payment_date?: string | null;
      access_windows_granted?: number;
    };

export async function listPurchasedChecklistIds() {
  const response = await apiGetWithAuth<PurchasedChecklistItem[]>('/customer/payments/checklists/purchased');
  if (!Array.isArray(response)) return [];
  return response
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && typeof item.checklist_id === 'string') return item.checklist_id;
      return '';
    })
    .filter((id): id is string => Boolean(id));
}

export async function getActiveAccessWindows() {
  return apiGetWithAuth<string[]>('/customer/payments/access/active');
}

export async function getUpcomingAccessExpirations() {
  return apiGetWithAuth<string[]>('/customer/payments/access/upcoming-expirations');
}

