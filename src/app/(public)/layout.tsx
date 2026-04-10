import { SiteHeader } from '@/components/site-header';
import type { ReactNode } from 'react';

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />
      {children}
    </div>
  );
}