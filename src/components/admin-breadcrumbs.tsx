'use client';

import Link from 'next/link';
import type { Route } from 'next';

export type AdminBreadcrumbItem = {
  label: string;
  href?: Route | string;
};

export function AdminBreadcrumbs({ items }: { items: AdminBreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[#6f82a3]">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span className="select-none text-[#b8c4db]" aria-hidden="true">
                /
              </span>
            ) : null}
            {item.href ? (
              <Link href={item.href as Route} className="font-semibold text-[#3e69b0] hover:text-[#274b84]">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-[#1f2d45]" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
