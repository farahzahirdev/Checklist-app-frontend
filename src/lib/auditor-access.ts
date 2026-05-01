import { useMemo } from 'react';

export function useAuditorAccess() {
  const isReadOnly = useMemo(() => {
    // Auditor role is always read-only
    // This could be enhanced with actual role checking from user context
    return true;
  }, []);

  return {
    isReadOnly,
    // Could add more auditor-specific permissions here
    canViewAssessments: true,
    canViewReports: true,
    canViewAuditLogs: true,
    canExportData: false, // Auditors typically can't export
    canEditSettings: false, // Auditors can't edit settings
  };
}

export type AuditorPermissions = ReturnType<typeof useAuditorAccess>;
