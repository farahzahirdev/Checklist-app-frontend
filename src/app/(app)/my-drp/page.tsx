'use client';

import { CustomerMyDrpView } from '@/components/customer-my-drp/customer-my-drp-view';
import { translate, useLocale } from '@/lib/i18n';
import { customerMyDrpMessages } from '@/locales/customer-my-drp';

export default function MyDrpPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(customerMyDrpMessages, locale, key);

  return <CustomerMyDrpView t={t} />;
}
