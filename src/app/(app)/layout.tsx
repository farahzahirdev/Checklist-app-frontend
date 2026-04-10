import type { ReactNode } from 'react';

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}