import axios from 'axios';
import Cookies from 'js-cookie';

// Determine API URL: use env var if set, otherwise infer from current domain
let API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  // In production, derive API URL from current domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Production: worksafeai.elevationaiwork.com → worksafeai-api.elevationaiwork.com
    // Also handles: superadmin.elevationaiwork.com → worksafeai-api.elevationaiwork.com
    const domain = window.location.hostname;
    let apiDomain = domain;
    if (domain.startsWith('worksafeai.')) {
      apiDomain = domain.replace('worksafeai.', 'worksafeai-api.');
    } else if (domain.startsWith('superadmin.')) {
      apiDomain = domain.replace('superadmin.', 'worksafeai-api.');
    }
    API_BASE_URL = `${window.location.protocol}//${apiDomain}/api`;
  } else {
    // Development: use localhost
    API_BASE_URL = 'http://localhost:3000/api';
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens (with retry guard to prevent infinite loops)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const response = await apiClient.post('/auth/refresh-token', { refreshToken });
          const isSecure = window.location.protocol === 'https:';
          const cookieOpts = { expires: 1, sameSite: 'Strict', ...(isSecure && { secure: true }) };
          Cookies.set('token', response.data.accessToken, cookieOpts);
          if (response.data.refreshToken) {
            const refreshCookieOpts = { expires: 7, sameSite: 'Strict', ...(isSecure && { secure: true }) };
            Cookies.set('refreshToken', response.data.refreshToken, refreshCookieOpts);
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return apiClient(originalRequest);
        } catch (err) {
          // Refresh failed, clear cookies and redirect to login
          Cookies.remove('token');
          Cookies.remove('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
