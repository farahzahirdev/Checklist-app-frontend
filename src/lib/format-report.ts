/** User-facing copy — avoid raw ISO strings and enum-style backend values in the UI. */

export function formatReportCalendarDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(d);
  } catch {
    return '—';
  }
}

export function formatReportDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(d);
  } catch {
    return '—';
  }
}

export function findingPriorityLabel(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return priority;
  }
}
