import { API_BASE, AUTH_TOKEN_KEY, AUTH_USER_KEY } from './config.js';

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function setAuthUser(user) {
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function request(method, path, body = null) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body != null && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  let data;
  const ct = res.headers.get('content-type');
  if (ct && ct.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = {};
    }
  } else {
    data = {};
  }

  if (!res.ok) {
    if (res.status === 401) {
      setToken(null);
      setAuthUser(null);
      if (typeof window !== 'undefined') {
        const adminLogin = `${window.location.origin}/admin/login`;
        window.location.href = adminLogin;
      }
    }
    const err = new Error(data.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    async login(email, password) {
      const data = await request('POST', '/api/auth/login', { email, password });
      setToken(data.token);
      setAuthUser(data.user || { email, role: 'admin' });
      return data;
    },
    logout() {
      setToken(null);
      setAuthUser(null);
    },
  },

  mainSections: {
    getAll: () => request('GET', '/api/main-sections'),
    create: (body) => request('POST', '/api/main-sections', body),
    update: (id, updates) => request('PUT', `/api/main-sections/${id}`, updates),
    delete: (id) => request('DELETE', `/api/main-sections/${id}`),
    reorder: async (orderedIds) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await request('PUT', `/api/main-sections/${orderedIds[i]}`, { order: i });
      }
      return request('GET', '/api/main-sections');
    },
  },

  classifications: {
    getAll: () => request('GET', '/api/classifications'),
    getByMainSection: async (mainSectionId) => {
      const all = await request('GET', '/api/classifications');
      return all.filter((c) => c.mainSectionId === mainSectionId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
    create: (body) => request('POST', '/api/classifications', body),
    update: (id, updates) => request('PUT', `/api/classifications/${id}`, updates),
    delete: (id) => request('DELETE', `/api/classifications/${id}`),
    reorder: async (mainSectionId, orderedIds) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await request('PUT', `/api/classifications/${orderedIds[i]}`, { order: i });
      }
      return request('GET', '/api/classifications');
    },
  },

  menuItems: {
    getAll: () => request('GET', '/api/menu-items'),
    getByClassification: async (classificationId) => {
      const all = await request('GET', '/api/menu-items');
      return all.filter((i) => i.classificationId === classificationId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
    create: (body) => request('POST', '/api/menu-items', body),
    update: (id, updates) => request('PUT', `/api/menu-items/${id}`, updates),
    delete: (id) => request('DELETE', `/api/menu-items/${id}`),
    reorder: async (classificationId, orderedIds) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await request('PUT', `/api/menu-items/${orderedIds[i]}`, { order: i });
      }
      return request('GET', '/api/menu-items');
    },
  },

  tags: {
    getAll: () => request('GET', '/api/tags'),
    create: (body) => request('POST', '/api/tags', body),
    update: (id, updates) => request('PUT', `/api/tags/${id}`, updates),
    delete: (id) => request('DELETE', `/api/tags/${id}`),
  },

  countries: {
    getAll: () => request('GET', '/api/countries'),
    create: (body) => request('POST', '/api/countries', body),
    update: (id, updates) => request('PUT', `/api/countries/${id}`, updates),
    delete: (id) => request('DELETE', `/api/countries/${id}`),
  },

  settings: {
    get: () => request('GET', '/api/settings'),
    update: (updates) => request('PUT', '/api/settings', updates),
  },

  roles: {
    getAll: () => request('GET', '/api/roles'),
    create: (body) => request('POST', '/api/roles', body),
    update: (id, updates) => request('PUT', `/api/roles/${id}`, updates),
    delete: (id) => request('DELETE', `/api/roles/${id}`),
  },

  users: {
    getAll: () => request('GET', '/api/users'),
    create: (body) => request('POST', '/api/users', body),
    update: (id, updates) => request('PUT', `/api/users/${id}`, updates),
    delete: (id) => request('DELETE', `/api/users/${id}`),
  },

  customers: {
    getAll: () => request('GET', '/api/customers'),
    delete: (id) => request('DELETE', `/api/customers/${id}`),
  },

  auditLog: {
    get: (params = {}) => {
      const q = new URLSearchParams();
      if (params.from) q.set('from', params.from);
      if (params.to) q.set('to', params.to);
      if (params.limit) q.set('limit', String(params.limit));
      const query = q.toString();
      return request('GET', `/api/audit-log${query ? `?${query}` : ''}`);
    },
    delete: (body) => request('DELETE', '/api/audit-log', body),
  },
};
