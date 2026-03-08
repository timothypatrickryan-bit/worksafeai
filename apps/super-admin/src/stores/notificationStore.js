import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, message, type, duration },
      ],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  // Convenience methods
  success: (message, duration) =>
    set((state) => {
      const id = Date.now();
      state.addNotification(message, 'success', duration);
      return { notifications: state.notifications };
    }),

  error: (message, duration) =>
    set((state) => {
      const id = Date.now();
      state.addNotification(message, 'error', duration);
      return { notifications: state.notifications };
    }),

  warning: (message, duration) =>
    set((state) => {
      const id = Date.now();
      state.addNotification(message, 'warning', duration);
      return { notifications: state.notifications };
    }),

  info: (message, duration) =>
    set((state) => {
      const id = Date.now();
      state.addNotification(message, 'info', duration);
      return { notifications: state.notifications };
    }),
}));

export default useNotificationStore;
