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
          // TODO: Implement login API call
          // For now, mock super-user token
          const mockToken = btoa(JSON.stringify({ email, role: 'super-admin' }));
          set({
            token: mockToken,
            user: {
              email,
              name: 'Super Admin',
              role: 'super-admin',
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
