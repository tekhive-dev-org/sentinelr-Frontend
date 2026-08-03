export function validateConfig() {
  const required = [
    { key: 'NEXT_PUBLIC_API_BASE_URL', label: 'API base URL' },
    { key: 'NEXT_PUBLIC_WEB_APP_URL', label: 'Web app URL' },
    { key: 'NEXT_PUBLIC_ADMIN_APP_URL', label: 'Admin app URL' },
  ];

  const missing = required.filter(cfg => !process.env[cfg.key]);
  if (missing.length > 0 && typeof window === 'undefined') {
    const names = missing.map(m => m.label).join(', ');
    console.warn(`[Admin Config] Missing required environment variables: ${names}`);
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const config = {
  apiBaseUrl: API_BASE_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Sentinelr Admin',
  webAppUrl: process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:4000',
  adminAppUrl: process.env.NEXT_PUBLIC_ADMIN_APP_URL || 'http://localhost:3001',
};

export default config;
