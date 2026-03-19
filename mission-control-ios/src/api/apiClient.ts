import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useStore } from '../store';
import { tokenManager } from '../services/tokenManager';
import { syncQueue } from '../services/syncQueue';

/**
 * Enhanced API Client for Mission Control
 * Features:
 * - JWT token refresh cycle
 * - Request/response interceptors
 * - Offline queue management
 * - Retry logic with exponential backoff
 * - Local tunnel support
 */

interface APIConfig {
  baseURL?: string;
  tunnelURL?: string;
  timeout?: number;
  retryAttempts?: number;
}

interface APIError {
  code: string;
  message: string;
  status: number;
  timestamp: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Default configuration
const DEFAULT_CONFIG: APIConfig = {
  baseURL: process.env.REACT_APP_API_URL || 'https://api.missioncontrol.local',
  timeout: 15000,
  retryAttempts: 3,
};

class APIClient {
  private client: any;
  private config: APIConfig;
  private retryCount: Map<string, number> = new Map();

  constructor(config: APIConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = this.createClient();
    this.setupInterceptors();
  }

  /**
   * Create axios instance with base config
   */
  private createClient() {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'ios',
        'X-App-Version': '1.0.0',
      },
    });
  }

  /**
   * Set local tunnel URL
   */
  setTunnelURL(url: string) {
    this.config.tunnelURL = url;
    if (url) {
      this.client.defaults.baseURL = url;
    }
  }

  /**
   * Get current API base URL (tunnel or default)
   */
  getBaseURL(): string {
    return this.config.tunnelURL || this.config.baseURL || '';
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors() {
    // Request interceptor: Add auth, handle offline
    this.client.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        const { isOnline } = useStore.getState();

        // Add auth token
        const token = await tokenManager.getValidToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Queue write operations if offline
        if (!isOnline && config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
          await syncQueue.enqueue({
            method: config.method.toUpperCase(),
            url: config.url || '',
            data: config.data,
            timestamp: new Date().toISOString(),
          });

          // Return a rejected promise to prevent the actual request
          return Promise.reject(new Error('OFFLINE_QUEUED'));
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle errors and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const { logout } = useStore.getState();

        // Handle 401 - token expired or invalid
        if (error.response?.status === 401) {
          const refreshed = await tokenManager.refreshToken();
          if (!refreshed) {
            logout();
            return Promise.reject(new Error('Unauthorized - please login again'));
          }
          // Retry original request
          return this.client.request(error.config);
        }

        // Handle 403 - forbidden
        if (error.response?.status === 403) {
          return Promise.reject(new Error('Access denied'));
        }

        // Handle 429 - rate limited
        if (error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers['retry-after'] || '60');
          return Promise.reject(new Error(`Rate limited. Retry after ${retryAfter}s`));
        }

        // Handle network errors
        if (!error.response) {
          return Promise.reject(new Error('Network error - check your connection'));
        }

        // Extract error message
        const errorMessage = (error.response?.data as any)?.message || error.message;
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  /**
   * Generic request method with retry logic
   */
  private async request<T>(config: AxiosRequestConfig, retryCount = 0): Promise<AxiosResponse<T>> {
    try {
      return await this.client.request<T>(config);
    } catch (error: any) {
      // Don't retry offline errors
      if (error.message === 'OFFLINE_QUEUED') {
        throw error;
      }

      // Retry on network errors or 5xx
      if (
        retryCount < (this.config.retryAttempts || 3) &&
        (!error.response || error.response.status >= 500)
      ) {
        const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return this.request(config, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * GET request helper
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request helper
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request helper
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * PATCH request helper
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  /**
   * DELETE request helper
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

/**
 * Mission Control API endpoints
 */
export class MissionControlAPI {
  private client: APIClient;

  constructor(apiClient: APIClient) {
    this.client = apiClient;
  }

  // ===== STATUS & DASHBOARD =====

  /**
   * GET /api/status - Get dashboard status data
   * Returns: current system status, queue info, team activity
   */
  async getStatus() {
    return this.client.get<any>('/api/status');
  }

  // ===== TEAM =====

  /**
   * GET /api/team - Get team members
   * Returns: array of agent profiles
   */
  async getTeam(params?: PaginationParams) {
    return this.client.get<any>('/api/team', { params });
  }

  /**
   * GET /api/team/:id - Get team member details
   */
  async getTeamMember(id: string) {
    return this.client.get<any>(`/api/team/${id}`);
  }

  // ===== GAP ANALYSIS =====

  /**
   * GET /api/gap-analysis - Get performance/gap analysis data
   * Returns: gaps, metrics, recommendations
   */
  async getGapAnalysis(params?: { timeframe?: string; agent?: string }) {
    return this.client.get<any>('/api/gap-analysis', { params });
  }

  // ===== MEMORY & DAILY NOTES =====

  /**
   * GET /api/memories/load-daily - Load daily memory notes
   * Returns: array of memory entries for today
   */
  async loadDailyMemories(params?: { date?: string }) {
    return this.client.get<any>('/api/memories/load-daily', { params });
  }

  /**
   * GET /api/memories - List all memories with pagination
   */
  async getMemories(params?: PaginationParams) {
    return this.client.get<any>('/api/memories', { params });
  }

  /**
   * POST /api/memories - Create a memory note
   */
  async createMemory(data: { title: string; content: string; tags?: string[] }) {
    return this.client.post<any>('/api/memories', data);
  }

  /**
   * PUT /api/memories/:id - Update a memory note
   */
  async updateMemory(id: string, data: Partial<any>) {
    return this.client.put<any>(`/api/memories/${id}`, data);
  }

  // ===== TASKS =====

  /**
   * GET /api/tasks - List tasks with pagination and filters
   */
  async getTasks(params?: PaginationParams & { status?: string; assignee?: string }) {
    return this.client.get<any>('/api/tasks', { params });
  }

  /**
   * GET /api/tasks/:id - Get task details
   */
  async getTask(id: string) {
    return this.client.get<any>(`/api/tasks/${id}`);
  }

  /**
   * POST /api/tasks - Create a new task
   */
  async createTask(data: {
    title: string;
    description?: string;
    assignee?: string;
    priority?: string;
    tags?: string[];
  }) {
    return this.client.post<any>('/api/tasks', data);
  }

  /**
   * PUT /api/tasks/:id - Update task
   */
  async updateTask(id: string, data: Partial<any>) {
    return this.client.put<any>(`/api/tasks/${id}`, data);
  }

  /**
   * PUT /api/tasks/:id/status - Update task status
   */
  async updateTaskStatus(id: string, status: string) {
    return this.client.put<any>(`/api/tasks/${id}/status`, { status });
  }

  /**
   * POST /api/tasks/:id/approve - Approve task
   */
  async approveTask(id: string, data?: { feedback?: string }) {
    return this.client.post<any>(`/api/tasks/${id}/approve`, data || {});
  }

  /**
   * POST /api/tasks/:id/reject - Reject task
   */
  async rejectTask(id: string, data?: { reason?: string }) {
    return this.client.post<any>(`/api/tasks/${id}/reject`, data || {});
  }

  /**
   * DELETE /api/tasks/:id - Delete task
   */
  async deleteTask(id: string) {
    return this.client.delete<any>(`/api/tasks/${id}`);
  }

  // ===== DOCUMENTATION =====

  /**
   * GET /api/docs/list - Get list of available documents
   */
  async getDocsList(params?: PaginationParams) {
    return this.client.get<any>('/api/docs/list', { params });
  }

  /**
   * GET /api/docs/:id - Get document content
   */
  async getDoc(id: string) {
    return this.client.get<any>(`/api/docs/${id}`);
  }

  // ===== AUTHENTICATION =====

  /**
   * POST /api/auth/login - User login
   */
  async login(credentials: { email: string; password: string }) {
    return this.client.post<any>('/api/auth/login', credentials);
  }

  /**
   * POST /api/auth/logout - User logout
   */
  async logout() {
    return this.client.post<any>('/api/auth/logout');
  }

  /**
   * POST /api/auth/refresh - Refresh JWT token
   */
  async refreshToken(refreshToken: string) {
    return this.client.post<any>('/api/auth/refresh', { refreshToken });
  }

  // ===== SETTINGS =====

  /**
   * PUT /api/settings/tunnel - Update tunnel URL configuration
   */
  async updateTunnelConfig(tunnelURL: string) {
    return this.client.put<any>('/api/settings/tunnel', { tunnelURL });
  }

  /**
   * GET /api/settings/tunnel - Get current tunnel configuration
   */
  async getTunnelConfig() {
    return this.client.get<any>('/api/settings/tunnel');
  }
}

// Create singleton instances
const apiClient = new APIClient(DEFAULT_CONFIG);
const missionControlAPI = new MissionControlAPI(apiClient);

export { APIClient, MissionControlAPI, apiClient, missionControlAPI };
export default apiClient;
