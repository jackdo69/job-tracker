/**
 * API client for backend communication.
 */
import axios from 'axios';
import type {
  JobApplication,
  JobApplicationCreate,
  JobApplicationUpdate,
  JobApplicationMove,
} from '../types/job';
import type { AnalyticsData } from '../types/analytics';
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Token management
 */
const TOKEN_KEY = 'access_token';

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  },
};

// Set token from localStorage on initialization
const storedToken = tokenManager.getToken();
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

/**
 * Response interceptor for handling authentication errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      tokenManager.removeToken();

      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Job Applications API
 */
export const jobApplicationsApi = {
  /**
   * Get all job applications
   */
  getAll: async (): Promise<JobApplication[]> => {
    const response = await api.get<JobApplication[]>('/applications');
    return response.data;
  },

  /**
   * Get single job application by ID
   */
  getById: async (id: string): Promise<JobApplication> => {
    const response = await api.get<JobApplication>(`/applications/${id}`);
    return response.data;
  },

  /**
   * Create new job application
   */
  create: async (data: JobApplicationCreate): Promise<JobApplication> => {
    const response = await api.post<JobApplication>('/applications', data);
    return response.data;
  },

  /**
   * Update job application
   */
  update: async (
    id: string,
    data: JobApplicationUpdate
  ): Promise<JobApplication> => {
    const response = await api.put<JobApplication>(`/applications/${id}`, data);
    return response.data;
  },

  /**
   * Delete job application
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}`);
  },

  /**
   * Move job application to new status (for drag-drop)
   */
  move: async (id: string, data: JobApplicationMove): Promise<JobApplication> => {
    const response = await api.patch<JobApplication>(
      `/applications/${id}/move`,
      data
    );
    return response.data;
  },
};

/**
 * Analytics API
 */
export const analyticsApi = {
  /**
   * Get analytics data
   */
  get: async (): Promise<AnalyticsData> => {
    const response = await api.get<AnalyticsData>('/analytics');
    return response.data;
  },
};

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Get current user information
   */
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Get Google OAuth login URL
   */
  getGoogleLoginUrl: async (): Promise<string> => {
    const response = await api.get<{ auth_url: string }>('/auth/google/login');
    return response.data.auth_url;
  },

  /**
   * Complete Google OAuth login with authorization code
   */
  googleCallback: async (code: string): Promise<LoginResponse> => {
    const response = await api.get<LoginResponse>(`/auth/google/callback?code=${code}`);
    return response.data;
  },
};

export default api;
