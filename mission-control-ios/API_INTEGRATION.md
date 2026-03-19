# API Integration Guide for Mission Control iOS

## Overview

The Mission Control iOS app integrates with the Mission Control backend API with features for offline-first synchronization, JWT token management, and local tunnel support.

## Quick Start

### 1. Initialize Services

```typescript
import { tokenManager } from './src/services/tokenManager';
import { syncQueue } from './src/services/syncQueue';
import { database } from './src/services/database';
import { tunnelService } from './src/services/tunnelService';
import { missionControlAPI } from './src/api/apiClient';

// In your app startup (App.js)
export default function App() {
  useEffect(() => {
    // Initialize all services
    tokenManager.init();
    database.init();
    syncQueue.init();
    tunnelService.init();
  }, []);
}
```

### 2. Login and Store Tokens

```typescript
// Login
const response = await missionControlAPI.login({
  email: 'user@example.com',
  password: 'password',
});

// Tokens are automatically stored securely
const { accessToken, refreshToken, expiresIn } = response.data;

// Token manager handles refresh automatically
```

### 3. Make API Calls

```typescript
// All API calls automatically include auth headers
const status = await missionControlAPI.getStatus();
const team = await missionControlAPI.getTeam();
const tasks = await missionControlAPI.getTasks();

// Offline requests are queued automatically
const newTask = await missionControlAPI.createTask({
  title: 'New Task',
  description: 'Task details',
});
```

## API Endpoints

### Status & Dashboard

#### `GET /api/status`
Get current system status and dashboard data.

```typescript
const response = await missionControlAPI.getStatus();
console.log(response.data);
// { status: 'healthy', queue: { pending: 5 }, ... }
```

### Team

#### `GET /api/team`
Get list of team members.

```typescript
const response = await missionControlAPI.getTeam({
  page: 1,
  limit: 50,
});
console.log(response.data); // Array of team members
```

#### `GET /api/team/:id`
Get specific team member details.

```typescript
const member = await missionControlAPI.getTeamMember('member-id');
console.log(member.data);
// { id, name, role, model, status, ... }
```

### Gap Analysis

#### `GET /api/gap-analysis`
Get performance analysis and gaps.

```typescript
const analysis = await missionControlAPI.getGapAnalysis({
  timeframe: '7d', // Optional: 1d, 7d, 30d
  agent: 'agent-id', // Optional: specific agent
});
console.log(analysis.data);
// { gaps: [...], metrics: {...}, ... }
```

### Memories & Notes

#### `GET /api/memories/load-daily`
Load today's memory notes.

```typescript
const memories = await missionControlAPI.loadDailyMemories();
console.log(memories.data); // Array of memory entries
```

#### `GET /api/memories`
Get all memories with pagination.

```typescript
const response = await missionControlAPI.getMemories({
  page: 1,
  limit: 20,
});
```

#### `POST /api/memories`
Create a new memory note.

```typescript
const memory = await missionControlAPI.createMemory({
  title: 'Daily Review',
  content: 'Completed task X and Y',
  tags: ['daily', 'review'],
});
```

#### `PUT /api/memories/:id`
Update a memory note.

```typescript
const updated = await missionControlAPI.updateMemory('memory-id', {
  content: 'Updated content',
  tags: ['daily', 'review', 'important'],
});
```

### Tasks

#### `GET /api/tasks`
Get tasks with filters and pagination.

```typescript
const response = await missionControlAPI.getTasks({
  page: 1,
  limit: 20,
  status: 'in-progress', // Optional
  assignee: 'agent-id', // Optional
});
console.log(response.data);
```

#### `GET /api/tasks/:id`
Get task details.

```typescript
const task = await missionControlAPI.getTask('task-id');
```

#### `POST /api/tasks`
Create a new task.

```typescript
const task = await missionControlAPI.createTask({
  title: 'Task Title',
  description: 'Detailed description',
  assignee: 'agent-id', // Optional
  priority: 'high', // low, medium, high
  tags: ['urgent'],
});
```

