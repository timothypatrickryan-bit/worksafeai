# iOS API & Sync - Quick Reference Card

## 🚀 5-Minute Setup

### 1. Initialize Services
```typescript
import { tokenManager } from './src/services/tokenManager';
import { database } from './src/services/database';
import { syncQueue } from './src/services/syncQueue';
import { tunnelService } from './src/services/tunnelService';

// In App.tsx useEffect:
tokenManager.init();
database.init();
syncQueue.init();
tunnelService.init();
```

### 2. Login
```typescript
import { missionControlAPI } from './src/api/apiClient';

const { data } = await missionControlAPI.login({
  email: 'user@example.com',
  password: 'password',
});
// Token automatically stored & managed!
```

### 3. Use API (Works Offline!)
```typescript
// GET
const tasks = await missionControlAPI.getTasks();

// POST (auto-queued if offline)
const newTask = await missionControlAPI.createTask({
  title: 'New Task',
  priority: 'high',
});

// PUT
await missionControlAPI.updateTask(taskId, { status: 'done' });
```

---

## 📍 API Endpoint Quick Reference

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | /api/status | getStatus() |
| GET | /api/team | getTeam() |
| GET | /api/team/:id | getTeamMember(id) |
| GET | /api/gap-analysis | getGapAnalysis() |
| GET | /api/memories/load-daily | loadDailyMemories() |
| GET | /api/memories | getMemories() |
| POST | /api/memories | createMemory() |
| PUT | /api/memories/:id | updateMemory() |
| GET | /api/tasks | getTasks() |
| POST | /api/tasks | createTask() |
| PUT | /api/tasks/:id | updateTask() |
| PUT | /api/tasks/:id/status | updateTaskStatus() |
| POST | /api/tasks/:id/approve | approveTask() |
| POST | /api/tasks/:id/reject | rejectTask() |
| GET | /api/docs/list | getDocsList() |
| GET | /api/docs/:id | getDoc() |

---

## 💾 Local Database Quick Reference

```typescript
import { database } from './src/services/database';

// TASKS
await database.createTask({ title: 'Task', status: 'review' })
await database.getTasks({ status: 'in-progress' })
await database.getTask(id)
await database.updateTask(id, { status: 'done' })
await database.deleteTask(id)

// MEMORIES
await database.createMemory({ title: 'Note', content: '...' })
await database.getMemories()
await database.updateMemory(id, { content: '...' })
await database.deleteMemory(id)

// TEAM
await database.setTeam([{ id: '1', name: 'Alice' }])
await database.getTeam()

// CACHE
await database.setCached('status', { healthy: true })
await database.getCached('status')
```

---

## 🔄 Offline Queue Quick Reference

```typescript
import { syncQueue } from './src/services/syncQueue';

// Check status
const { totalQueued, isProcessing } = syncQueue.getStatus();

// Listen for events
syncQueue.onEvent(event => {
  console.log(event.type); // 'action-queued', 'queue-processed', etc.
});

// Manually process queue
await syncQueue.processQueue();

// Clear queue
await syncQueue.clear();
```

---

## 🌐 Tunnel Quick Reference

```typescript
import { tunnelService } from './src/services/tunnelService';

// Configure tunnel
await tunnelService.setTunnelURL('https://abc123.ngrok.io', 'ngrok');

// Check status
const { isConnected, responseTime } = tunnelService.getStatus();

// Health check
const healthy = await tunnelService.checkHealth();

// Disable tunnel (fallback to default)
await tunnelService.disableTunnel();

// Listen for changes
tunnelService.onStatusChange(status => {
  console.log('Connected:', status.isConnected);
});

// Get presets
tunnelService.getPresets(); // Suggestions for tunnel URLs
```

---

## 🔐 Token Management Quick Reference

```typescript
import { tokenManager } from './src/services/tokenManager';

// Get valid token (auto-refreshes if needed)
const token = await tokenManager.getValidToken();

// Check if expired
const isExpired = await tokenManager.isTokenExpired();

// Get token info
const info = await tokenManager.getTokenInfo();

// Clear tokens (logout)
await tokenManager.clearTokens();
```

---

## 📱 Using in Components

### Example: Task List Component

