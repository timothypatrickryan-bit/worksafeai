import NetInfo from '@react-native-community/netinfo';
import { useStore } from '../store';
import { api } from '../api/apiClient';

export class NetworkService {
  constructor() {
    this.unsubscribe = null;
    this.isSyncing = false;
  }

  // Initialize network monitoring
  init() {
    this.unsubscribe = NetInfo.addEventListener((state) => {
      const { setIsOnline, isOnline } = useStore.getState();
      const wasOffline = !isOnline;
      const isCurrentlyOnline = state.isConnected && state.isInternetReachable;

      console.log(`[Network] ${isCurrentlyOnline ? 'Online' : 'Offline'}`);
      setIsOnline(isCurrentlyOnline);

      // If coming back online, trigger sync
      if (wasOffline && isCurrentlyOnline) {
        this.syncPendingActions();
      }
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      const { setIsOnline } = useStore.getState();
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
  }

  // Cleanup
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  // Replay pending actions when reconnecting
  async syncPendingActions() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const { pendingActions, clearPendingActions, syncData } = useStore.getState();
    
    if (pendingActions.length === 0) {
      this.isSyncing = false;
      return;
    }

    console.log(`[Sync] Processing ${pendingActions.length} pending actions`);

    try {
      for (const action of pendingActions) {
        try {
          const { method, url, data } = action;
          
          switch (method.toUpperCase()) {
            case 'POST':
              await api.apiClient.post(url, data);
              break;
            case 'PUT':
              await api.apiClient.put(url, data);
              break;
            case 'DELETE':
              await api.apiClient.delete(url);
              break;
            default:
              break;
          }
          
          console.log(`[Sync] ✓ ${method.toUpperCase()} ${url}`);
        } catch (err) {
          console.log(`[Sync] ✗ ${action.method.toUpperCase()} ${action.url}: ${err.message}`);
          // Keep in queue to retry next time
          throw err;
        }
      }

      // All actions synced successfully
      clearPendingActions();
      await syncData();
      console.log('[Sync] Complete');
    } catch (err) {
      console.log(`[Sync] Failed: ${err.message}`);
      // Will retry on next reconnect
    }

    this.isSyncing = false;
  }
}

export const networkService = new NetworkService();