#### `PUT /api/tasks/:id`
Update task details.

```typescript
const updated = await missionControlAPI.updateTask('task-id', {
  title: 'Updated Title',
  priority: 'medium',
});
```

#### `PUT /api/tasks/:id/status`
Update task status.

```typescript
const updated = await missionControlAPI.updateTaskStatus('task-id', 'in-progress');
// Statuses: review, queued, in-progress, complete
```

#### `POST /api/tasks/:id/approve`
Approve a task.

```typescript
const result = await missionControlAPI.approveTask('task-id', {
  feedback: 'Great work!',
});
```

#### `POST /api/tasks/:id/reject`
Reject a task.

```typescript
const result = await missionControlAPI.rejectTask('task-id', {
  reason: 'Needs revision',
});
```

#### `DELETE /api/tasks/:id`
Delete a task.

```typescript
await missionControlAPI.deleteTask('task-id');
```

### Documentation

#### `GET /api/docs/list`
Get list of available documents.

```typescript
const docs = await missionControlAPI.getDocsList({
  page: 1,
  limit: 50,
});
```

#### `GET /api/docs/:id`
Get document content.

```typescript
const doc = await missionControlAPI.getDoc('doc-id');
console.log(doc.data); // { id, title, content, ... }
```

### Authentication

#### `POST /api/auth/login`
User login.

```typescript
const response = await missionControlAPI.login({
  email: 'user@example.com',
  password: 'password',
});
// { accessToken, refreshToken, expiresIn, ... }
```

#### `POST /api/auth/logout`
User logout.

```typescript
await missionControlAPI.logout();
```

#### `POST /api/auth/refresh`
Refresh access token (handled automatically).

```typescript
// This is called automatically by tokenManager
const response = await missionControlAPI.refreshToken(refreshToken);
```

## Features

### 1. Offline-First Synchronization

Write operations (POST, PUT, DELETE) are automatically queued when offline and replayed when connection is restored.

```typescript
// User is offline
const task = await missionControlAPI.createTask({...});
// Action is queued automatically

// When online
// Action is automatically replayed
// syncQueue will emit 'queue-processed' event
```

### 2. Automatic Token Refresh

JWT tokens are automatically refreshed before expiration.

```typescript
// Token manager automatically refreshes
// No manual intervention needed
const validToken = await tokenManager.getValidToken();
```

### 3. Local Database

Offline data is stored locally in AsyncStorage.

```typescript
import { database } from './src/services/database';

// Store task locally
const task = await database.createTask({
  title: 'Offline Task',
  status: 'review',
});

// Retrieve from local DB
const tasks = await database.getTasks();
const specific = await database.getTask(task.id);

// Update locally
await database.updateTask(task.id, { status: 'in-progress' });
```

### 4. Local Tunnel Support

Configure tunnel URLs for local development.

```typescript
import { tunnelService } from './src/services/tunnelService';

// Set tunnel
await tunnelService.setTunnelURL('https://abc123.ngrok.io', 'ngrok');

// Check health
const status = tunnelService.getStatus();

// Listen for changes
tunnelService.onStatusChange(status => {
  console.log('Tunnel status:', status.isConnected);
});
```

## Error Handling

### Network Errors

Network errors are caught and handled gracefully:

```typescript
try {
  const data = await missionControlAPI.getTasks();
} catch (error) {
  console.error('Network error:', error.message);
  // If offline: data queued, error thrown
  // If online: error message shown
}
```

### Authentication Errors

401 (Unauthorized) errors trigger token refresh or logout:

```typescript
// Automatic handling
// 1. Try to refresh token
// 2. If refresh fails, logout user
// 3. Redirect to login screen
```

### Rate Limiting

429 (Too Many Requests) returns retry time:

