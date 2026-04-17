'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

type AdminAccessContextValue = {
  isReadOnly: boolean;
};

const AdminAccessContext = createContext<AdminAccessContextValue>({ isReadOnly: true });

export function AdminAccessProvider({
  isReadOnly,
  children,
}: {
  isReadOnly: boolean;
  children: ReactNode;
}) {
  return <AdminAccessContext.Provider value={{ isReadOnly }}>{children}</AdminAccessContext.Provider>;
}

export function useAdminAccess() {
  return useContext(AdminAccessContext);
}
