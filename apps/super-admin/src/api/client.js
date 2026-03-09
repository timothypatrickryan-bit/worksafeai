import axios from 'axios';
import useAuthStore from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API] Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API] Response OK: ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;

    // Handle 401 - token expired
    if (status === 401) {
      const authStore = useAuthStore.getState();
      authStore.logout();
      // Dispatch custom event for app-level redirect handling
      // This allows React Router integration without tight coupling
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    // Handle 403 - forbidden
    if (import.meta.env.DEV && status === 403) {
      console.error('[API] Access forbidden:', message);
    }

    if (import.meta.env.DEV) {
      console.error(`[API] Error ${status}: ${message}`);
    }

    // Return a proper Error object so callers can use err.message consistently
    const apiError = new Error(message);
    apiError.status = status;
    apiError.data = error.response?.data;
    return Promise.reject(apiError);
  }
);

export default axiosInstance;
