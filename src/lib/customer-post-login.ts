import { getCurrentAssessment } from '@/lib/assessment';
import { buildPaymentHref, getCheckoutIntent } from '@/lib/checkout-intent';
import { getUserPaymentStatus } from '@/lib/payments';

export async function getCustomerPostLoginDestination(userId: string) {
  const intent = getCheckoutIntent();

  try {
    const paymentState = await getUserPaymentStatus(userId);
    if (paymentState.payment_status === 'succeeded') {
      // If the visitor came in with a checkout intent for a *different*
      // checklist than the one currently active, route them to /payment so
      // they can purchase the new one. Otherwise carry on with the existing
      // post-login routing.
      if (intent && (!paymentState.checklist || paymentState.checklist.id !== intent)) {
        return buildPaymentHref(intent);
      }

      if (paymentState.checklist) {
        try {
          const active = await getCurrentAssessment(paymentState.checklist.id);
          if (active.status !== 'not_started') {
            return '/dashboard';
          }
          return `/access?checklist_id=${encodeURIComponent(paymentState.checklist.id)}`;
        } catch {
          return `/access?checklist_id=${encodeURIComponent(paymentState.checklist.id)}`;
        }
      }

      return '/payment/success';
    }
  } catch {
    // Fallback to payment selection page when the payment state cannot be resolved.
  }

  return buildPaymentHref(intent);
}
