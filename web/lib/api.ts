import axios from 'axios';

// Define types
export interface User {
  id: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginPayload {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  error?: string;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests when available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
const api = {
  // Auth methods
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },

  getCurrentUser: async (token?: string): Promise<User> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get('/auth/me', { headers });
    return response.data;
  },

  // Add other API methods as needed
};

export default api; 