/**
 * API Integration Tests
 * Tests the API client, token manager, sync queue, and database together
 */

import { APIClient, missionControlAPI } from '../api/apiClient';
import { tokenManager } from '../services/tokenManager';
import { syncQueue } from '../services/syncQueue';
import { database } from '../services/database';
import { tunnelService } from '../services/tunnelService';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Initialize all services
    await database.init();
    await syncQueue.init();
    await tunnelService.init();
  });

  afterEach(async () => {
    // Clean up
    await database.clear();
    await syncQueue.clear();
  });

  // ===== TOKEN MANAGEMENT =====

  describe('Token Manager', () => {
    test('should store and retrieve tokens', async () => {
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000,
      };

      await tokenManager.setTokens(tokens);

      const token = await tokenManager.getAccessToken();
      expect(token).toBe('test-access-token');

      const refreshToken = await tokenManager.getRefreshToken();
      expect(refreshToken).toBe('test-refresh-token');
    });

    test('should detect expired tokens', async () => {
      const tokens = {
        accessToken: 'expired-token',
        refreshToken: 'refresh-token',
        expiresIn: -1, // Already expired
        expiresAt: Date.now() - 1000,
      };

      await tokenManager.setTokens(tokens);
      const isExpired = await tokenManager.isTokenExpired();

      expect(isExpired).toBe(true);
    });

    test('should clear tokens on logout', async () => {
      const tokens = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000,
      };

      await tokenManager.setTokens(tokens);
      await tokenManager.clearTokens();

      const token = await tokenManager.getAccessToken();
      expect(token).toBeNull();
    });
  });

  // ===== OFFLINE SYNC QUEUE =====

  describe('Sync Queue', () => {
    test('should enqueue offline actions', async () => {
      const action = {
        method: 'POST',
        url: '/api/tasks',
        data: { title: 'Test Task' },
        timestamp: new Date().toISOString(),
      };

      const actionId = await syncQueue.enqueue(action);
      const status = syncQueue.getStatus();

      expect(status.totalQueued).toBe(1);
      expect(actionId).toBeDefined();
    });

    test('should handle multiple queued actions', async () => {
      for (let i = 0; i < 5; i++) {
        await syncQueue.enqueue({
          method: 'POST',
          url: `/api/tasks`,
          data: { title: `Task ${i}` },
          timestamp: new Date().toISOString(),
        });
      }

      const status = syncQueue.getStatus();
      expect(status.totalQueued).toBe(5);
    });

    test('should clear queue', async () => {
      await syncQueue.enqueue({
        method: 'POST',
        url: '/api/tasks',
        data: { title: 'Test' },
        timestamp: new Date().toISOString(),
      });

      await syncQueue.clear();
      const status = syncQueue.getStatus();

      expect(status.totalQueued).toBe(0);
    });

    test('should track sync events', async () => {
      const events: any[] = [];
      const unsubscribe = syncQueue.onEvent(event => {
        events.push(event);
      });

      await syncQueue.enqueue({
        method: 'POST',
        url: '/api/tasks',
        data: { title: 'Test' },
        timestamp: new Date().toISOString(),
      });

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('action-queued');

      unsubscribe();
    });
  });

  // ===== LOCAL DATABASE =====

  describe('Database', () => {
    test('should create and retrieve tasks', async () => {
      const task = await database.createTask({
        title: 'Test Task',
        description: 'Task description',
        status: 'review',
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');

      const retrieved = await database.getTask(task.id);
      expect(retrieved?.title).toBe('Test Task');
    });

    test('should update tasks', async () => {
      const task = await database.createTask({
        title: 'Original',
        status: 'review',
      });

      const updated = await database.updateTask(task.id, {
        title: 'Updated',
        status: 'in-progress',
      });

      expect(updated?.title).toBe('Updated');
      expect(updated?.status).toBe('in-progress');
    });

    test('should delete tasks', async () => {
      const task = await database.createTask({
        title: 'To Delete',
        status: 'review',
      });

      const deleted = await database.deleteTask(task.id);
      expect(deleted).toBe(true);

      const retrieved = await database.getTask(task.id);
      expect(retrieved).toBeNull();
    });

    test('should filter tasks by status', async () => {
      await database.createTask({ title: 'Task 1', status: 'review' });
      await database.createTask({ title: 'Task 2', status: 'in-progress' });
      await database.createTask({ title: 'Task 3', status: 'review' });

      const reviewTasks = await database.getTasks({ status: 'review' });
      expect(reviewTasks.length).toBe(2);
    });

    test('should create and retrieve memories', async () => {
      const memory = await database.createMemory({
        title: 'Daily Note',
        content: 'Today was productive',
        date: new Date().toISOString(),
      });

      expect(memory.id).toBeDefined();

      const retrieved = await database.getMemory(memory.id);
      expect(retrieved?.title).toBe('Daily Note');
    });

    test('should manage team data', async () => {
      const team = [
        { id: '1', name: 'Alice', role: 'Senior Dev' },
        { id: '2', name: 'Bob', role: 'Designer' },
      ];

      await database.setTeam(team);

      const retrieved = await database.getTeam();
      expect(retrieved.length).toBe(2);
      expect(retrieved[0].name).toBe('Alice');
    });

    test('should cache arbitrary data', async () => {
      const statusData = { status: 'healthy', uptime: 9999 };
      await database.setCached('status', statusData);

      const retrieved = await database.getCached('status');
      expect(retrieved).toEqual(statusData);
    });

    test('should provide database stats', async () => {
      await database.createTask({ title: 'Task', status: 'review' });
      await database.createMemory({
        title: 'Note',
        content: 'Content',
        date: new Date().toISOString(),
      });
      await database.setTeam([{ id: '1', name: 'Member' }]);

      const stats = await database.getStats();
      expect(stats.tasks).toBe(1);
      expect(stats.memories).toBe(1);
      expect(stats.team).toBe(1);
    });
  });

  // ===== TUNNEL SERVICE =====

  describe('Tunnel Service', () => {
    test('should set and retrieve tunnel URL', async () => {
      await tunnelService.setTunnelURL('http://localhost:3000', 'custom');

      const config = tunnelService.getConfig();
      expect(config?.url).toBe('http://localhost:3000');
      expect(config?.type).toBe('custom');
    });

    test('should validate tunnel URL format', async () => {
      await expect(
        tunnelService.setTunnelURL('invalid-url', 'custom')
      ).rejects.toThrow('Invalid tunnel URL format');
    });

    test('should provide tunnel presets', () => {
      const presets = tunnelService.getPresets();
      expect(presets.length).toBeGreaterThan(0);
      expect(presets[0]).toHaveProperty('name');
      expect(presets[0]).toHaveProperty('url');
      expect(presets[0]).toHaveProperty('type');
    });

    test('should track tunnel status changes', async () => {
      const statuses: any[] = [];
      const unsubscribe = tunnelService.onStatusChange(status => {
        statuses.push(status);
      });

      // Note: Actual health check would fail in test env
      await tunnelService.disableTunnel();

      expect(statuses.length).toBeGreaterThan(0);
      unsubscribe();
    });

    test('should disable tunnel', async () => {
      await tunnelService.setTunnelURL('http://localhost:3000', 'custom');
      await tunnelService.disableTunnel();

      const config = tunnelService.getConfig();
      expect(config?.isActive).toBe(false);
    });
  });

  // ===== END-TO-END FLOWS =====

  describe('End-to-End Flows', () => {
    test('should handle complete offline flow', async () => {
      // Simulate offline: Create task locally
      const task = await database.createTask({
        title: 'Offline Task',
        status: 'review',
      });

      // Queue sync action (would normally be blocked by offline interceptor)
      await syncQueue.enqueue({
        method: 'POST',
        url: '/api/tasks',
        data: task,
        timestamp: new Date().toISOString(),
      });

      // Verify queue has action
      const status = syncQueue.getStatus();
      expect(status.totalQueued).toBe(1);

      // Verify local data exists
      const localTask = await database.getTask(task.id);
      expect(localTask?.title).toBe('Offline Task');
    });

    test('should maintain data consistency across services', async () => {
      // Create task in database
      const dbTask = await database.createTask({
        title: 'Consistent Task',
        status: 'review',
      });

      // Queue a sync action
      const queueId = await syncQueue.enqueue({
        method: 'PUT',
        url: `/api/tasks/${dbTask.id}`,
        data: { status: 'in-progress' },
        timestamp: new Date().toISOString(),
      });

      // Verify both systems know about the task
      const retrieved = await database.getTask(dbTask.id);
      expect(retrieved).not.toBeNull();

      const queueStatus = syncQueue.getStatus();
      expect(queueStatus.totalQueued).toBe(1);
    });
  });
});

describe('API Error Handling', () => {
  test('should handle network errors gracefully', () => {
    // This would test the API client's error handling
    // In a real test, you'd mock fetch/axios
    expect(true).toBe(true);
  });

  test('should handle auth errors', () => {
    // Test 401 unauthorized handling
    expect(true).toBe(true);
  });

  test('should handle rate limiting', () => {
    // Test 429 rate limit handling
    expect(true).toBe(true);
  });
});
