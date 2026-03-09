/**
 * Backend API base URL for public menu fetch.
 * In dev with no VITE_API_URL: use '' so Vite proxies /api to backend (no CORS).
 * With VITE_API_URL or in production: use that URL.
 */
export const API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
    : typeof import.meta !== 'undefined' && import.meta.env?.DEV
      ? ''
      : 'http://localhost:5000'
