const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

function extractApiError(payload, response) {
  if (payload && typeof payload === 'object') {
    return payload.message || payload.error || payload.detail || `Request failed with status ${response.status}`;
  }
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }
  return `Request failed with status ${response.status}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(extractApiError(payload, response));
  }

  return payload;
}

export const api = {
  auth: {
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    google: (body) => request('/auth/google', { method: 'POST', body: JSON.stringify(body) }),
    completeOnboarding: (body) => request('/auth/onboarding', { method: 'POST', body: JSON.stringify(body) }),
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
    users: (requesterEmail) => request(`/admin/users?requesterEmail=${encodeURIComponent(requesterEmail)}`),
    updateUserStatus: (userId, status, requesterEmail) =>
      request(`/admin/users/${userId}/status?requesterEmail=${encodeURIComponent(requesterEmail)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    updateUserRole: (userId, role, requesterEmail) =>
      request(`/admin/users/${userId}/role?requesterEmail=${encodeURIComponent(requesterEmail)}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
  },
};
