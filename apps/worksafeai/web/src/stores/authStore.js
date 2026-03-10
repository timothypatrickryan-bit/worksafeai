import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

// Determine API URL at module load time
function getApiUrl() {
  // First, check environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Then check current domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Production: dynamically derive from current domain
    const hostname = window.location.hostname;
    // worksafeai.elevationaiwork.com → worksafeai-api.elevationaiwork.com
    // superadmin.elevationaiwork.com → worksafeai-api.elevationaiwork.com
    let apiHostname = hostname.replace('worksafeai.', 'worksafeai-api.');
    apiHostname = apiHostname.replace('superadmin.', 'worksafeai-api.');
    return `https://${apiHostname}/api`;
  }
  
  // Development fallback
  return 'http://localhost:3000/api';
}

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
        const token = Cookies.get('token');
        
        if (!token) {
          // No cookie token — clear any stale persisted state
          set({ token: null, isAuthenticated: false, user: null });
          return;
        }

        // Cookie exists — check if persisted user state is still valid
        const currentState = get();
        if (currentState.isAuthenticated && currentState.user) {
          // Restore token into state from cookie (token is not persisted to localStorage)
          set({ token });
          return;
        }

        // Fallback: decode JWT to extract user data
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Check token expiry
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            Cookies.remove('token');
            set({ token: null, isAuthenticated: false, user: null });
            return;
          }
          
          set({
            token,
            isAuthenticated: true,
            user: {
              id: payload.id,
              role: payload.role,
              companyId: payload.companyId,
            },
          });
        } catch (error) {
          // Invalid token, clear it
          Cookies.remove('token');
          Cookies.remove('refreshToken');
          set({ token: null, isAuthenticated: false, user: null });
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
