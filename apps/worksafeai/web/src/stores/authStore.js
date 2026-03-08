import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

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
          const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `Login failed: ${response.status}`);
          }

          Cookies.set('token', data.accessToken, { expires: 1 });
          Cookies.set('refreshToken', data.refreshToken, { expires: 7 });

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
          const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, fullName, companyName, industry }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `Registration failed: ${response.status}`);
          }

          Cookies.set('token', data.accessToken, { expires: 1 });
          Cookies.set('refreshToken', data.refreshToken, { expires: 7 });

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
                fullName: payload.fullName,
                role: payload.role,
                companyId: payload.companyId,
                industry: payload.industry,
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
      partialize: (state) => ({
        user: state.user ? {
          ...state.user,
          industry: state.user.industry,
        } : null,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
