import { apiPost } from '@/lib/api';

export type PaymentSetupRequest = {
  checklist_id: string;
  amount_cents?: number;
  currency?: string;
};

export type PaymentSetupResponse = {
  payment_id: string;
  checklist_id: string;
  stripe_payment_intent_id: string;
  client_secret: string;
  amount_cents: number;
  currency: string;
};

export async function createStripeSetupIntent(payload: PaymentSetupRequest) {
  return apiPost<PaymentSetupResponse, PaymentSetupRequest>('/payments/stripe/setup-intent', payload);
}
