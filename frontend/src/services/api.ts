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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
    // Transform camelCase to snake_case for backend
    const backendData = {
      company_name: data.companyName,
      position_title: data.positionTitle,
      status: data.status,
      interview_stage: data.interviewStage,
      rejection_stage: data.rejectionStage,
      application_date: data.applicationDate,
      salary_range: data.salaryRange,
      location: data.location,
      notes: data.notes,
      order_index: data.orderIndex,
    };

    const response = await api.post<JobApplication>('/applications', backendData);
    return response.data;
  },

  /**
   * Update job application
   */
  update: async (
    id: string,
    data: JobApplicationUpdate
  ): Promise<JobApplication> => {
    // Transform camelCase to snake_case for backend
    const backendData: any = {};
    if (data.companyName !== undefined) backendData.company_name = data.companyName;
    if (data.positionTitle !== undefined) backendData.position_title = data.positionTitle;
    if (data.status !== undefined) backendData.status = data.status;
    if (data.interviewStage !== undefined) backendData.interview_stage = data.interviewStage;
    if (data.rejectionStage !== undefined) backendData.rejection_stage = data.rejectionStage;
    if (data.applicationDate !== undefined) backendData.application_date = data.applicationDate;
    if (data.salaryRange !== undefined) backendData.salary_range = data.salaryRange;
    if (data.location !== undefined) backendData.location = data.location;
    if (data.notes !== undefined) backendData.notes = data.notes;
    if (data.orderIndex !== undefined) backendData.order_index = data.orderIndex;

    const response = await api.put<JobApplication>(`/applications/${id}`, backendData);
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
    // Transform camelCase to snake_case for backend
    const backendData = {
      status: data.status,
      order_index: data.orderIndex,
      interview_stage: data.interviewStage,
      rejection_stage: data.rejectionStage,
    };

    const response = await api.patch<JobApplication>(
      `/applications/${id}/move`,
      backendData
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
