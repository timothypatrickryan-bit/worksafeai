import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Token expiration safety margin (5 minutes before actual expiry)
const TOKEN_EXPIRY_MARGIN_MS = 5 * 60 * 1000;

// Determine API URL: use env var if set, otherwise infer from current domain
function getApiUrl() {
  // First, check environment variables
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Then check current domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Production: dynamically derive from current domain
    // superadmin.elevationaiwork.com → https://worksafeai-api.elevationaiwork.com
    const hostname = window.location.hostname;
    const domain = hostname.split('.').slice(1).join('.');
    return `https://worksafeai-api.${domain}`;
  }
  
  // Development fallback
  return 'http://localhost:3000';
}

/**
 * Decode JWT payload without external dependencies.
 * Returns null if the token is malformed or expired.
 */
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload?.exp) return true; // No exp claim = treat as expired
  const expiresAt = payload.exp * 1000; // JWT exp is seconds
  return Date.now() >= expiresAt - TOKEN_EXPIRY_MARGIN_MS;
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      /** Derived getter — checks both presence and expiration */
      get isAuthenticated() {
        const { token } = get();
        return !!token && !isTokenExpired(token);
      },

      /**
       * Re-hydrate auth from persisted storage.
       * Clears stale/expired tokens so the user is sent to login.
       */
      initializeAuth: () => {
        const { token } = get();
        if (token && isTokenExpired(token)) {
          set({ token: null, user: null, error: null });
        }
      },

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const apiUrl = getApiUrl();
          const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          // Client-side role gate (server MUST also enforce this)
          if (!['owner', 'admin'].includes(data.user?.role)) {
            throw new Error('Insufficient permissions. Super-admin access required.');
          }

          set({
            token: data.accessToken,
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.fullName,
              role: data.user.role,
              companyId: data.user.companyId,
            },
            loading: false,
            error: null,
          });
          return true;
        } catch (err) {
          set({
            error: err.message || 'Login failed',
            loading: false,
            token: null,
            user: null,
          });
          throw err; // Re-throw so callers can handle
        }
      },

      logout: () => set({
        token: null,
        user: null,
        error: null,
      }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'super-admin-auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;
