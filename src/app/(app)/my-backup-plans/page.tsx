'use client';

import { CustomerMyBackupPlansView } from '@/components/customer-my-backup-plans/customer-my-backup-plans-view';
import { translate, useLocale } from '@/lib/i18n';
import { customerMyBackupPlansMessages } from '@/locales/customer-my-backup-plans';

export default function MyBackupPlansPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(customerMyBackupPlansMessages, locale, key);

  return <CustomerMyBackupPlansView t={t} />;
}
