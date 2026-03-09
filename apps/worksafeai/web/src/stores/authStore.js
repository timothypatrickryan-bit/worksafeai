import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

// Determine API URL: use env var if set, otherwise infer from current domain
const getApiUrl = () => {
  let apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    // In production, derive API URL from current domain
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      const domain = window.location.hostname;
      const apiDomain = domain.replace('worksafeai.', 'worksafeai-api.').replace('superadmin.', 'worksafeai-api.');
      apiUrl = `${window.location.protocol}//${apiDomain}/api`;
    } else {
      // Development: use localhost
      apiUrl = 'http://localhost:3000/api';
    }
  }
  return apiUrl;
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Login
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const apiUrl = getApiUrl();
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `Login failed: ${response.status}`);
          }

          const isSecure = window.location.protocol === 'https:';
          const cookieOpts = { expires: 1, sameSite: 'Strict', ...(isSecure && { secure: true }) };
          const refreshCookieOpts = { expires: 7, sameSite: 'Strict', ...(isSecure && { secure: true }) };
          Cookies.set('token', data.accessToken, cookieOpts);
          Cookies.set('refreshToken', data.refreshToken, refreshCookieOpts);

          set({
            user: {
              ...data.user,
              industry: data.industry,
            },
            token: data.accessToken,
            isAuthenticated: true,
            loading: false,
          });

          return true;
        } catch (error) {
          set({ error: error.message, loading: false });
          return false;
        }
      },

      // Register
      register: async (email, password, fullName, companyName, industry) => {
        set({ loading: true, error: null });
        try {
          const apiUrl = getApiUrl();
          const response = await fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, fullName, companyName, industry }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `Registration failed: ${response.status}`);
          }

          const isSecure = window.location.protocol === 'https:';
          const cookieOpts = { expires: 1, sameSite: 'Strict', ...(isSecure && { secure: true }) };
          const refreshCookieOpts = { expires: 7, sameSite: 'Strict', ...(isSecure && { secure: true }) };
          Cookies.set('token', data.accessToken, cookieOpts);
          Cookies.set('refreshToken', data.refreshToken, refreshCookieOpts);

          set({
            user: {
              ...data.user,
              industry: data.industry, // Include industry for onboarding page
            },
            token: data.accessToken,
            isAuthenticated: true,
            loading: false,
          });

          return true;
        } catch (error) {
          set({ error: error.message, loading: false });
          return false;
        }
      },

      // Logout
      logout: () => {
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // Initialize auth from persisted state or cookies
      initializeAuth: () => {
        // First try to get from current state (persist middleware restores this)
        const currentState = get();
        if (currentState.token && currentState.isAuthenticated && currentState.user) {
          // Already restored from localStorage by persist middleware
          return;
        }

        // Fallback: check cookies
        const token = Cookies.get('token');
        if (token) {
          try {
            // Decode JWT to extract user data (without verification, just to get payload)
            const payload = JSON.parse(atob(token.split('.')[1]));
            set({
              token,
              isAuthenticated: true,
              user: {
                id: payload.id,
                email: payload.email,
                role: payload.role,
                companyId: payload.companyId,
              },
            });
          } catch (error) {
            // Invalid token, clear it
            Cookies.remove('token');
            set({ token: null, isAuthenticated: false, user: null });
          }
        }
      },
      
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'auth-store',
      // NOTE: Token is NOT persisted to localStorage — it lives only in cookies
      // (httpOnly when possible). Only non-sensitive UI state is persisted.
      partialize: (state) => ({
        user: state.user ? {
          ...state.user,
          industry: state.user.industry,
        } : null,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
