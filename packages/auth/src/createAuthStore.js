/**
 * @elevationai/auth - createAuthStore
 * 
 * Factory function to create a configured Zustand auth store.
 * Extracted from WorkSafeAI + Super Admin auth store patterns.
 * 
 * @example
 * // SaaS app with cookie-based tokens
 * const useAuthStore = createAuthStore({
 *   name: 'worksafeai-auth',
 *   apiUrl: import.meta.env.VITE_API_URL,
 *   tokenStorage: 'cookie',
 * });
 * 
 * // Admin app with localStorage tokens and role gate
 * const useAuthStore = createAuthStore({
 *   name: 'super-admin-auth',
 *   apiUrl: import.meta.env.VITE_API_BASE_URL,
 *   tokenStorage: 'zustand',
 *   roleGate: ['admin', 'owner'],
 * });
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

// Token utilities
function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function isTokenExpired(token, marginMs = 5 * 60 * 1000) {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000 - marginMs;
}

export default function createAuthStore(options = {}) {
  const {
    name = 'auth-store',
    apiUrl = 'http://localhost:3000/api',
    loginPath = '/auth/login',
    registerPath = '/auth/register',
    refreshPath = '/auth/refresh-token',
    tokenStorage = 'zustand',    // 'zustand' | 'cookie'
    roleGate = null,              // e.g., ['admin', 'owner']
    onLogout = () => {},
    cookieOptions = { expires: 1, sameSite: 'Strict' },
    refreshCookieOptions = { expires: 7, sameSite: 'Strict' },
  } = options;

  const isSecure = typeof window !== 'undefined' && window.location?.protocol === 'https:';
  const secureCookieOpts = { ...cookieOptions, ...(isSecure && { secure: true }) };
  const secureRefreshOpts = { ...refreshCookieOptions, ...(isSecure && { secure: true }) };

  // Token getters/setters based on storage strategy
  const tokenOps = {
    cookie: {
      getToken: () => Cookies.get('token'),
      getRefreshToken: () => Cookies.get('refreshToken'),
      setTokens: (access, refresh) => {
        Cookies.set('token', access, secureCookieOpts);
        if (refresh) Cookies.set('refreshToken', refresh, secureRefreshOpts);
      },
      clearTokens: () => {
        Cookies.remove('token');
        Cookies.remove('refreshToken');
      },
    },
    zustand: {
      // Tokens stored in Zustand persist (localStorage)
      getToken: () => null, // Retrieved from state
      getRefreshToken: () => null,
      setTokens: () => {},
      clearTokens: () => {},
    },
  };

  const ops = tokenOps[tokenStorage] || tokenOps.zustand;

  return create(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        error: null,

        get isAuthenticated() {
          const { token } = get();
          const activeToken = token || ops.getToken();
          return !!activeToken && !isTokenExpired(activeToken);
        },

        initializeAuth: () => {
          if (tokenStorage === 'cookie') {
            const token = ops.getToken();
            if (token && !isTokenExpired(token)) {
              const payload = decodeToken(token);
              if (payload) {
                set({
                  token,
                  isAuthenticated: true,
                  user: get().user || {
                    id: payload.id,
                    role: payload.role,
                    companyId: payload.companyId,
                  },
                });
              }
            } else if (token) {
              ops.clearTokens();
              set({ token: null, user: null });
            }
          } else {
            const { token } = get();
            if (token && isTokenExpired(token)) {
              set({ token: null, user: null, error: null });
            }
          }
        },

        login: async (email, password) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${apiUrl}${loginPath}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || `Login failed: ${response.status}`);
            }

            // Role gate check
            if (roleGate && !roleGate.includes(data.user?.role)) {
              throw new Error('Insufficient permissions');
            }

            // Store tokens
            ops.setTokens(data.accessToken, data.refreshToken);

            set({
              user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.fullName,
                role: data.user.role,
                companyId: data.user.companyId,
                ...(data.industry && { industry: data.industry }),
              },
              token: data.accessToken,
              refreshToken: data.refreshToken,
              loading: false,
              error: null,
            });

            return true;
          } catch (error) {
            set({ error: error.message, loading: false, token: null, user: null });
            throw error;
          }
        },

        register: async (fields) => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${apiUrl}${registerPath}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(fields),
            });

            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || `Registration failed: ${response.status}`);
            }

            if (data.accessToken) {
              ops.setTokens(data.accessToken, data.refreshToken);
              set({
                user: {
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.fullName,
                  role: data.user.role,
                  companyId: data.user.companyId,
                },
                token: data.accessToken,
                refreshToken: data.refreshToken,
                loading: false,
              });
            } else {
              set({ loading: false });
            }

            return data;
          } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
          }
        },

        logout: () => {
          ops.clearTokens();
          set({ token: null, refreshToken: null, user: null, error: null });
          onLogout();
        },

        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
      }),
      {
        name,
        partialize: (state) => {
          if (tokenStorage === 'cookie') {
            // Only persist user info, not tokens (cookies handle that)
            return { user: state.user };
          }
          // Persist everything for localStorage strategy
          return { token: state.token, refreshToken: state.refreshToken, user: state.user };
        },
      }
    )
  );
}
