const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://booking-saas-production-b9fd.up.railway.app';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

async function parseResponse(res, fallback) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || fallback);
    err.status = res.status;
    throw err;
  }
  return data;
}

export function fetchCustomers({ q = '', filter = 'all' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (filter && filter !== 'all') params.set('filter', filter);
  const qs = params.toString();
  return fetch(`${BACKEND}/api/customers${qs ? `?${qs}` : ''}`, { headers: authHeaders() })
    .then((r) => parseResponse(r, 'שגיאה בטעינת הלקוחות'));
}

export function fetchCustomer(id) {
  return fetch(`${BACKEND}/api/customers/${id}`, { headers: authHeaders() })
    .then((r) => parseResponse(r, 'שגיאה בטעינת כרטיס הלקוחה'));
}

export function createCustomer(body) {
  return fetch(`${BACKEND}/api/customers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then((r) => parseResponse(r, 'שגיאה ביצירת לקוחה'));
}

export function updateCustomer(id, body) {
  return fetch(`${BACKEND}/api/customers/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  }).then((r) => parseResponse(r, 'שגיאה בעדכון הלקוחה'));
}
