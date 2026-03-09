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

  // Convenience methods — use get() to access store methods
  success: (message, duration) => {
    useNotificationStore.getState().addNotification(message, 'success', duration);
  },

  error: (message, duration) => {
    useNotificationStore.getState().addNotification(message, 'error', duration);
  },

  warning: (message, duration) => {
    useNotificationStore.getState().addNotification(message, 'warning', duration);
  },

  info: (message, duration) => {
    useNotificationStore.getState().addNotification(message, 'info', duration);
  },
}));

export default useNotificationStore;