```typescript
import { useEffect, useState } from 'react';
import { missionControlAPI } from './src/api/apiClient';
import { useStore } from './src/store';

export function TasksScreen() {
  const { tasks, isOnline, pendingActions } = useStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const response = await missionControlAPI.getTasks();
      useStore.setState({ tasks: response.data });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      {!isOnline && <Text style={{color: 'red'}}>Offline Mode</Text>}
      {pendingActions.length > 0 && (
        <Text>{pendingActions.length} pending changes</Text>
      )}
      
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={tasks}
          renderItem={({ item }) => <TaskCard task={item} />}
        />
      )}
    </View>
  );
}
```

---

## ⚠️ Common Patterns

### Handle Offline Create
```typescript
try {
  const task = await missionControlAPI.createTask(data);
  showSuccess('Task created!');
} catch (error) {
  if (error.message === 'OFFLINE_QUEUED') {
    showInfo('Task will be created when online');
  } else {
    showError(error.message);
  }
}
```

### Monitor Sync Queue
```typescript
import { syncQueue } from './src/services/syncQueue';

syncQueue.onEvent(event => {
  switch (event.type) {
    case 'action-queued':
      showInfo('Change saved locally, syncing when online...');
      break;
    case 'queue-processed':
      showSuccess('All changes synced!');
      break;
    case 'queue-error':
      showError('Sync failed, will retry...');
      break;
  }
});
```

### Setup Tunnel for Dev
```typescript
if (__DEV__) {
  // Ask user for tunnel URL or use preset
  const tunnelUrl = 'http://localhost:3000'; // Or ngrok URL
  await tunnelService.setTunnelURL(tunnelUrl, 'custom');
}
```

---

## 🐛 Debugging Commands

```typescript
// Check token
const tokenInfo = await tokenManager.getTokenInfo();
console.log('Token:', tokenInfo);

// Check queue
console.log('Queue:', syncQueue.getStatus());

// Check database
const stats = await database.getStats();
console.log('DB Stats:', stats);

// Check tunnel
const tunnelStatus = tunnelService.getStatus();
console.log('Tunnel:', tunnelStatus);

// Check network
const { isOnline } = useStore.getState();
console.log('Online:', isOnline);
```

---

## 📋 Setup Checklist

- [ ] Import services in App.tsx
- [ ] Call init() for each service in useEffect
- [ ] Implement login screen
- [ ] Add API calls to components
- [ ] Test offline behavior
- [ ] Configure tunnel for dev
- [ ] Run integration tests
- [ ] Check TypeScript types
- [ ] Monitor sync queue events
- [ ] Deploy with error tracking

---

## 🔗 Key Files

| File | Purpose |
|------|---------|
| `src/api/apiClient.ts` | API client + endpoints |
| `src/services/tokenManager.ts` | JWT token management |
| `src/services/syncQueue.ts` | Offline queue |
| `src/services/database.ts` | Local storage |
| `src/services/tunnelService.ts` | Tunnel config |
| `src/store/index.js` | State management |
| `API_INTEGRATION.md` | Complete API docs |
| `SYNC_ARCHITECTURE.md` | System design |
| `TUNNEL_SETUP_GUIDE.md` | Tunnel setup |

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| 401 Unauthorized | Token refresh automatic, check tokenManager logs |
| Offline actions lost | Check AsyncStorage persists, use database.* |
| Tunnel slow | Check ngrok free tier, use Cloudflare for prod |
| Task not updating | Check sync queue, look for 'queue-processed' event |
| Memory leak | Call cleanup functions in useEffect return |
| CORS error | Check API CORS headers allow iOS bundle ID |
| Network changes | NetworkService auto-detects, triggers sync |

---

## 📞 Need Help?

1. **API question?** → See `API_INTEGRATION.md`
2. **Offline sync issue?** → See `SYNC_ARCHITECTURE.md`
3. **Tunnel problem?** → See `TUNNEL_SETUP_GUIDE.md`
4. **Code example?** → See `src/__tests__/api.integration.test.ts`

---

**Everything is typed with TypeScript. Hover in IDE for docs!** 🎉

**Status:** ✅ Ready to use. Happy coding!
