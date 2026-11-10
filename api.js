export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';


export async function api(path, options = {}) {
  const token = localStorage.getItem('lms_token');
  const headers = { ...(options.headers || {}) };

  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}
