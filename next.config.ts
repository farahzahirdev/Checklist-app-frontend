import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  i18n: {
    locales: ['en', 'es', 'fr', 'de'],
    defaultLocale: 'en',
  },
};

export default nextConfig;
