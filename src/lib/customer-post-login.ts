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
          await getCurrentAssessment(paymentState.checklist.id);
          return '/dashboard';
        } catch {
          return '/dashboard';
        }
      }

      return '/payment/success';
    }
  } catch {
    // Fall through to dashboard when payment state cannot be resolved.
  }

  // Purchases are optional after sign-up; customers can open Purchase from the app menu.
  return '/dashboard';
}
