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

type CheckoutSessionResponse = string | { url?: string; checkout_url?: string; session_url?: string };

export async function createStripeCheckoutSession(payload: {
  user_id?: string;
  success_url: string;
  cancel_url: string;
}) {
  const query = new URLSearchParams();
  query.set('success_url', payload.success_url);
  query.set('cancel_url', payload.cancel_url);
  if (payload.user_id) {
    query.set('user_id', payload.user_id);
  }

  const response = await apiPost<CheckoutSessionResponse, Record<string, never>>(
    `/payments/stripe/checkout-session?${query.toString()}`,
    {},
  );

  if (typeof response === 'string') {
    return response;
  }

  const url = response.url ?? response.checkout_url ?? response.session_url;
  if (!url) {
    throw new Error('Checkout session URL was not returned.');
  }
  return url;
}
