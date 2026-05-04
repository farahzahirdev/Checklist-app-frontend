/**
 * Primary page `<h1>` styles — aligned with `/admin` (Admin Dashboard).
 * Font family inherits from the app root (Space Grotesk).
 */
export const ADMIN_PAGE_TITLE_CLASS =
  'text-3xl font-semibold tracking-tight text-[#1f2d45] sm:text-4xl';

/** Checklist builder top bar: same scale/weight, light text on dark header */
export const ADMIN_BUILDER_HEADER_TITLE_CLASS =
  'truncate text-3xl font-semibold tracking-tight text-white sm:text-4xl';

/** Page intro band — same navy gradient as admin layout shell header */
export const ADMIN_PAGE_HERO_HEADER_CLASS =
  'rounded-2xl border border-[#13305c] bg-[linear-gradient(120deg,#071733,#0c2144_45%,#13356d)] px-5 py-4 shadow-sm';

export const ADMIN_PAGE_HERO_EYEBROW_CLASS =
  'text-xs font-semibold uppercase tracking-[0.24em] text-[#9db8e6]';

export const ADMIN_PAGE_HERO_TITLE_CLASS =
  'mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl';

/** Same as hero title without top margin (use when spacing is handled by a parent row) */
export const ADMIN_PAGE_HERO_TITLE_TEXT_CLASS =
  'text-3xl font-semibold tracking-tight text-white sm:text-4xl';

export const ADMIN_PAGE_HERO_SUBTITLE_CLASS = 'mt-2 text-sm text-[#c4d6f7]';

/** Compact KPI tile — checklist / dashboard stat style */
export const ADMIN_KPI_DARK_CARD_CLASS =
  'rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] px-4 py-3 shadow-sm';

export const ADMIN_KPI_DARK_LABEL_CLASS =
  'text-xs font-semibold uppercase tracking-[0.12em] text-[#9db8e6]';
