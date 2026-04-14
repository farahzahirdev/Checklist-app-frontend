import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        kb: {
          navy: '#020617',
          primary: '#1D4ED8',
          surface: '#F8FAFC',
          heading: '#0F172A',
          body: '#475569',
          'body-on-dark': '#94A3B8',
          accent: '#E0E7FF',
          success: '#22C55E',
        },
      },
      boxShadow: {
        'kb-card': '0 1px 3px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
