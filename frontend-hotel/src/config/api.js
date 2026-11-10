const rawApiUrl = (
  window.__ENV__?.VITE_API_URL?.trim() ||
  import.meta.env.VITE_API_URL?.trim() ||
  'http://localhost:3000'
).replace(/\/+$/, '');

export const API_BASE_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl.slice(0, -4)
  : rawApiUrl;

