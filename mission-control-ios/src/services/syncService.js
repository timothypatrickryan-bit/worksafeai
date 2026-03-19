import { useStore } from '../store';
import { api } from '../api/apiClient';

export class SyncService {
  constructor() {
    this.syncInterval = null;
    this.isSyncing = false;
  }

  // Start periodic sync (runs every 30 seconds)
  startSync() {
    this.syncInterval = setInterval(() => {
      this.syncAllData();
    }, 30000);
    
    // Do initial sync
    this.syncAllData();
  }

  // Stop sync
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  async syncAllData() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const { isOnline } = useStore.getState();
    if (!isOnline) {
      this.isSyncing = false;
      return;
    }

    console.log('[SyncService] Syncing all data...');

    try {
      // Sync in parallel
      await Promise.all([
        this.syncProjects(),
        this.syncTasks(),
        this.syncBriefings(),
        this.syncMessages(),
      ]);
      
      console.log('[SyncService] Sync complete');
    } catch (err) {
      console.error('[SyncService] Sync failed:', err.message);
    }

    this.isSyncing = false;
  }

  async syncProjects() {
    try {
      const { setProjects, setProjectsLoading, setProjectsError } = useStore.getState();
      setProjectsLoading(true);

      const response = await api.getProjects();
      setProjects(response.data);
      setProjectsError(null);
    } catch (err) {
      useStore.getState().setProjectsError(err.message);
      console.error('[SyncService] Projects sync failed:', err.message);
    }
  }

  async syncTasks() {
    try {
      const { setTasks, setTasksLoading, setTasksError, activeProject } = useStore.getState();
      setTasksLoading(true);

      const projectId = activeProject?.id;
      const response = await api.getTasks(projectId);
      setTasks(response.data);
      setTasksError(null);
    } catch (err) {
      useStore.getState().setTasksError(err.message);
      console.error('[SyncService] Tasks sync failed:', err.message);
    }
  }

  async syncBriefings() {
    try {
      const { setBriefings, setBriefingsLoading, setBriefingsError } = useStore.getState();
      setBriefingsLoading(true);

      const response = await api.getBriefings();
      setBriefings(response.data);
      setBriefingsError(null);
    } catch (err) {
      useStore.getState().setBriefingsError(err.message);
      console.error('[SyncService] Briefings sync failed:', err.message);
    }
  }

  async syncMessages() {
    try {
      const { setMessages, setMessagesLoading, setUnreadCount, activeProject } = useStore.getState();
      setMessagesLoading(true);

      const projectId = activeProject?.id;
      let response;
      if (projectId) {
        response = await api.getMessagesByProject(projectId);
      } else {
        response = await api.getMessages();
      }

      setMessages(response.data);
      const unreadCount = response.data.filter(m => !m.read).length;
      setUnreadCount(unreadCount);
    } catch (err) {
      console.error('[SyncService] Messages sync failed:', err.message);
    }
  }

  async approveBriefing(taskId, approved) {
    try {
      const { approveBriefing } = useStore.getState();
      
      // Optimistic update
      approveBriefing(taskId, approved);
      
      // API call
      await api.approveBriefing(taskId, approved);
    } catch (err) {
      console.error('[SyncService] Approve briefing failed:', err.message);
      // TODO: Revert optimistic update
      throw err;
    }
  }

  async createTask(taskData) {
    try {
      const response = await api.createTask(taskData);
      useStore.getState().addTask(response.data);
      return response.data;
    } catch (err) {
      console.error('[SyncService] Create task failed:', err.message);
      throw err;
    }
  }

  async updateTask(taskId, updates) {
    try {
      const response = await api.updateTask(taskId, updates);
      useStore.getState().updateTask(taskId, response.data);
      return response.data;
    } catch (err) {
      console.error('[SyncService] Update task failed:', err.message);
      throw err;
    }
  }
}

export const syncService = new SyncService();
