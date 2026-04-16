'use client';

import { useState } from 'react';

type UserRow = {
  name: string;
  email: string;
  role: 'admin' | 'auditor' | 'customer';
  status: 'Active' | 'Invited';
};

const initialUsers: UserRow[] = [
  { name: 'John Novak', email: 'john@checklistkb.com', role: 'admin', status: 'Active' },
  { name: 'Nina Ford', email: 'nina@blueharbor.com', role: 'auditor', status: 'Active' },
  { name: 'Maya Lee', email: 'maya@deltasystems.com', role: 'customer', status: 'Active' },
  { name: 'Ali Ahmed', email: 'ali@novahealth.com', role: 'customer', status: 'Invited' },
];

const statusClass: Record<string, string> = {
  Active: 'bg-[#e9f8ef] text-[#2f9960]',
  Invited: 'bg-[#eaf2ff] text-[#3f74df]',
};

export default function AdminPreviewUsersPage() {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);

  function updateRole(email: string, role: UserRow['role']) {
    setUsers((prev) => prev.map((user) => (user.email === email ? { ...user, role } : user)));
  }

  function updateStatus(email: string, status: UserRow['status']) {
    setUsers((prev) => prev.map((user) => (user.email === email ? { ...user, status } : user)));
  }

  function removeUser(email: string) {
    setUsers((prev) => prev.filter((user) => user.email !== email));
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Users</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Users & Role Assignment (Preview)</h1>
      </header>
      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Role</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Update Role</th><th className="py-2 pr-4">Update Status</th><th className="py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{user.name}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{user.email}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{user.role}</td>
                  <td className="py-3 pr-4"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[user.status]}`}>{user.status}</span></td>
                  <td className="py-3 pr-4">
                    <select
                      value={user.role}
                      onChange={(event) => updateRole(user.email, event.target.value as UserRow['role'])}
                      className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-1 text-xs font-semibold text-[#3e69b0]"
                    >
                      <option value="admin">admin</option>
                      <option value="auditor">auditor</option>
                      <option value="customer">customer</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={user.status}
                      onChange={(event) => updateStatus(user.email, event.target.value as UserRow['status'])}
                      className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-1 text-xs font-semibold text-[#3e69b0]"
                    >
                      <option value="Active">Active</option>
                      <option value="Invited">Invited</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <button type="button" onClick={() => removeUser(user.email)} className="text-sm font-semibold text-[#c74d5f]">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
