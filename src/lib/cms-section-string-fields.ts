export type StringFieldEntry = { path: string; value: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Collect every string leaf in nested JSON (objects + arrays), using dot paths and numeric indices. */
export function flattenStringFields(data: unknown, prefix = ''): StringFieldEntry[] {
  if (data === null || data === undefined) return [];
  if (typeof data === 'string') {
    return prefix ? [{ path: prefix, value: data }] : [];
  }
  if (typeof data === 'number' || typeof data === 'boolean') return [];
  if (Array.isArray(data)) {
    const out: StringFieldEntry[] = [];
    data.forEach((item, i) => {
      const next = prefix ? `${prefix}.${i}` : String(i);
      out.push(...flattenStringFields(item, next));
    });
    return out;
  }
  if (isRecord(data)) {
    const out: StringFieldEntry[] = [];
    for (const [k, v] of Object.entries(data)) {
      const next = prefix ? `${prefix}.${k}` : k;
      out.push(...flattenStringFields(v, next));
    }
    return out;
  }
  return [];
}

/** Deep-set a string at a dot path; creates missing objects/arrays. Mutates `root`. */
export function setStringAtPath(root: Record<string, unknown>, path: string, value: string): void {
  const parts = path.split('.').filter(Boolean);
  if (parts.length === 0) return;
  let cur: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = parts[i + 1];
    if (Array.isArray(cur)) {
      const idx = Number(p);
      while (cur.length <= idx) cur.push(null);
      if (cur[idx] == null) cur[idx] = /^\d+$/.test(next) ? [] : {};
      cur = cur[idx];
    } else if (isRecord(cur)) {
      if (cur[p] == null) cur[p] = /^\d+$/.test(next) ? [] : {};
      cur = cur[p];
    } else {
      return;
    }
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(cur)) {
    const idx = Number(last);
    while (cur.length <= idx) cur.push('');
    cur[idx] = value;
  } else if (isRecord(cur)) {
    cur[last] = value;
  }
}

export function applyStringFieldUpdates(base: Record<string, unknown>, updates: Record<string, string>): Record<string, unknown> {
  const out = structuredClone(base) as Record<string, unknown>;
  for (const [path, value] of Object.entries(updates)) {
    setStringAtPath(out, path, value);
  }
  return out;
}
