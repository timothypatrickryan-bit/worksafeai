# iOS Sync Architecture

## System Design

The Mission Control iOS app implements a comprehensive offline-first architecture with real-time sync capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│                     iOS App (React Native)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐    ┌──────────────────────┐            │
│  │   UI Components │    │   Store (Zustand)    │            │
│  │   (Screens)     │◄───┤   - Auth             │            │
│  └────────┬────────┘    │   - Tasks            │            │
│           │             │   - Offline Queue    │            │
│           │             └──────────────────────┘            │
│           │                                                   │
│  ┌────────▼─────────────────────────────────────────────┐   │
│  │            API Client + Interceptors                 │   │
│  │  - Token refresh                                     │   │
│  │  - Offline detection                                 │   │
│  │  - Error handling                                    │   │
│  └────────┬────────────────────────────────┬────────────┘   │
│           │                                │                 │
│      ┌────▼────────┐              ┌───────▼───────┐         │
│      │  Online?    │              │   Offline?    │         │
│      │   ✓ Continue◄──────────────┤  ✓ Queue      │         │
│      └────┬────────┘              └───────────────┘         │
│           │                                                   │
│  ┌────────▼────────────────────────────────────────────┐   │
│  │         Sync Queue Service                          │   │
│  │  - Persist to AsyncStorage                          │   │
│  │  - Track retry attempts                             │   │
│  │  - Conflict detection                               │   │
│  │  - Event listeners (queued, processing, complete)   │   │
│  └────────┬────────────────────────────────────────────┘   │
│           │                                                   │
│  ┌────────▼────────────────────────────────────────────┐   │
│  │          Local Database (AsyncStorage)              │   │
│  │  - Tasks                                            │   │
│  │  - Memories                                         │   │
│  │  - Team info (cached)                               │   │
│  │  - Offline-first data layer                         │   │
│  └────────┬────────────────────────────────────────────┘   │
│           │                                                   │
│  ┌────────▼────────────────────────────────────────────┐   │
│  │        Network + Tunnel Service                     │   │
│  │  - Monitor online/offline state                     │   │
│  │  - Detect reconnection events                       │   │
│  │  - Manage tunnel URLs for local dev                 │   │
│  │  - Health checks                                    │   │
│  └────────┬────────────────────────────────────────────┘   │
│           │                                                   │
└───────────┼───────────────────────────────────────────────────┘
            │
    ┌───────┴──────────────────────────────────────────┐
    │                                                   │
    ▼                                                   ▼
┌──────────────────────┐                    ┌──────────────────┐
│ Mission Control API  │                    │  Tunnel Service  │
│ (Production)         │                    │  (Local Dev)     │
│ api.mission-        │                    │                  │
│ control.io          │                    │ ngrok/Cloudflare │
└──────────────────────┘                    └──────────────────┘
```

## Core Services

### 1. API Client (`src/api/apiClient.ts`)

**Purpose:** Unified HTTP client for all API communication

**Features:**
- Request/response interceptors
- Automatic token management
- Offline detection
- Retry logic (exponential backoff)
- Tunnel URL support

**Key Methods:**
```typescript
GET    | POST   | PUT    | PATCH  | DELETE
getStatus()      | getTasks()
getTeam()        | createTask()
getMemories()    | updateTask()
etc.
```

### 2. Token Manager (`src/services/tokenManager.ts`)

**Purpose:** Secure JWT token lifecycle management

**Responsibilities:**
- Store tokens in Secure Storage
- Detect token expiration
- Auto-refresh before expiry
- Handle refresh failures (logout)

**Flow:**
```
Login
  ↓
Store (accessToken, refreshToken, expiresAt)
  ↓
Schedule refresh 5min before expiry
  ↓
[Periodic check every 5-10 seconds]
  ↓
If expired: Refresh using refreshToken
  ↓
