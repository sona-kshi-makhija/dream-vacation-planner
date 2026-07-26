// All calls go through /api — Nginx (in production) or the Vite dev proxy
// (in local development) forwards that path to the Express backend.
// Every request carries the signed-in user's JWT, so the backend only
// ever returns or modifies that user's own trips.

const BASE_URL = '/api/vacations';

function authHeaders() {
  const token = localStorage.getItem('dvp_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      // Token missing/expired — clear it so the next page load / route
      // guard sends the person back to the sign-in screen.
      localStorage.removeItem('dvp_token');
      localStorage.removeItem('dvp_user');
    }
    const err = new Error(body.message || 'Request failed');
    err.status = res.status;
    err.fieldErrors = body.errors || [];
    throw err;
  }
  return body;
}

export async function fetchVacations() {
  const res = await fetch(BASE_URL, { headers: { ...authHeaders() } });
  const body = await parseResponse(res);
  return body.data;
}

export async function createVacation(payload) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  const body = await parseResponse(res);
  return body.data;
}

export async function deleteVacation(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  return parseResponse(res);
}
