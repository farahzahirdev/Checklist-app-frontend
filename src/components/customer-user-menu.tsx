'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { logoutAccount, persistAccessToken } from '@/lib/auth';
import { translate, useLocale } from '@/lib/i18n';
import { customerUserMenuMessages } from '@/locales/customer-user-menu';

type CustomerUserMenuProps = {
  displayName: string;
  shortName: string;
  onNavigate?: () => void;
  className?: string;
};

type MenuLink = {
  href: Route;
  labelKey: string;
  icon: ReactNode;
};

function MenuIcon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-[#64748b]" aria-hidden="true">
      {children}
    </span>
  );
}

const MENU_LINKS: MenuLink[] = [
  {
    href: '/profile',
    labelKey: 'menu.profile',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/my-audits',
    labelKey: 'menu.myAudits',
    icon: (
      <svg viewBox="0 0 90 90" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
        <path
          d="M63.089 1.483H15.755c-1.551 0-2.808 1.257-2.808 2.808v81.418c0 1.551 1.257 2.808 2.808 2.808h58.49c1.551 0 2.808-1.257 2.808-2.808V14.927L63.089 1.483zM65.896 14.927c-1.551 0-2.808-1.257-2.808-2.808V1.483l13.964 13.444H65.896z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path fill="currentColor" d="M21.924 66.401c-.82 0-1.484.664-1.484 1.484s.664 1.484 1.484 1.484h22.668c.819 0 1.484-.664 1.484-1.484s-.664-1.484-1.484-1.484H21.924z" />
        <path fill="currentColor" d="M21.924 39.698h47.294c.819 0 1.484-.664 1.484-1.484s-.664-1.484-1.484-1.484H21.924c-.82 0-1.484.664-1.484 1.484S21.105 39.698 21.924 39.698z" />
        <path fill="currentColor" d="M70.702 57.995c0-.819-.664-1.484-1.484-1.484H21.924c-.82 0-1.484.664-1.484 1.484s.664 1.484 1.484 1.484h47.294C70.038 59.478 70.702 58.814 70.702 57.995z" />
        <path fill="currentColor" d="M21.924 29.808h22.668c.819 0 1.484-.664 1.484-1.484 0-.82-.664-1.484-1.484-1.484H21.924c-.82 0-1.484.664-1.484 1.484C20.441 29.144 21.105 29.808 21.924 29.808z" />
        <path fill="currentColor" d="M21.924 49.588h47.294c.819 0 1.484-.664 1.484-1.484 0-.819-.664-1.484-1.484-1.484H21.924c-.82 0-1.484.664-1.484 1.484C20.441 48.924 21.105 49.588 21.924 49.588z" />
      </svg>
    ),
  },
  {
    href: '/my-backup-plans',
    labelKey: 'menu.myBackupPlans',
    icon: (
      <svg viewBox="0 0 90 90" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
        <path d="M66.212 78.109H24.121c-13.208 0-23.954-10.746-23.954-23.953c0-10.769 7.136-20.131 17.453-23.048 4.088-11.728 15.055-19.55 27.546-19.55 12.491 0 23.458 7.822 27.547 19.55 10.318 2.916 17.453 12.278 17.453 23.048C90.167 67.363 79.421 78.109 66.212 78.109zM45.167 14.525c-11.468 0-21.506 7.339-24.978 18.261l-.252.792-.807.199C9.712 36.099 3.134 44.479 3.134 54.155c0 11.572 9.415 20.986 20.987 20.986h42.092c11.573 0 20.987-9.415 20.987-20.986 0-9.677-6.577-18.057-15.996-20.378l-.806-.199-.252-.792C66.673 21.864 56.634 14.525 45.167 14.525zM45.167 68c-3.46 0-6.274-2.814-6.274-6.274V46.61l-1.005 1.004c-1.181 1.181-2.756 1.832-4.436 1.832-1.68 0-3.255-.651-4.437-1.832-2.446-2.446-2.446-6.427 0-8.873l11.697-11.708c.832-.833 1.873-1.405 3.025-1.672l.184-.047c.843-.168 1.662-.165 2.491 0l.178.045c1.156.267 2.198.839 3.019 1.66l.115.127 11.595 11.595c2.446 2.446 2.446 6.427 0 8.873-1.181 1.181-2.756 1.832-4.437 1.832-1.68 0-3.255-.651-4.436-1.832l-1.004-1.004v15.116C51.441 65.186 48.627 68 45.167 68zM41.86 39.446v22.28c0 1.823 1.484 3.307 3.307 3.307 1.824 0 3.307-1.484 3.307-3.307V39.446l6.069 6.071c1.243 1.243 3.436 1.242 4.677 0 .621-.621.963-1.452.963-2.339 0-.887-.342-1.717-.963-2.338l-11.77-11.78c-.416-.397-.957-.682-1.558-.815l-.127-.033c-.417-.075-.792-.073-1.194-.001l-.135.034c-.594.131-1.131.412-1.556.816l-.085.094L31.113 40.84c-.621.621-.963 1.452-.963 2.338 0 .887.342 1.718.963 2.339 1.29 1.288 3.388 1.288 4.677 0L41.86 39.446z" />
      </svg>
    ),
  },
  {
    href: '/my-drp',
    labelKey: 'menu.drp',
    icon: (
      <svg viewBox="0 0 90 90" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
        <path d="M52.1 90H37.9c-2.867 0-5.2-2.333-5.2-5.2v-2.114c0-.329-.191-.634-.454-.725-1.482-.511-2.955-1.122-4.375-1.816-.246-.118-.576-.046-.802.18l-1.516 1.516c-.981.982-2.288 1.523-3.677 1.523-1.389 0-2.695-.541-3.677-1.524L8.16 71.799c-2.027-2.027-2.027-5.326 0-7.354l1.516-1.516c.223-.223.299-.56.181-.8-.695-1.423-1.307-2.895-1.818-4.377C7.947 57.49 7.643 57.3 7.314 57.3H5.2c-2.867 0-5.2-2.333-5.2-5.2V37.9c0-2.867 2.333-5.2 5.2-5.2h2.115c.329 0 .633-.19.724-.454.513-1.483 1.124-2.956 1.817-4.374.12-.246.046-.576-.181-.802L8.16 25.555c-2.027-2.028-2.027-5.327 0-7.354L18.201 8.159c.982-.982 2.288-1.522 3.677-1.522 1.389 0 2.695.541 3.677 1.522l1.516 1.517c.224.223.559.3.801.18 1.418-.693 2.891-1.305 4.375-1.818C32.51 7.947 32.7 7.643 32.7 7.314V5.2c0-2.867 2.333-5.2 5.2-5.2h14.2c2.867 0 5.2 2.333 5.2 5.2v2.115c0 .329.19.633.453.724 1.482.512 2.954 1.124 4.375 1.818.247.118.575.045.802-.181l1.516-1.516c2.027-2.027 5.326-2.027 7.354 0L81.84 18.2c2.027 2.028 2.027 5.327 0 7.354l-1.516 1.516c-.227.227-.301.556-.181.802.695 1.42 1.307 2.893 1.818 4.376.09.262.395.452.724.452H84.8c2.867 0 5.2 2.333 5.2 5.2V52.1c0 2.867-2.333 5.2-5.2 5.2h-2.114c-.329 0-.634.19-.725.454-.51 1.478-1.121 2.95-1.815 4.373-.119.244-.044.58.179.803l1.516 1.516c2.027 2.027 2.027 5.326 0 7.354L71.799 81.84c-.982.982-2.288 1.523-3.677 1.523-1.39 0-2.696-.542-3.678-1.525l-1.514-1.513c-.228-.226-.557-.302-.803-.182-1.42.695-2.893 1.307-4.376 1.818-.262.09-.452.395-.452.724V84.8C57.3 87.667 54.967 90 52.1 90zM39.7 83h10.6v-.314c0-3.322 2.076-6.272 5.167-7.34 1.216-.42 2.422-.921 3.588-1.491 2.936-1.434 6.481-.822 8.824 1.521l.243.242 7.495-7.495-.242-.243c-2.345-2.344-2.955-5.891-1.519-8.825.569-1.166 1.07-2.373 1.488-3.585 1.068-3.093 4.019-5.169 7.341-5.169H83V39.7h-.314c-3.322 0-6.272-2.076-7.34-5.167-.42-1.216-.921-2.422-1.491-3.588-1.434-2.936-.823-6.482 1.521-8.825l.242-.243-7.495-7.495-.243.243c-2.344 2.344-5.89 2.953-8.824 1.52-1.166-.57-2.373-1.071-3.587-1.491-3.091-1.067-5.168-4.017-5.168-7.34V7H39.7v.314c0 3.323-2.077 6.272-5.168 7.34-1.217.42-2.424.922-3.587 1.491-2.936 1.434-6.481.823-8.825-1.52l-.243-.243-7.495 7.495.243.243c2.343 2.344 2.954 5.89 1.52 8.825-.568 1.163-1.07 2.37-1.49 3.587-1.068 3.092-4.018 5.168-7.34 5.168H7v10.6h.314c3.323 0 6.272 2.077 7.34 5.168.419 1.214.921 2.421 1.491 3.588 1.435 2.933.824 6.479-1.52 8.823l-.243.243 7.496 7.495.242-.242c2.344-2.346 5.891-2.954 8.826-1.52 1.164.568 2.37 1.07 3.585 1.489 3.092 1.068 5.168 4.019 5.168 7.341V83zM45.028 70.402c-6.738 0-13.204-2.652-17.991-7.439-5.265-5.265-7.947-12.561-7.359-20.016.97-12.296 10.974-22.3 23.27-23.27 7.457-.588 14.751 2.095 20.016 7.359 5.265 5.266 7.947 12.561 7.36 20.017-.971 12.297-10.975 22.3-23.271 23.27H45.028zM44.969 26.598c-.489 0-.979.02-1.471.058-8.899.702-16.14 7.943-16.842 16.843-.427 5.41 1.516 10.7 5.331 14.515s9.1 5.761 14.516 5.331c8.899-.701 16.141-7.941 16.843-16.842.427-5.41-1.517-10.701-5.331-14.516C54.546 28.519 49.857 26.598 44.969 26.598z" />
      </svg>
    ),
  },
  {
    href: '/reports',
    labelKey: 'menu.reports',
    icon: (
      <svg viewBox="0 0 90 90" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
        <path d="M89 75.557H72.892V59.987V13.443c0-5.268-4.286-9.554-9.555-9.554H9.554C4.286 3.889 0 8.175 0 13.443c0 .552.448 1 1 1h16.109v45.544v16.569c0 5.269 4.286 9.555 9.554 9.555h53.782c5.269 0 9.555-4.286 9.555-9.555C90 76.004 89.553 75.557 89 75.557zM2.066 12.443c.491-3.694 3.662-6.554 7.488-6.554s6.998 2.86 7.489 6.554H2.066zM19.109 76.557V59.987V13.443c0-3.074-1.465-5.805-3.727-7.554h47.955c4.166 0 7.555 3.389 7.555 7.554v46.544v15.569H35.217c-.552 0-1 .447-1 1 0 4.166-3.389 7.555-7.554 7.555S19.109 80.723 19.109 76.557zM80.445 84.111H32.5c2.01-1.557 3.388-3.893 3.666-6.555h35.726h16.043C87.443 81.251 84.272 84.111 80.445 84.111z" />
        <path d="M61.196 25.546H29.547c-.552 0-1-.448-1-1s.448-1 1-1h31.649c.553 0 1 .448 1 1S61.749 25.546 61.196 25.546z" />
        <path d="M61.196 37.957H29.547c-.552 0-1-.448-1-1s.448-1 1-1h31.649c.553 0 1 .448 1 1S61.749 37.957 61.196 37.957z" />
        <path d="M61.196 50.368H29.547c-.552 0-1-.447-1-1s.448-1 1-1h31.649c.553 0 1 .447 1 1S61.749 50.368 61.196 50.368z" />
        <path d="M51.671 67.295c-.16 0-.32-.038-.467-.115-.323-.171-.527-.505-.533-.87-.018-1.166-.056-2.331-.116-3.496-.055.023-.12.054-.195.094l-7.74 4.095c-.489.26-1.093.072-1.352-.416-.258-.488-.072-1.094.416-1.352l7.742-4.096c1.445-.763 2.255-.267 2.608.101.467.48.499 1.101.517 1.435.03.596.056 1.192.076 1.789l8.018-5.31c.461-.306 1.08-.18 1.386.282.305.46.179 1.08-.282 1.386l-9.525 6.308c-.162.107-.355.163-.548.163z" />
      </svg>
    ),
  },
];

