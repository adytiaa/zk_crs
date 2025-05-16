// /medi/src/lib/appClient.ts
const API_BASE_URL = '/api'; // Assuming Next.js API routes are at /api

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  
  if (!(fetchOptions.body instanceof FormData)) { // Don't set Content-Type for FormData
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed with status ' + response.status }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) { // No Content
    return null as T;
  }
  return response.json() as T;
}

export default apiClient;

// Example usage:
// apiClient<{ message: string }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
// apiClient<User>('/auth/me', { token: authToken });