// Backend API base URL. In dev with no VITE_API_URL we use '' so Vite proxies /api to backend.
export const API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
    : typeof import.meta !== 'undefined' && import.meta.env?.DEV
      ? ''
      : 'http://localhost:5000';

export const AUTH_TOKEN_KEY = 'sayo_admin_token';
export const AUTH_USER_KEY = 'sayo_admin_user';
