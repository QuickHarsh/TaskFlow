const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_URL + '/api' + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, b) => request(p, { method: 'POST', body: b }),
  patch: (p, b) => request(p, { method: 'PATCH', body: b }),
  delete: (p) => request(p, { method: 'DELETE' }),
};

import { useEffect, useState } from 'react';

export function withAuthGuard(Component) {
  return function Guarded(props) {
    const [mounted, setMounted] = useState(false);
    const [ok, setOk] = useState(false);

    useEffect(() => {
      setMounted(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
      } else {
        setOk(true);
      }
    }, []);

    if (!mounted || !ok) return null;
    return <Component {...props} />;
  }
}
