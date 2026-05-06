import type { Metadata } from 'next';
import './globals.css';
import { AppToaster } from '@/components/app-toaster';

export const metadata: Metadata = {
  title: 'Checklist App',
  description: 'Secure checklist platform boilerplate for milestone 1.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
