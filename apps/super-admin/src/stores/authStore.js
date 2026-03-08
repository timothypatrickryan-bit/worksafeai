import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          // Verify user has admin/owner role for super-admin access
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
          });
          return true;
        } catch (err) {
          set({
            error: err.message || 'Login failed',
            loading: false,
          });
          return false;
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
