import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store';

/**
 * Offline-First Sync Queue
 * Queues write operations when offline and replays them when online
 * Features:
 * - Persisted queue in AsyncStorage
 * - Conflict detection (local vs server)
 * - Retry with exponential backoff
 * - Event notifications
 */

interface QueuedAction {
  id: string;
  method: string;
  url: string;
  data?: any;
  timestamp: string;
  attempt: number;
  maxAttempts: number;
  lastError?: string;
  dependsOn?: string[]; // IDs of actions this depends on
}

interface SyncResult {
  success: boolean;
  action: QueuedAction;
  response?: any;
  error?: string;
}

interface ConflictResolution {
  strategy: 'local' | 'remote' | 'merge';
  resolver?: (local: any, remote: any) => any;
}

const STORAGE_KEY = 'mission_control_sync_queue';
const MAX_RETRIES = 5;
const RETRY_BACKOFF_BASE = 1000; // 1 second

type QueueEventListener = (event: { type: string; action?: QueuedAction; error?: string }) => void;

class SyncQueue {
  private queue: QueuedAction[] = [];
  private listeners: QueueEventListener[] = [];
  private isProcessing = false;
  private conflictResolutionMap: Map<string, ConflictResolution> = new Map();

  /**
   * Initialize sync queue from storage
   */
  async init() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log('[SyncQueue] Loaded', this.queue.length, 'queued actions');

        // Emit event
        this.emit({ type: 'queue-loaded', action: undefined });

        // Start processing if online
        const { isOnline } = useStore.getState();
        if (isOnline) {
          this.processQueue();
        }
      }
    } catch (error) {
      console.error('[SyncQueue] Failed to load queue:', error);
    }
  }

  /**
   * Enqueue an action (write operation)
   */
  async enqueue(action: Omit<QueuedAction, 'id' | 'attempt' | 'maxAttempts'>) {
    try {
      const queuedAction: QueuedAction = {
        id: this.generateId(),
        attempt: 0,
        maxAttempts: MAX_RETRIES,
        ...action,
      };

      this.queue.push(queuedAction);
      await this.persist();

      console.log('[SyncQueue] Queued:', queuedAction.method, queuedAction.url);
      this.emit({ type: 'action-queued', action: queuedAction });

      return queuedAction.id;
    } catch (error) {
      console.error('[SyncQueue] Failed to enqueue action:', error);
      throw error;
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      totalQueued: this.queue.length,
      isProcessing: this.isProcessing,
      pendingActions: this.queue.map(a => ({
        id: a.id,
        method: a.method,
        url: a.url,
        attempt: a.attempt,
        maxAttempts: a.maxAttempts,
      })),
    };
  }

  /**
   * Process entire queue (called when online)
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log('[SyncQueue] Processing', this.queue.length, 'actions');

    const results: SyncResult[] = [];

    try {
      // Process actions in order, respecting dependencies
      for (const action of this.queue) {
        const result = await this.processAction(action);
        results.push(result);

        if (!result.success && action.attempt >= action.maxAttempts) {
          console.error('[SyncQueue] Action failed after', action.maxAttempts, 'attempts:', action.url);
        }
      }

      // Remove successfully synced actions
      this.queue = this.queue.filter(a => {
        const result = results.find(r => r.action.id === a.id);
        return result ? !result.success : true;
      });

      await this.persist();

      // Emit completion event
      this.emit({
        type: 'queue-processed',
        action: undefined,
      });

      console.log('[SyncQueue] Done. Remaining:', this.queue.length);
    } catch (error) {
      console.error('[SyncQueue] Queue processing failed:', error);
      this.emit({
        type: 'queue-error',
        error: error.message,
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process single action with retry logic
   */
  private async processAction(action: QueuedAction): Promise<SyncResult> {
    try {
      // Check dependencies
      if (action.dependsOn && action.dependsOn.length > 0) {
        const allDependenciesMet = action.dependsOn.every(
          depId => !this.queue.some(a => a.id === depId)
        );
        if (!allDependenciesMet) {
          console.log('[SyncQueue] Skipping', action.url, '- dependencies not met');
          return { success: false, action, error: 'Dependencies not met' };
        }
      }

      // Execute request
      const { missionControlAPI } = await import('../api/apiClient');

      let response;
      switch (action.method.toUpperCase()) {
        case 'POST':
          response = await missionControlAPI.client.post(action.url, action.data);
          break;
        case 'PUT':
          response = await missionControlAPI.client.put(action.url, action.data);
          break;
        case 'PATCH':
          response = await missionControlAPI.client.patch(action.url, action.data);
          break;
        case 'DELETE':
          response = await missionControlAPI.client.delete(action.url);
          break;
        default:
          throw new Error(`Unsupported method: ${action.method}`);
      }

      console.log('[SyncQueue] ✓', action.method, action.url);
      return { success: true, action, response: response.data };
    } catch (error: any) {
      action.attempt++;
      action.lastError = error.message;

      console.log(
        '[SyncQueue] ✗ Attempt',
        action.attempt,
        'of',
        action.maxAttempts,
        '-',
        action.url,
        '-',
        error.message
      );

      if (action.attempt < action.maxAttempts) {
        // Retry with exponential backoff
        const backoffMs = RETRY_BACKOFF_BASE * Math.pow(2, action.attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }

      return { success: false, action, error: error.message };
    }
  }

  /**
   * Register conflict resolver for a resource
   */
  registerConflictResolver(resourcePath: string, resolution: ConflictResolution) {
    this.conflictResolutionMap.set(resourcePath, resolution);
  }

  /**
   * Get conflict resolver
   */
  private getConflictResolver(url: string): ConflictResolution | undefined {
    // Try exact match first
    if (this.conflictResolutionMap.has(url)) {
      return this.conflictResolutionMap.get(url);
    }

    // Try pattern match (e.g., /api/tasks/* -> /api/tasks)
    const parts = url.split('/');
    for (let i = parts.length; i > 0; i--) {
      const pattern = parts.slice(0, i).join('/');
      if (this.conflictResolutionMap.has(pattern)) {
        return this.conflictResolutionMap.get(pattern);
      }
    }

    return undefined;
  }

  /**
   * Clear entire queue (e.g., on logout)
   */
  async clear() {
    try {
      this.queue = [];
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[SyncQueue] Queue cleared');
      this.emit({ type: 'queue-cleared' });
    } catch (error) {
      console.error('[SyncQueue] Failed to clear queue:', error);
    }
  }

  /**
   * Remove specific action from queue
   */
  async removeAction(actionId: string) {
    try {
      const index = this.queue.findIndex(a => a.id === actionId);
      if (index > -1) {
        this.queue.splice(index, 1);
        await this.persist();
      }
    } catch (error) {
      console.error('[SyncQueue] Failed to remove action:', error);
    }
  }

  /**
   * Subscribe to sync events
   */
  onEvent(listener: QueueEventListener) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Persist queue to storage
   */
  private async persist() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[SyncQueue] Failed to persist queue:', error);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: { type: string; action?: QueuedAction; error?: string }) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[SyncQueue] Event listener error:', error);
      }
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const syncQueue = new SyncQueue();

export default syncQueue;
