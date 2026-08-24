/**
 * Thin fetch wrapper around the Care Dent API.
 *
 * - Attaches the bearer token from localStorage when present.
 * - Normalises errors into a single ApiError shape so components can just
 *   render `err.message` and, for forms, `err.fieldErrors`.
 */

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'caredent_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, { status, fieldErrors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors || {};
  }
}

async function request(path, { method = 'GET', body, headers = {}, signal, raw = false } = {}) {
  const isFormData = body instanceof FormData;
  const token = getToken();

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include',
      signal,
      headers: {
        ...(isFormData ? {} : body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(
      'Cannot reach the server. Make sure the API is running on ' + BASE_URL.replace('/api', ''),
      { status: 0 }
    );
  }

  if (raw) return response;

  let payload = null;
  const text = await response.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = { message: text }; }
  }

  if (!response.ok) {
    const fieldErrors = {};
    for (const e of payload?.errors || []) {
      if (e.field) fieldErrors[e.field] = e.message;
    }
    if (response.status === 401) clearToken();
    throw new ApiError(payload?.message || `Request failed (${response.status})`, {
      status: response.status,
      fieldErrors,
    });
  }

  return payload;
}

const qs = (params = {}) => {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') search.set(k, v);
  }
  const s = search.toString();
  return s ? `?${s}` : '';
};

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

/* ----------------------------- endpoints ----------------------------- */

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: (opts) => api.get('/auth/me', opts),
  updateMe: (data) => api.patch('/auth/me', data),
  changePassword: (data) => api.patch('/auth/me/password', data),
};

export const catalogApi = {
  list: (params, opts) => api.get(`/products${qs(params)}`, opts),
  get: (slug, opts) => api.get(`/products/${slug}`, opts),
  categories: (opts) => api.get('/products/categories', opts),
  services: (opts) => api.get('/services', opts),
};

export const publicApi = {
  requestQuote: (data) => api.post('/quotations', data),
  trackQuote: (ref) => api.get(`/quotations/track/${encodeURIComponent(ref)}`),
  sendMessage: (data) => api.post('/contact', data),
  requestService: (data) => api.post('/service-requests', data),
  // FormData: carries the clinic's floor plan / room photos alongside the fields.
  requestSiteAssessment: (formData) => api.post('/site-assessments', formData),
  trackService: (ref) => api.get(`/service-requests/track/${encodeURIComponent(ref)}`),
  trackOrder: (ref) => api.get(`/orders/track/${encodeURIComponent(ref)}`),
};

export const portalApi = {
  overview: (opts) => api.get('/portal/overview', opts),
  orders: (params, opts) => api.get(`/portal/orders${qs(params)}`, opts),
  order: (id, opts) => api.get(`/portal/orders/${id}`, opts),
  quotations: (params, opts) => api.get(`/portal/quotations${qs(params)}`, opts),
  serviceRequests: (params, opts) => api.get(`/portal/service-requests${qs(params)}`, opts),
  invoices: (params, opts) => api.get(`/portal/invoices${qs(params)}`, opts),
  documents: (opts) => api.get('/portal/documents', opts),
};

export const adminApi = {
  dashboard: (opts) => api.get('/admin/dashboard', opts),

  inventory: (params, opts) => api.get(`/admin/inventory${qs(params)}`, opts),
  adjustStock: (id, data) => api.patch(`/admin/inventory/${id}`, data),

  products: (params, opts) => api.get(`/admin/products${qs(params)}`, opts),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.patch(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.del(`/admin/products/${id}`),
  uploadProductImages: (id, formData) => api.post(`/admin/products/${id}/images`, formData),

  orders: (params, opts) => api.get(`/admin/orders${qs(params)}`, opts),
  createOrder: (data) => api.post('/admin/orders', data),
  updateOrder: (id, data) => api.patch(`/admin/orders/${id}`, data),
  deleteOrder: (id) => api.del(`/admin/orders/${id}`),

  quotations: (params, opts) => api.get(`/admin/quotations${qs(params)}`, opts),
  updateQuotation: (id, data) => api.patch(`/admin/quotations/${id}`, data),
  replyQuotation: (id, message) => api.post(`/admin/quotations/${id}/reply`, { message }),
  deleteQuotation: (id) => api.del(`/admin/quotations/${id}`),

  serviceRequests: (params, opts) => api.get(`/admin/service-requests${qs(params)}`, opts),
  updateServiceRequest: (id, data) => api.patch(`/admin/service-requests/${id}`, data),
  deleteServiceRequest: (id) => api.del(`/admin/service-requests/${id}`),

  invoices: (params, opts) => api.get(`/admin/invoices${qs(params)}`, opts),
  createInvoice: (data) => api.post('/admin/invoices', data),
  recordPayment: (id, data) => api.post(`/admin/invoices/${id}/payment`, data),
  deleteInvoice: (id) => api.del(`/admin/invoices/${id}`),

  customers: (params, opts) => api.get(`/admin/customers${qs(params)}`, opts),
  customer: (id, opts) => api.get(`/admin/customers/${id}`, opts),
  updateCustomer: (id, data) => api.patch(`/admin/customers/${id}`, data),
  setCustomerActive: (id, isActive) => api.patch(`/admin/customers/${id}/active`, { isActive }),

  messages: (params, opts) => api.get(`/admin/messages${qs(params)}`, opts),
  updateMessage: (id, data) => api.patch(`/admin/messages/${id}`, data),
  replyMessage: (id, message) => api.post(`/admin/messages/${id}/reply`, { message }),
  deleteMessage: (id) => api.del(`/admin/messages/${id}`),

  documents: (opts) => api.get('/admin/documents', opts),
  uploadDocument: (formData) => api.post('/admin/documents', formData),
  deleteDocument: (id) => api.del(`/admin/documents/${id}`),

  upsertService: (data) => api.put('/admin/services', data),
};

export { BASE_URL };
