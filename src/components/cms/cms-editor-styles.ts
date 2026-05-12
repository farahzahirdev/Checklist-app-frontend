/** Shared admin-shell styling for CMS editors (matches Support / Logs / CMS list). */

/** Use on form fields inside the global dark-themed app so native controls render with readable text. */
const cmsColorSchemeLight = '[color-scheme:light]';

export const cmsInputClass = `w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none transition-colors focus:border-[#7ea6e7] disabled:bg-[#f4f6fb] disabled:text-[#8a9ab8] ${cmsColorSchemeLight}`;

export const cmsTextareaClass = `w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none transition-colors focus:border-[#7ea6e7] ${cmsColorSchemeLight}`;

/** Monospace JSON / raw structure editor — high contrast on light surface. */
export const cmsJsonTextareaClass = `${cmsTextareaClass} min-h-[240px] resize-y font-mono text-[13px] leading-relaxed [tab-size:2]`;

export const cmsHintClass = 'mt-1.5 text-xs text-[#607594]';

export const cmsLabelClass = 'mb-2 block text-sm font-medium text-[#243555]';

export const cmsLabelUpperClass =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f82a3]';

export const cmsPanelClass =
  'rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm';

export const cmsToolbarClass =
  'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e2e8f5] bg-[linear-gradient(160deg,#ffffff_0%,#f7f9fe_100%)] px-4 py-3 shadow-sm';

export const cmsBtnPrimaryClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#223657] disabled:opacity-50';

export const cmsBtnSecondaryClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4dced] bg-white px-4 py-2 text-sm font-semibold text-[#2a3d5f] transition-colors hover:bg-[#f7f9fe]';

export const cmsBtnPreviewActiveClass =
  'inline-flex items-center gap-2 rounded-xl border border-[#2f7dff] bg-[#edf4ff] px-4 py-2 text-sm font-semibold text-[#10284f]';

export const cmsBtnGhostClass =
  'inline-flex items-center gap-2 rounded-xl border border-transparent bg-transparent px-4 py-2 text-sm font-semibold text-[#607594] hover:bg-[#eef2fa] hover:text-[#2a3d5f]';

export const cmsTabActiveClass =
  'border-b-2 border-[#3e69b0] pb-3 text-[#1f2d45]';

export const cmsTabInactiveClass =
  'border-b-2 border-transparent pb-3 text-[#607594] hover:text-[#1f2d45]';

export const cmsAddSectionGridBtnClass =
  'rounded-xl border border-[#dbe4f4] bg-white p-4 text-left transition-colors hover:border-[#7ea6e7] hover:bg-[#f7f9fe]';

export const cmsSuccessBtnClass =
  'inline-flex items-center gap-2 rounded-xl border border-[#1d6b45] bg-[#e8f4ec] px-4 py-2 text-sm font-semibold text-[#145c3a] hover:bg-[#d5ecd9]';
