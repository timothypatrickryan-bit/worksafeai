import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      selectedApp: 'worksafeai', // Default to WorkSafeAI
      apps: [
        {
          id: 'worksafeai',
          name: 'WorkSafeAI',
          baseUrl: 'http://localhost:3000',
          icon: 'Shield',
          description: 'AI-powered workplace safety platform',
        },
        // Add more apps as they're created
        // {
        //   id: 'future-app',
        //   name: 'Future App',
        //   baseUrl: 'http://localhost:3001',
        //   icon: 'Settings',
        //   description: 'Description of future app',
        // }
      ],

      setSelectedApp: (appId) => set({ selectedApp: appId }),

      getSelectedAppConfig: (state) => {
        return state.apps.find(app => app.id === state.selectedApp);
      },

      addApp: (app) => set((state) => ({
        apps: [...state.apps, app],
      })),
    }),
    {
      name: 'super-admin-app-storage',
    }
  )
);

export default useAppStore;