On 401 response: Trigger refresh + retry
```

### 3. Sync Queue (`src/services/syncQueue.ts`)

**Purpose:** Offline-first operation queue management

**Features:**
- Queue write operations when offline
- Persist queue to AsyncStorage
- Replay on reconnection
- Retry with exponential backoff
- Event notifications

**States:**
```
Offline Action → Queued (pending) → Online Connected → Processing → Success/Error
```

### 4. Database (`src/services/database.ts`)

**Purpose:** Local data persistence and caching

**Collections:**
- Tasks (CRUD operations)
- Memories/Notes (CRUD)
- Team members (cache)
- Generic cache (status, gap analysis, etc.)

**Usage:**
```typescript
await database.createTask({...})
await database.getTasks({status: 'review'})
await database.updateTask(id, updates)
await database.deleteTask(id)
```

### 5. Tunnel Service (`src/services/tunnelService.ts`)

**Purpose:** Local tunnel configuration for development

**Features:**
- Configure ngrok/Cloudflare URLs
- Health check monitoring
- Automatic fallback
- Connection status tracking

**Presets:**
- Local: `http://localhost:3000`
- ngrok: `https://abc123.ngrok.io`
- Cloudflare: `https://mission-control-api.elevationaiwork.com`

### 6. Network Service (`src/services/networkService.ts`)

**Purpose:** Monitor network connectivity

**Features:**
- Detect online/offline state
- Monitor network changes
- Trigger sync on reconnection
- Listen for state changes

## Data Flow Examples

### Scenario 1: Online - Create Task

```
User taps "Create Task"
  ↓
Component calls missionControlAPI.createTask(data)
  ↓
Request interceptor:
  - Get valid token (auto-refresh if needed)
  - Add Authorization header
  - Check if online ✓
  ↓
POST /api/tasks
  ↓
Response interceptor:
  - Parse response
  - Update local DB
  - Emit event
  ↓
Zustand store updated
  ↓
UI reflects change
```

### Scenario 2: Offline - Create Task

```
User taps "Create Task"
  ↓
Component calls missionControlAPI.createTask(data)
  ↓
Request interceptor:
  - Get valid token
  - Check if online ✗
  - Queue action instead!
  ↓
Action queued: {
  method: 'POST',
  url: '/api/tasks',
  data: {...},
  attempt: 0,
  maxAttempts: 5
}
  ↓
Persist to AsyncStorage (queue survives crash!)
  ↓
Reject with "OFFLINE_QUEUED" error
  ↓
Local DB immediately updated (optimistic)
  ↓
UI shows "pending sync"
```

### Scenario 3: Reconnection - Replay Queue

```
Network service detects: isOnline = true
  ↓
Emit 'reconnected' event
  ↓
syncQueue.processQueue() triggered
  ↓
For each queued action:
  - Check dependencies
  - Execute request
  - If fails: retry with backoff
  - If succeeds: remove from queue
  ↓
Emit 'queue-processed' event
  ↓
All data synced to server
  ↓
UI shows "all changes synced" toast
```

### Scenario 4: Token Refresh

```
GET /api/tasks endpoint called
  ↓
Response interceptor gets 401
  ↓
tokenManager.refreshToken() called
  ↓
POST /api/auth/refresh with refreshToken
  ↓
Server returns new accessToken
  ↓
Token manager stores new token
  ↓
Original request retried with new token
  ↓
Success!
```

## Offline-First Algorithm

### Write Operations (POST, PUT, PATCH, DELETE)

```
1. Check isOnline
   if false:
     - Queue action
     - Update local DB optimistically
     - Return error
   else:
     - Execute request
     - Update local DB on response
     - Return success

2. Queued actions:
   - Persisted to AsyncStorage
   - Survive app crashes
   - Replayed on reconnection
   - Include attempt counter
   - Max 5 retries with exponential backoff
```

### Read Operations (GET)

```
1. Check isOnline
   if false:
     - Return cached data from DB
     - Emit "stale data" warning
   else:
     - Fetch from API
     - Cache in local DB
     - Return fresh data

2. On reconnection:
   - Sync all GET endpoints
   - Update local cache
   - Emit "sync complete"
```

## Sync Strategies

### Conflict Resolution

```typescript
// When local changes conflict with server data:

// Strategy 1: Local wins (pessimistic)
conflicts.forEach(item => {
  database.update(item.id, item.local);
});

// Strategy 2: Server wins (optimistic)
conflicts.forEach(item => {
  database.update(item.id, item.remote);
});

// Strategy 3: Merge (intelligent)
conflicts.forEach(item => {
  const merged = mergeStrategies[item.type](
    item.local,
    item.remote
  );
  database.update(item.id, merged);
});
```

### Retry Strategy

```
Attempt 1: Immediate
Attempt 2: Wait 1 second
Attempt 3: Wait 2 seconds
Attempt 4: Wait 4 seconds
Attempt 5: Wait 8 seconds
Max 5 attempts total
```

