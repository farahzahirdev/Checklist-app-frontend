import { getCurrentAssessment } from '@/lib/assessment';
import { getUserPaymentStatus } from '@/lib/payments';

export async function getCustomerPostLoginDestination(userId: string) {
  try {
    const paymentState = await getUserPaymentStatus(userId);
    if (paymentState.payment_status === 'succeeded') {
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

  return '/payment';
}
