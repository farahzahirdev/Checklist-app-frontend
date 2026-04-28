import { apiGetWithAuth } from '@/lib/api';

export type AuditLog = {
  id: string;
  actor_user_id: string | null;
  actor_role: string | null;
  actor_name: string | null;
  actor_email: string | null;
  action: string | null;
  target_entity: string | null;
  target_id: string | null;
  target_user_id: string | null;
  target_user_name: string | null;
  target_user_email: string | null;
  request_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  before_json: Record<string, unknown> | null;
  after_json: Record<string, unknown> | null;
  changes_summary: string | null;
  success: boolean | null;
  error_message: string | null;
  extra_metadata: Record<string, unknown> | null;
  created_at: string;
};

export type AuditLogsListResponse = {
  logs: AuditLog[];
  total: number;
  page: number;
  size: number;
  pages: number;
  filters_applied: Record<string, unknown>;
  generated_at: string;
};

export type ListAuditLogsParams = {
  actor_user_id?: string;
  actor_role?: string;
  action?: string;
  target_entity?: string;
  target_id?: string;
  target_user_id?: string;
  success?: boolean;
  ip_address?: string;
  session_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  skip?: number;
  limit?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
};

export function listAuditLogs(params?: ListAuditLogsParams) {
  const query = new URLSearchParams();
  if (params?.actor_user_id) query.set('actor_user_id', params.actor_user_id);
  if (params?.actor_role) query.set('actor_role', params.actor_role);
  if (params?.action) query.set('action', params.action);
  if (params?.target_entity) query.set('target_entity', params.target_entity);
  if (params?.target_id) query.set('target_id', params.target_id);
  if (params?.target_user_id) query.set('target_user_id', params.target_user_id);
  if (typeof params?.success === 'boolean') query.set('success', String(params.success));
  if (params?.ip_address) query.set('ip_address', params.ip_address);
  if (params?.session_id) query.set('session_id', params.session_id);
  if (params?.date_from) query.set('date_from', params.date_from);
  if (params?.date_to) query.set('date_to', params.date_to);
  if (params?.search) query.set('search', params.search);
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  if (params?.order_by) query.set('order_by', params.order_by);
  if (params?.order_direction) query.set('order_direction', params.order_direction);

  const qs = query.toString();
  return apiGetWithAuth<AuditLogsListResponse>(`/admin/audit-logs/${qs ? `?${qs}` : ''}`);
}
