'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — auditors use /admin/assessments with read-only access. */
export default function AuditorAssessmentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/assessments');
  }, [router]);

  return null;
}
