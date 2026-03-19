import create from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist } from 'zustand/middleware';

// Combined store for all app state with AsyncStorage persistence
export const useStore = create(
  persist(
    (set, get) => ({
      // User State
      user: null,
      authToken: null,
      isAuthenticated: false,
      
      // Projects State
      projects: [],
      projectsLoading: false,
      projectsError: null,
      activeProject: null,
      
      // Tasks State
      tasks: [],
      tasksLoading: false,
      tasksError: null,
      
      // Briefings State
      briefings: [],
      briefingsLoading: false,
      briefingsError: null,
      
      // Messages/Inbox State
      messages: [],
      messagesLoading: false,
      unreadCount: 0,
      
      // Network State
      isOnline: true,
      pendingActions: [], // Queue for offline-first
      
      // UI State
      showBriefingModal: false,
      showTaskCreationSheet: false,
      selectedTabIndex: 0,
      
      // User Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthToken: (token) => set({ authToken: token }),
      logout: () => set({ 
        user: null, 
        authToken: null, 
        isAuthenticated: false,
        projects: [],
        tasks: [],
        briefings: [],
        messages: []
      }),
      
      // Project Actions
      setProjects: (projects) => set({ projects, projectsLoading: false }),
      setProjectsLoading: (loading) => set({ projectsLoading: loading }),
      setProjectsError: (error) => set({ projectsError: error }),
      setActiveProject: (project) => set({ activeProject: project }),
      
      // Task Actions
      setTasks: (tasks) => set({ tasks, tasksLoading: false }),
      setTasksLoading: (loading) => set({ tasksLoading: loading }),
      setTasksError: (error) => set({ tasksError: error }),
      addTask: (task) => set((state) => ({ 
        tasks: [task, ...state.tasks] 
      })),
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      })),
      
      // Briefing Actions
      setBriefings: (briefings) => set({ briefings, briefingsLoading: false }),
      setBriefingsLoading: (loading) => set({ briefingsLoading: loading }),
      setBriefingsError: (error) => set({ briefingsError: error }),
      approveBriefing: (briefingId, approved) => set((state) => ({
        briefings: state.briefings.map(b => 
          b.id === briefingId ? { ...b, approved, approvedAt: new Date().toISOString() } : b
        )
      })),
      
      // Message Actions
      setMessages: (messages) => set({ messages, messagesLoading: false }),
      setMessagesLoading: (loading) => set({ messagesLoading: loading }),
      setUnreadCount: (count) => set({ unreadCount: count }),
      addMessage: (message) => set((state) => ({
        messages: [message, ...state.messages],
        unreadCount: state.unreadCount + 1
      })),
      
      // Network Actions
      setIsOnline: (online) => set({ isOnline: online }),
      queueAction: (action) => set((state) => ({
        pendingActions: [...state.pendingActions, action]
      })),
      clearPendingActions: () => set({ pendingActions: [] }),
      
      // UI Actions
      toggleBriefingModal: (show) => set({ showBriefingModal: show ?? ((state) => !state.showBriefingModal) }),
      toggleTaskCreationSheet: (show) => set({ showTaskCreationSheet: show ?? ((state) => !state.showTaskCreationSheet) }),
      setSelectedTab: (index) => set({ selectedTabIndex: index }),
      
      // Sync action (called on reconnect)
      syncData: async () => {
        const state = get();
        if (state.pendingActions.length === 0) return;
        
        // This will be called by the sync service
        // Pending actions will be replayed by the API client
        console.log(`[Sync] ${state.pendingActions.length} pending actions to replay`);
      },
    }),
    {
      name: 'mission-control-store',
      storage: AsyncStorage,
      partialize: (state) => ({
        // Persist only essential user and auth data
        user: state.user,
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
        projects: state.projects,
        tasks: state.tasks,
        briefings: state.briefings,
        messages: state.messages,
        pendingActions: state.pendingActions,
      }),
    }
  )
);

export default useStore;
