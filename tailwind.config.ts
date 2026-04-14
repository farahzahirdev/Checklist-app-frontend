import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(1.25rem)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.65s ease-out both',
        'fade-in-right': 'fade-in-right 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
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
