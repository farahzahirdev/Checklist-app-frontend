'use client';

import { useState, type FormEvent } from 'react';
import { assignUserRole, type UserRole } from '@/lib/auth';

const ROLE_OPTIONS: UserRole[] = ['customer', 'auditor', 'admin'];

export default function AdminUsersPage() {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!userId.trim()) {
      setError('User ID is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await assignUserRole({ userId: userId.trim(), role });
      setMessage(`Role updated: ${response.user.email} is now ${response.user.role}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Admin</p>
        <h1 className="text-3xl font-semibold">Users & Roles</h1>
        <p className="text-sm text-zinc-300">
          Assign platform roles using the backend admin endpoint. This controls access for admin, auditor, and customer
          experiences.
        </p>
      </header>

      <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
        <h2 className="text-lg font-semibold">Assign Role</h2>
        <p className="mt-2 text-sm text-zinc-300">API: `PATCH /auth/admin/users/{'{user_id}'}/role`</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="block space-y-2 text-sm">
            <span className="text-zinc-200">Target user ID</span>
            <input
              type="text"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="UUID"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-zinc-100 outline-none ring-cyan-300/50 focus:ring"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-zinc-200">New role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-zinc-100 outline-none ring-cyan-300/50 focus:ring"
            >
              {ROLE_OPTIONS.map((value) => (
                <option key={value} value={value} className="bg-[#081126]">
                  {value}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-sm font-medium text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Updating…' : 'Update role'}
          </button>
        </form>

        {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </article>
    </section>
  );
}
