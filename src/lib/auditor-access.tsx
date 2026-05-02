"use client";

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

type AuditorAccessContextValue = {
  isReadOnly: boolean;
};

const AuditorAccessContext = createContext<AuditorAccessContextValue>({ isReadOnly: true });

export function AuditorAccessProvider({ isReadOnly, children }: { isReadOnly: boolean; children: ReactNode }) {
  return <AuditorAccessContext.Provider value={{ isReadOnly }}>{children}</AuditorAccessContext.Provider>;
}

export function useAuditorAccess() {
  return useContext(AuditorAccessContext);
}
