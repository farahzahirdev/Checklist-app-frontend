/** Turns snake_case tokens into Title Case words (UI only; not for API keys). */
export function humanizeToken(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const ACTION_LABELS: Record<string, string> = {
  read: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
  manage: 'Manage',
  submit: 'Submit',
};

export function formatActionLabel(action: string) {
  const key = action.trim().toLowerCase();
  return ACTION_LABELS[key] ?? humanizeToken(action);
}

const RESOURCE_TITLE_OVERRIDES: Record<string, string> = {
  assessment_submit: 'Assessment',
};

export function formatResourceTitle(resource: string) {
  return RESOURCE_TITLE_OVERRIDES[resource] ?? humanizeToken(resource);
}

export function permissionKey(resource: string, action: string) {
  return `${resource}:${action}`;
}

type PermissionLike = { resource: string; action: string; description?: string | null };

/** Chips, dropdown summary, and anywhere the full permission should read as one line. */
export function formatPermissionLine(p: PermissionLike) {
  const d = (p.description ?? '').trim();
  if (d) return d;
  return `${formatResourceTitle(p.resource)} — ${formatActionLabel(p.action)}`;
}

/** Matrix row: section header already shows the area; prefer API description, else verb label. */
export function formatPermissionRowLabel(p: PermissionLike) {
  const d = (p.description ?? '').trim();
  if (d) return d;
  return formatActionLabel(p.action);
}
