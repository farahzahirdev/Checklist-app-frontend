'use client';

import Link from 'next/link';
import type { Route } from 'next';

export type AdminBreadcrumbItem = {
  label: string;
  href?: Route | string;
};

export function AdminBreadcrumbs({
  items,
  variant = 'default',
}: {
  items: AdminBreadcrumbItem[];
  variant?: 'default' | 'onDark';
}) {
  const onDark = variant === 'onDark';
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-sm">
      <ol
        className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${onDark ? 'text-[#c4d6f7]' : 'text-[#6f82a3]'}`}
      >
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span
                className={`select-none ${onDark ? 'text-[#5d7aaa]' : 'text-[#b8c4db]'}`}
                aria-hidden="true"
              >
                /
              </span>
            ) : null}
            {item.href ? (
              <Link
                href={item.href as Route}
                className={`font-semibold ${onDark ? 'text-[#b8d4ff] hover:text-white' : 'text-[#3e69b0] hover:text-[#274b84]'}`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`font-semibold ${onDark ? 'text-white' : 'text-[#1f2d45]'}`}
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
