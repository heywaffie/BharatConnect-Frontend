const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export const api = {
  auth: {
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    google: (body) => request('/auth/google', { method: 'POST', body: JSON.stringify(body) }),
  },
  issues: {
    mine: (email) => request(`/issues/mine?email=${encodeURIComponent(email)}`),
    all: () => request('/issues'),
    create: (body) => request('/issues', { method: 'POST', body: JSON.stringify(body) }),
    upvote: (issueId) => request(`/issues/${issueId}/upvote`, { method: 'POST' }),
    updateStatus: (issueId, status) =>
      request(`/issues/${issueId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    addResponse: (issueId, body) => request(`/issues/${issueId}/responses`, { method: 'POST', body: JSON.stringify(body) }),
  },
  announcements: {
    all: () => request('/announcements'),
    create: (body) => request('/announcements', { method: 'POST', body: JSON.stringify(body) }),
  },
  feedback: {
    create: (body) => request('/feedback', { method: 'POST', body: JSON.stringify(body) }),
  },
  admin: {
    users: () => request('/admin/users'),
    updateUserStatus: (userId, status) =>
      request(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
};