export function CustomerUserMenu({ displayName, shortName, onNavigate, className = '' }: CustomerUserMenuProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = (key: string) => translate(customerUserMenuMessages, locale, key);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleDocPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleDocPointerDown);
    return () => document.removeEventListener('pointerdown', handleDocPointerDown);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      persistAccessToken(null);
      setOpen(false);
      onNavigate?.();
      void router.replace('/login');
      void logoutAccount().catch(() => {
        /* token already cleared locally */
      });
    } finally {
      setLoggingOut(false);
    }
  }

  const closeMenu = () => {
    setOpen(false);
    onNavigate?.();
  };

  const fullWidth = className.includes('w-full');

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('menu.toggle')}
        aria-haspopup="menu"
        aria-expanded={open}
        title={displayName}
        className={`inline-flex items-center gap-2 rounded-lg border border-[#345793] bg-[#0b1d3f]/40 px-3 py-2 text-sm font-medium text-[#e8f0ff] hover:bg-[#1f7bff]/15 ${
          fullWidth ? 'w-full min-w-0' : 'min-w-[148px]'
        }`}
      >
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#4a6ea8] bg-[#132a52] text-[#9dc5ff]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <span className="truncate">{shortName}</span>
        <svg
          viewBox="0 0 20 20"
          className={`ml-auto h-4 w-4 shrink-0 text-[#b8c9e8] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          aria-hidden="true"
        >
          <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={t('menu.toggle')}
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white py-1 shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
        >
          {MENU_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#334155] hover:bg-[#f1f5f9]"
            >
              <MenuIcon>{item.icon}</MenuIcon>
              <span>{t(item.labelKey)}</span>
            </Link>
          ))}
          <div className="my-1 border-t border-[#e2e8f0]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#334155] hover:bg-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MenuIcon>
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
                <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M14 12H4M14 12l-3-3M14 12l-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </MenuIcon>
            <span>{loggingOut ? t('menu.loggingOut') : t('menu.logout')}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
