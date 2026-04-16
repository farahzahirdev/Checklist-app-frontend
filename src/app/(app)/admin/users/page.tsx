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
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Users</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Users & Role Assignment</h1>
        <p className="mt-1 text-sm text-[#607594]">
          Assign platform roles using the backend admin endpoint. This controls access for admin, auditor, and customer
          experiences.
        </p>
      </header>

      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[#243555]">Assign Role</h2>
        <p className="mt-1 text-sm text-[#607594]">API: PATCH /auth/admin/users/{'{user_id}'}/role</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Target user ID</span>
            <input
              type="text"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="UUID"
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">New role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            >
              {ROLE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border border-[#2f7dff] bg-[#2f7dff] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Updating…' : 'Update role'}
          </button>
        </form>

        {message ? <p className="mt-3 rounded-lg bg-[#e9f8ef] px-3 py-2 text-sm text-[#2f9960]">{message}</p> : null}
        {error ? <p className="mt-3 rounded-lg bg-[#ffedf0] px-3 py-2 text-sm text-[#cc5163]">{error}</p> : null}
      </article>
    </section>
  );
}