```typescript
try {
  await apiClient.post('/api/tasks', data);
} catch (error) {
  if (error.message.includes('Rate limited')) {
    // Wait before retrying
    const retryAfter = extractRetryAfter(error);
  }
}
```

## Store Integration

Use Zustand store for state management:

```typescript
import { useStore } from './src/store';

export function MyComponent() {
  const { tasks, isOnline, pendingActions } = useStore();
  
  return (
    <div>
      <p>Tasks: {tasks.length}</p>
      <p>Online: {isOnline ? 'Yes' : 'No'}</p>
      <p>Pending: {pendingActions.length}</p>
    </div>
  );
}
```

## Sync Queue

Monitor and manage offline sync queue:

```typescript
import { syncQueue } from './src/services/syncQueue';

// Get queue status
const status = syncQueue.getStatus();
console.log(status);
// {
//   totalQueued: 3,
//   isProcessing: false,
//   pendingActions: [...]
// }

// Listen for sync events
const unsubscribe = syncQueue.onEvent(event => {
  console.log(event.type); // 'action-queued', 'queue-processed', etc.
});

// Process queue manually (or auto when online)
await syncQueue.processQueue();

// Clear queue
await syncQueue.clear();
```

## Testing

### Unit Tests

```bash
npm test src/__tests__/api.integration.test.ts
```

### Integration Tests

Tests cover:
- Token management
- Offline sync queue
- Local database
- Tunnel configuration
- End-to-end flows

### Network Simulation

Test offline mode:

```typescript
// Simulate going offline
useStore.setState({ isOnline: false });

// Try to make request
await missionControlAPI.createTask({...});
// Action is queued

// Simulate coming back online
useStore.setState({ isOnline: true });

// Queue is processed automatically
```

## Best Practices

### 1. Always Initialize Services

```typescript
useEffect(() => {
  tokenManager.init();
  database.init();
  syncQueue.init();
  tunnelService.init();
}, []);
```

### 2. Handle Offline State

```typescript
const { isOnline } = useStore();

if (!isOnline) {
  // Show offline indicator
  // Queue operations instead of failing
}
```

### 3. Monitor Sync Queue

```typescript
syncQueue.onEvent(event => {
  if (event.type === 'action-queued') {
    showNotification('Action queued, will sync when online');
  }
  if (event.type === 'queue-processed') {
    showNotification('All pending changes synced!');
  }
});
```

### 4. Use Local Database

```typescript
// Always check local DB first
const localTasks = await database.getTasks();
// Then fetch fresh from API
const apiTasks = await missionControlAPI.getTasks();
```

### 5. Configure Tunnel for Development

```typescript
// In development
if (__DEV__) {
  await tunnelService.setTunnelURL(
    'http://localhost:3000',
    'custom'
  );
}
```

## Migration from Old API

If migrating from old API client:

```typescript
// Old
import apiClient from './src/api/apiClient';
const tasks = await apiClient.getTasks();

// New
import { missionControlAPI } from './src/api/apiClient';
const response = await missionControlAPI.getTasks();
const tasks = response.data;
```

Key differences:
- All methods return axios response objects
- Use `response.data` to get actual data
- Error handling is more consistent
- Offline queuing is automatic

## Debugging

### Enable Logging

```typescript
// API client logs
console.log(apiClient.getBaseURL());

// Token manager info
const tokenInfo = await tokenManager.getTokenInfo();
console.log(tokenInfo);

// Database stats
const stats = await database.getStats();
console.log(stats);

// Sync queue status
console.log(syncQueue.getStatus());

// Tunnel status
console.log(tunnelService.getStatus());
```

### Network Inspector

Use Reactotron or Flipper:
```typescript
// Network monitoring
// Check all API calls
// View request/response
// Monitor queue
```

---

**See also:**
- [Tunnel Setup Guide](./TUNNEL_SETUP_GUIDE.md)
- [Integration Tests](./src/__tests__/api.integration.test.ts)
- [Architecture Notes](./README.md)
