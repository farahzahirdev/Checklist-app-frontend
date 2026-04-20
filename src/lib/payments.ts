import { apiGetWithAuth, apiPost } from '@/lib/api';

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

type CheckoutSessionResponse =
  | string
  | {
      url?: string;
      checkout_url?: string;
      session_url?: string;
      payment_id?: string;
    };

export type CheckoutSessionResult = {
  checkoutUrl: string;
  paymentId: string | null;
};

export type PaymentStatusResponse = {
  payment_id: string;
  stripe_payment_intent_id: string;
  payment_status: 'pending' | 'succeeded' | 'failed';
  paid_at: string | null;
  access_window_id: string | null;
  access_expires_at: string | null;
  checklist?: {
    id: string;
    title: string;
    version: number;
  } | null;
};

export async function createStripeCheckoutSession(payload: {
  user_id?: string;
  success_url: string;
  cancel_url: string;
}): Promise<CheckoutSessionResult> {
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
    return { checkoutUrl: response, paymentId: null };
  }

  const url = response.url ?? response.checkout_url ?? response.session_url;
  if (!url) {
    throw new Error('Checkout session URL was not returned.');
  }
  return { checkoutUrl: url, paymentId: response.payment_id ?? null };
}

export async function getUserPaymentStatus(userId: string) {
  return apiGetWithAuth<PaymentStatusResponse>(`/payments/users/${userId}/status`);
}
