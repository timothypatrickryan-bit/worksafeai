import axios from 'axios';
import { useStore } from '../store';

// Configure API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.missioncontrol.local';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { authToken, isOnline, queueAction } = useStore.getState();
    
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    // Queue action if offline (will retry on reconnect)
    if (!isOnline && config.method !== 'get') {
      queueAction({
        method: config.method,
        url: config.url,
        data: config.data,
        timestamp: new Date().toISOString(),
      });
      
      // Reject the request
      return Promise.reject(new Error('OFFLINE'));
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors and auth
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { logout } = useStore.getState();
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      logout();
      return Promise.reject(new Error('Unauthorized'));
    }
    
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error - check connection'));
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  // Projects
  getProjects: () => apiClient.get('/api/projects'),
  getProjectById: (id) => apiClient.get(`/api/projects/${id}`),
  createProject: (data) => apiClient.post('/api/projects', data),
  updateProject: (id, data) => apiClient.put(`/api/projects/${id}`, data),
  
  // Tasks
  getTasks: (projectId) => apiClient.get('/api/tasks', { params: { projectId } }),
  getTaskById: (id) => apiClient.get(`/api/tasks/${id}`),
  createTask: (data) => apiClient.post('/api/tasks', data),
  updateTask: (id, data) => apiClient.put(`/api/tasks/${id}`, data),
  deleteTask: (id) => apiClient.delete(`/api/tasks/${id}`),
  
  // Briefings
  getBriefings: () => apiClient.get('/api/briefings'),
  approveBriefing: (id, approved) => 
    apiClient.post(`/api/tasks/${id}/approve`, { approved }),
  
  // Messages
  getMessages: () => apiClient.get('/api/messages'),
  getMessagesByProject: (projectId) => 
    apiClient.get('/api/messages', { params: { projectId } }),
  sendMessage: (data) => apiClient.post('/api/messages', data),
  
  // Auth
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),
  refreshToken: () => apiClient.post('/api/auth/refresh'),
};

export default apiClient;