## State Management (Zustand)

### Core State

```typescript
{
  // Auth
  user: null,
  authToken: null,
  isAuthenticated: false,

  // Data
  tasks: [],
  memories: [],
  team: [],

  // Network
  isOnline: true,
  pendingActions: [],

  // UI
  showBriefingModal: false,
  selectedTabIndex: 0
}
```

### Actions

- `setUser()` / `logout()`
- `setTasks()` / `addTask()` / `updateTask()`
- `setIsOnline()`
- `queueAction()` / `clearPendingActions()`

## Error Handling

### Network Errors

```
Network unavailable
  ↓
Caught in response interceptor
  ↓
If write operation:
  - Queue action
  - Return error
If read operation:
  - Return cached data or error
```

### Auth Errors (401)

```
Unauthorized response
  ↓
Attempt token refresh
  ↓
If refresh succeeds:
  - Retry original request
  - Continue normally
If refresh fails:
  - Clear tokens
  - Navigate to login
```

### Rate Limiting (429)

```
Too many requests
  ↓
Extract Retry-After header
  ↓
If queued operation:
  - Retry after delay
If direct operation:
  - Throw error with retry time
```

## Performance Optimizations

### 1. Token Refresh Scheduling

- Refresh 5 min before expiry
- Prevents 401 errors during use
- Uses setTimeout for precision

### 2. Sync Batching

- Queue multiple operations
- Process in order (respecting dependencies)
- Parallel fetches for read operations

### 3. Local Caching

- All reads check local DB first
- Fresh data fetched asynchronously
- Immediate UI update with cached data

### 4. Lazy Loading

```typescript
// Load only what's needed
const tasks = await getTasks({ page: 1, limit: 20 });
// Pagination prevents huge payloads
```

### 5. Connection Debouncing

- Don't check online status too frequently
- Health checks every 30 seconds
- Debounce sync queue processing

## Testing Strategy

### Unit Tests
- Token manager refresh logic
- Database CRUD operations
- Sync queue retry logic
- Tunnel configuration

### Integration Tests
- Full offline → online flow
- Token refresh during API call
- Sync queue processing
- Conflict resolution

### Network Tests
- Simulate offline mode
- Simulate network drops
- Simulate slow connections
- Simulate 401, 429, 5xx errors

## Monitoring & Debugging

### Logging

```typescript
// Enable debug logs
console.log('[TokenManager] Token refresh scheduled');
console.log('[SyncQueue] Action queued');
console.log('[Network] Coming online...');
```

### Status Inspection

```typescript
// Check token status
const tokenInfo = await tokenManager.getTokenInfo();

// Check sync queue
console.log(syncQueue.getStatus());

// Check database
const stats = await database.getStats();

// Check tunnel
console.log(tunnelService.getStatus());

// Check network
console.log(useStore.getState().isOnline);
```

### Event Monitoring

```typescript
// Subscribe to events
syncQueue.onEvent(event => {
  console.log('Sync event:', event.type);
});

tunnelService.onStatusChange(status => {
  console.log('Tunnel status:', status.isConnected);
});
```

## Deployment Checklist

- [ ] All API endpoints tested
- [ ] Token refresh working
- [ ] Offline queue survives crash (AsyncStorage)
- [ ] Sync replays correctly on reconnect
- [ ] Local database initialized
- [ ] Error messages user-friendly
- [ ] Network monitoring active
- [ ] Tunnel service ready for dev
- [ ] Integration tests passing
- [ ] Performance acceptable
- [ ] No memory leaks

## Future Enhancements

### Short Term
- [ ] WebSocket support for real-time updates
- [ ] Conflict resolution UI
- [ ] Sync retry UI
- [ ] Network quality indicator

### Medium Term
- [ ] SQLite for larger datasets
- [ ] Delta sync (send only changes)
- [ ] Compression for large payloads
- [ ] Local search indexing

### Long Term
- [ ] P2P sync between devices
- [ ] Full offline mode (no server)
- [ ] Encryption for sensitive data
- [ ] Background sync scheduling

---

**See also:**
- [API Integration Guide](./API_INTEGRATION.md)
- [Tunnel Setup Guide](./TUNNEL_SETUP_GUIDE.md)
- [Integration Tests](./src/__tests__/api.integration.test.ts)
