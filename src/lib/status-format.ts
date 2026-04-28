export function formatStatusLabel(value: string | null | undefined): string {
  if (!value) return '-';
  const normalized = value.trim().replace(/_/g, ' ');
  if (!normalized) return '-';
  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

