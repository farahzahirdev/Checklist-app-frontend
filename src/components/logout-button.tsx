'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logoutAccount, persistAccessToken } from '@/lib/auth';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logoutAccount();
    } catch {
      // API logout is stateless; still clear client token.
    } finally {
      persistAccessToken(null);
      setLoading(false);
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-[#345793] px-3 py-1.5 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
