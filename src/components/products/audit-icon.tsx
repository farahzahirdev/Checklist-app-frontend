// Generic, filled SVG icons used for product cards and detail pages until the
// backend exposes per-product brand assets. All icons share a shield outline
// with a different inner glyph; colors are tied to the icon kind so the same
// product always renders the same color across the catalogue and detail page.

export type AuditIconKind = 'shield' | 'lock' | 'certificate' | 'clipboard';

export const AUDIT_ICON_THEMES: Record<AuditIconKind, { bg: string; fg: string }> = {
  shield: { bg: 'bg-[#e5f6ec]', fg: 'text-[#1f8a4b]' },
  lock: { bg: 'bg-[#e8f1ff]', fg: 'text-[#1f5fb8]' },
  certificate: { bg: 'bg-[#eef0ff]', fg: 'text-[#5c4cc9]' },
  clipboard: { bg: 'bg-[#fff4e2]', fg: 'text-[#b07419]' },
};

const AUDIT_ICON_CYCLE: AuditIconKind[] = ['shield', 'lock', 'certificate', 'clipboard'];

export function pickAuditIconKind(code: string | null | undefined, index: number): AuditIconKind {
  const c = (code ?? '').toLowerCase();
  if (c.includes('iso')) return 'certificate';
  if (c.includes('kb') && c.includes('high')) return 'lock';
  if (c.includes('kb')) return 'shield';
  return AUDIT_ICON_CYCLE[index % AUDIT_ICON_CYCLE.length];
}

export function AuditIcon({
  kind,
  className = 'h-7 w-7',
}: {
  kind: AuditIconKind;
  className?: string;
}) {
  const shield = (
    <path
      d="M12 2.5l8.5 3.4v6.2c0 5.2-3.6 9.8-8.5 11.4-4.9-1.6-8.5-6.2-8.5-11.4V5.9L12 2.5z"
      fill="currentColor"
    />
  );

  if (kind === 'shield') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        {shield}
        <path
          d="m8.4 12.4 2.6 2.6 4.6-4.8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }
  if (kind === 'lock') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        {shield}
        <path
          d="M9.5 11V9.7a2.5 2.5 0 1 1 5 0V11"
          stroke="white"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="8.4" y="11" width="7.2" height="6" rx="1.2" fill="white" />
        <circle cx="12" cy="13.8" r="0.9" fill="currentColor" />
      </svg>
    );
  }
  if (kind === 'certificate') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        {shield}
        <circle cx="12" cy="11" r="2.8" fill="white" />
        <path d="m9.6 13.6-1.1 4.2 3.5-1.8 3.5 1.8-1.1-4.2" fill="white" />
        <circle cx="12" cy="11" r="1.2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {shield}
      <g stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <line x1="8.6" y1="10.6" x2="15.4" y2="10.6" />
        <line x1="8.6" y1="13" x2="15.4" y2="13" />
        <line x1="8.6" y1="15.4" x2="13" y2="15.4" />
      </g>
    </svg>
  );
}
