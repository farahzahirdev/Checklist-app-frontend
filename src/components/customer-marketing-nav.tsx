'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { translate, useLocale } from '@/lib/i18n';
import { siteHeaderMessages } from '@/locales/site-header';

type CustomerMarketingNavProps = {
  className?: string;
  variant?: 'sidebar' | 'header';
};

export function CustomerMarketingNav({ className = '', variant = 'sidebar' }: CustomerMarketingNavProps) {
  const pathname = usePathname();
  const { locale } = useLocale();
  const t = (key: string) => translate(siteHeaderMessages, locale, key);

  const linkClass = (href: string) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    if (variant === 'header') {
      return active ? 'text-[#62a2ff] hover:text-[#8ebdff]' : 'text-[#b3c2dc] hover:text-[#ffffff]';
    }
    return `rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
      active ? 'bg-[#17376d] text-white' : 'text-[#b8cae7] hover:bg-[#10284f] hover:text-white'
    }`;
  };

  return (
    <nav className={className} aria-label="Site">
      <Link href="/" className={linkClass('/')}>
        {t('nav.home')}
      </Link>
      <Link href="/products" className={linkClass('/products')}>
        {t('nav.products')}
      </Link>
      <Link href="/contact" className={linkClass('/contact')}>
        {t('nav.contact')}
      </Link>
    </nav>
  );
}
