import { apiGetWithAuth, apiPatch, apiPost } from '@/lib/api';

export type SupportTicketStatus = 'open' | 'waiting_customer' | 'resolved' | 'closed';

export type SupportTicketMessage = {
  id: string;
  ticket_id: string;
  sender_user_id: string;
  sender_role: string;
  body: string;
  created_at: string;
};

export type SupportTicket = {
  id: string;
  customer_id: string;
  customer_email: string;
  subject: string;
  status: SupportTicketStatus;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  messages: SupportTicketMessage[];
};

export type SupportTicketListResponse = {
  total: number;
  tickets: SupportTicket[];
  skip: number;
  limit: number;
};

export async function listMySupportTickets() {
  return apiGetWithAuth<SupportTicketListResponse>('/customer/support/tickets');
}

export async function createMySupportTicket(payload: { subject: string; message: string }) {
  return apiPost<SupportTicket, typeof payload>('/customer/support/tickets', payload);
}

export async function getMySupportTicket(ticketId: string) {
  return apiGetWithAuth<SupportTicket>(`/customer/support/tickets/${ticketId}`);
}

export async function replyMySupportTicket(ticketId: string, payload: { message: string }) {
  return apiPost<SupportTicket, typeof payload>(`/customer/support/tickets/${ticketId}/reply`, payload);
}

export async function listAdminSupportTickets(params?: { skip?: number; limit?: number; status?: SupportTicketStatus; search?: string }) {
  const query = new URLSearchParams();
  query.set('skip', String(params?.skip ?? 0));
  query.set('limit', String(params?.limit ?? 20));
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  return apiGetWithAuth<SupportTicketListResponse>(`/admin/support/tickets?${query.toString()}`);
}

export async function getAdminSupportTicket(ticketId: string) {
  return apiGetWithAuth<SupportTicket>(`/admin/support/tickets/${ticketId}`);
}

export async function replyToSupportTicket(ticketId: string, payload: { message: string }) {
  return apiPost<SupportTicket, typeof payload>(`/admin/support/tickets/${ticketId}/reply`, payload);
}

export async function updateSupportTicketStatus(ticketId: string, payload: { status: SupportTicketStatus }) {
  return apiPatch<SupportTicket, typeof payload>(`/admin/support/tickets/${ticketId}/status`, payload);
}
