import type { TranslationMessages } from '@/lib/i18n';

export const adminSettingsMessages: TranslationMessages = {
  en: {
    'hero.eyebrow': 'Settings',
    'hero.title': 'Platform Settings',
    'hero.subtitle': 'Configure organization defaults, security options, and retention policies.',
    'general.title': 'General Configuration',
    'field.orgName': 'Organization Name',
    'field.assessmentWindow': 'Default Assessment Window (days)',
    'field.retention': 'Data Retention (hours)',
    'actions.save': 'Save Changes',
    'security.title': 'Security Controls',
    'security.mfa': 'Enforce MFA for admins',
    'security.password': 'Require strong password policy',
    'security.lockout': 'Lock account after repeated failures',
    'security.auditExport': 'Enable audit log export permissions',
  },
  cs: {
    'hero.eyebrow': 'Nastavení',
    'hero.title': 'Nastavení platformy',
    'hero.subtitle': 'Výchozí hodnoty organizace, bezpečnost a politiky uchovávání dat.',
    'general.title': 'Obecná konfigurace',
    'field.orgName': 'Název organizace',
    'field.assessmentWindow': 'Výchozí okno hodnocení (dny)',
    'field.retention': 'Uchovávání dat (hodiny)',
    'actions.save': 'Uložit změny',
    'security.title': 'Bezpečnostní kontroly',
    'security.mfa': 'Vynutit MFA pro administrátory',
    'security.password': 'Vyžadovat silnou politiku hesel',
    'security.lockout': 'Zamknout účet po opakovaných neúspěších',
    'security.auditExport': 'Povolit export oprávnění auditního logu',
  },
};
