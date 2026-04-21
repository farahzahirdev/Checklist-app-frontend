'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { createChecklist } from '@/lib/checklist-api';

export default function NewChecklistPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [lawDecree, setLawDecree] = useState('');
  const [version, setVersion] = useState('1');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const normalizedTitle = title.trim();
      const normalizedLawDecree = lawDecree.trim();
      const parsedVersion = Number.parseInt(version, 10);
      if (!normalizedTitle || !normalizedLawDecree) {
        setError('Title and Law/Decree are required.');
        return;
      }
      if (!Number.isInteger(parsedVersion) || parsedVersion < 1) {
        setError('Version must be a valid integer (1 or greater).');
        return;
      }
      await createChecklist({
        title: normalizedTitle,
        auditType: 'compliance',
        lawDecree: normalizedLawDecree,
        version: String(parsedVersion),
        status,
      });
      toast.success('Checklist created.');
      router.push('/admin/checklists');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checklist');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <header>
        <Link href="/admin/checklists" className="inline-flex items-center gap-1 text-sm font-medium text-[#425f8f] hover:text-[#223a63]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="M15 6 9 12l6 6M9 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-semibold">Create Checklist</h1>
      </header>
      <form onSubmit={onSubmit} className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Title <span className="text-[#c43e53]">*</span></span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Law/Decree <span className="text-[#c43e53]">*</span></span>
            <input value={lawDecree} onChange={(e) => setLawDecree(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Version <span className="text-[#c43e53]">*</span></span>
            <input value={version} onChange={(e) => setVersion(e.target.value.replace(/[^\d]/g, ''))} type="number" min={1} step={1} placeholder="1" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2" required />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Status <span className="text-[#c43e53]">*</span></span>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>
        </div>
        {error ? <p className="rounded-lg bg-[#ffedf0] px-3 py-2 text-sm text-[#cc5163]">{error}</p> : null}
        <button disabled={loading} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60">
          {loading ? 'Creating...' : 'Create checklist'}
        </button>
      </form>
    </section>
  );
}
