# LAURA — Mission Control iOS Data Sync & Offline Strategy
## Complete Architecture Design Document

**Created:** 2026-03-18  
**Status:** FINAL DELIVERABLE  
**Version:** 1.0

---

## 🎯 Executive Summary

Mission Control iOS requires a robust offline-first, real-time sync architecture to handle:
- Seamless operation without network connectivity
- Real-time briefing approvals and task updates
- Conflict-free synchronization across devices
- Secure token management and re-authentication
- Zero data loss during network interruptions

**Core Decision:** SQLite for local storage (superior to AsyncStorage for scale, relationships, and querying) + WebSocket for real-time + exponential backoff retry logic + last-write-wins conflict resolution with server timestamp authority.

---

## 1. OFFLINE-FIRST DATA ARCHITECTURE

### 1.1 Data Model — What Syncs to Device

**PRIORITY 1: Always Sync (on app launch)**
```
- All projects (user can filter/search offline)
- All tasks within projects (descriptions, assignments, dates)
- All briefings (full text, approvers, approval status)
- User profile (name, email, role, permissions)
```

**PRIORITY 2: Sync on Network (every 5 minutes if online)**
```
- Briefing approval changes (real-time via WebSocket, fallback to sync)
- Task status changes (real-time via WebSocket, fallback to sync)
- Comments/messages on tasks
- Briefing audience lists (if changed)
```

**PRIORITY 3: Lazy Load (on demand)**
```
- Briefing attachment metadata (full content only when user views briefing)
- Audit logs / history (paginated)
- User search results (external API, cacheable)
```

**DO NOT SYNC TO DEVICE:**
```
- Raw server logs
- Raw analytics events
- Internal admin data
- Another user's private preferences
```

### 1.2 SQLite Schema

```sql
-- Core tables
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at INTEGER,                  -- Unix timestamp (ms)
  updated_at INTEGER,
  server_version INTEGER DEFAULT 0,    -- Server's version counter
  local_version INTEGER DEFAULT 0,     -- Local edit counter
  synced_at INTEGER DEFAULT 0,         -- Last successful sync
  is_deleted BOOLEAN DEFAULT 0         -- Soft delete
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  status TEXT CHECK(status IN ('open','in_progress','completed','blocked')),
  due_date INTEGER,                    -- Unix timestamp (ms)
  priority TEXT CHECK(priority IN ('low','medium','high','critical')),
  created_at INTEGER,
  updated_at INTEGER,
  server_version INTEGER DEFAULT 0,
  local_version INTEGER DEFAULT 0,
  synced_at INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT 0,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);

CREATE TABLE briefings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('draft','pending_approval','approved','rejected')),
  created_at INTEGER,
  updated_at INTEGER,
  server_version INTEGER DEFAULT 0,
  local_version INTEGER DEFAULT 0,
  synced_at INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT 0,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);

CREATE TABLE briefing_approvals (
  id TEXT PRIMARY KEY,
  briefing_id TEXT NOT NULL,
  approver_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending','approved','rejected')),
  comment TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  server_version INTEGER DEFAULT 0,
  local_version INTEGER DEFAULT 0,
  synced_at INTEGER DEFAULT 0,
  FOREIGN KEY(briefing_id) REFERENCES briefings(id)
);

-- Sync state tracking
CREATE TABLE sync_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER
);

-- Action queue for offline operations
CREATE TABLE action_queue (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,           -- 'task', 'briefing', 'approval'
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,                -- 'create', 'update', 'delete'
  payload TEXT NOT NULL,               -- JSON
  created_at INTEGER,
  retry_count INTEGER DEFAULT 0,
  last_retry_at INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending'        -- 'pending', 'synced', 'failed'
);

-- Conflict resolution history
CREATE TABLE conflicts (
  id TEXT PRIMARY KEY,
  entity_type TEXT,
  entity_id TEXT,
  local_data TEXT,                     -- JSON snapshot
  server_data TEXT,                    -- JSON snapshot
  resolution TEXT,                     -- 'server_won', 'local_kept', 'merged'
  created_at INTEGER,
  resolved_at INTEGER
);

-- Local indexes for performance
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_briefings_project ON briefings(project_id);
CREATE INDEX idx_approvals_briefing ON briefing_approvals(briefing_id);
CREATE INDEX idx_queue_status ON action_queue(status);
CREATE INDEX idx_sync_needed ON tasks(synced_at) WHERE synced_at < ?;
```

### 1.3 Sync Frequency Strategy

```
┌─────────────────────────────────────────────────────────┐
│          SYNC TRIGGER MATRIX                           │
├─────────────────────────────────────────────────────────┤
│ Event                    │ Sync?  │ Frequency           │
├──────────────────────────┼────────┼─────────────────────┤
│ App launch               │ ALWAYS │ Immediate           │
│ Network becomes active   │ ALWAYS │ Immediate           │
│ App enters foreground    │ IF <5m │ Every 5 min idle    │
│ App in background        │ NEVER  │ (only if push recv) │
│ Battery low (<20%)       │ REDUCE │ Every 30 min        │
│ Mobile data only         │ LIGHT  │ Every 10 min        │
│ Wi-Fi active             │ NORMAL │ Every 5 min         │
│ User manually refreshes  │ ALWAYS │ Immediate           │
│ Action queued (offline)  │ ONCE   │ On reconnect        │
└─────────────────────────────────────────────────────────┘

Implementation:
- Use BackgroundTasks framework (iOS)
- Request 15-min background processing window
- Execute full sync + action queue retry
- Gracefully degrade if battery critical
```

### 1.4 Conflict Resolution Strategy

**DECISION RULE: Server-authoritative with client-side version tracking**

```
When local version > server version:
  ├─ Client made edits while server was unchanged
  └─ ALLOW: Push to server (last-write-wins with timestamp tiebreaker)

When local version < server version:
  ├─ Server changed while client was offline
  ├─ Check if client has pending action for this entity
  │  ├─ YES: CONFLICT → Log to conflicts table → Notify user
  │  └─ NO: ACCEPT server version (fetch + merge)

When local version == server version but timestamps differ:
  ├─ Concurrent edits detected
  └─ RULE: server_timestamp > local_timestamp wins
           (server time is source of truth)

Client-side detection:
- Track (id, server_version, local_version, last_server_timestamp)
- On sync: If local.version > server.version → send as "update"
- On receive: If server.version > local.version → accept as "fetch"
- Before merge: Always verify server_timestamp >= local_timestamp
```

**Conflict Resolution Decision Tree:**
```
Incoming sync event (entity has both local & server updates)
│
├─ Check: Is entity in action_queue (pending local action)?
│  ├─ YES → CONFLICT
│  │   ├─ Log to conflicts table with both snapshots
│  │   ├─ Strategy: Keep server version (authoritative)
│  │   ├─ Action: Notify user "Your edit was overridden. Server change: [change]"
│  │   └─ Option: Allow user to re-apply their edit
│  │
│  └─ NO → ACCEPT SERVER VERSION
│      ├─ Merge server data into local DB
│      ├─ Update server_version & last_sync_timestamp
│      └─ If critical field changed → Trigger UI refresh
│
└─ After sync: Check conflicts table
   └─ If any → Show notification badge "Sync conflicts (3)"
```

---

## 2. REAL-TIME UPDATE STRATEGY

### 2.1 WebSocket Connection Architecture

```typescript
// Connection State Machine
DISCONNECTED
  ├─ networkAvailable() → CONNECTING
  └─ (wait)

CONNECTING
  ├─ tokenValid() → AUTH
  ├─ error() → RECONNECT_WAIT
  └─ 30s timeout → RECONNECT_WAIT

AUTH
  ├─ authenticated() → CONNECTED
  ├─ tokenExpired() → RE_AUTH (refresh + reconnect)
  └─ error() → RECONNECT_WAIT

CONNECTED
  ├─ receive(message) → HANDLE + UPDATE_DB
  ├─ networkLost() → RECONNECT_WAIT
  ├─ tokenExpired() → RE_AUTH
  └─ idle(300s) → PING (keep-alive)

RECONNECT_WAIT
  ├─ wait(backoff) → CONNECTING
  └─ networkAvailable() → CONNECTING (skip wait)

RE_AUTH
  ├─ refreshToken() → CONNECTING
  └─ refreshFailed() → LOGOUT + SHOW_LOGIN
```

### 2.2 WebSocket Message Protocol

**Message Format:**
```json
{
  "id": "msg-uuid-123",
  "type": "update|notify|ack|ping|pong|error",
  "entity_type": "briefing|task|approval",
  "entity_id": "briefing-456",
  "timestamp": 1705610530123,
  "version": 42,
  "action": "created|updated|deleted",
  "data": { /* entity snapshot */ },
  "conflict": false,
  "source": "web|api|ios|android"
}
```

**Server → Client (Real-Time Events):**
```
Type: update
├─ Task status changed
├─ Task reassigned
├─ Briefing approved/rejected
├─ Briefing audience changed
├─ Comment added
└─ Due date changed

Type: notify
├─ "Briefing X needs your approval"
├─ "Task assigned to you"
├─ "Briefing X was approved by @person"
└─ Trigger: Push notification + badge

Type: error
├─ "Invalid token"
├─ "Entity not found" (deleted by other user)
└─ Trigger: Show alert, possibly refresh

Type: ping
└─ Server keep-alive (respond with pong)
```

**Client → Server (Actions over WebSocket):**
```
Only use for:
- Real-time collaboration signals (optional, not critical)
- Presence (typing, viewing)

DO NOT use for:
- Critical updates (use REST API with retry logic)
- Offline queueing (use action_queue table)
```

### 2.3 Fallback to Polling

**When to enable polling:**
```
1. WebSocket connection fails 3x → Enable polling
2. WebSocket latency > 5s consistently → Enable polling
3. User switches to metered connection → Enable polling
4. Battery saver mode active → Enable polling
```

**Polling Strategy:**
```
GET /api/v1/sync
  ├─ Query params: since={last_sync_timestamp}, entities=["tasks","briefings"]
  ├─ Response: Only entities changed since timestamp
  ├─ Interval: 30 seconds (degraded, not real-time)
  └─ Stop polling: When WebSocket reconnects successfully

Polling frequency varies:
- Normal: Every 30 seconds
- Low battery: Every 60 seconds
- Airplane mode recovery: Every 10 seconds (accelerated)
```

### 2.4 Battery & Bandwidth Optimization

```
AGGRESSIVE OPTIMIZATION PROFILE:

Battery < 20%:
  ├─ Disable WebSocket (use polling only)
  ├─ Polling interval: 60 seconds
  ├─ Disable background sync
  ├─ Reduce animation/transitions
  └─ UI indicator: "Battery saver mode ON"

Mobile data (non-Wi-Fi):
  ├─ WebSocket: Keep (efficient for real-time)
  ├─ Polling: 45 seconds (slower)
  ├─ Compress JSON payloads (gzip)
  └─ Disable video/rich media previews

Wi-Fi + Good Battery:
  ├─ WebSocket: Full speed
  ├─ Polling: 30 seconds (backup)
  ├─ Full media loading
  └─ Background sync enabled

Calculation:
  If (battery_percent < 20 OR low_power_mode) {
    disable WebSocket
    polling_interval = 60
  } else if (connection_type == 'cellular') {
    polling_interval = 45
  } else {
    polling_interval = 30
  }
```

### 2.5 Reconnection Logic (Exponential Backoff)

```
Attempt   Delay      Max Total Time   Jitter
────────────────────────────────────────────
1         1s         1s               ±0-200ms
2         2s         3s               ±0-400ms
3         4s         7s               ±0-800ms
4         8s         15s              ±0-1.6s
5         16s        31s              ±0-3.2s
6         32s        63s              ±0-6.4s
7         64s        127s (2m 7s)     ±0-12.8s
8         120s       3m 47s (cap)     ±0-30s
9+        120s       (continues)      ±0-30s

Reset to attempt 1 when:
  - Network comes back online
  - User returns to foreground
  - 12+ hours elapsed
```

**Implementation (pseudocode):**
```javascript
const backoffDelays = [1, 2, 4, 8, 16, 32, 64, 120];

function scheduleReconnect(attemptNumber) {
  const delay = backoffDelays[Math.min(attemptNumber, 7)];
  const jitter = Math.random() * delay * 0.2; // ±10% jitter
  const finalDelay = delay + jitter;
  
  setTimeout(() => {
    if (networkIsAvailable()) {
      connectWebSocket(attemptNumber + 1);
    }
  }, finalDelay * 1000);
}
```

---

## 3. ACTION QUEUE FOR OFFLINE OPERATIONS

### 3.1 Queue Architecture

**When a user performs an action (offline):**
```
User Action (create task, approve briefing, etc.)
  ├─ Is network available?
  │  ├─ YES → Send to API immediately (with optimistic UI update)
  │  └─ NO → Queue in action_queue table + Optimistic UI update
  │
  └─ action_queue.insert({
       id: uuid(),
       entity_type: 'task',
       entity_id: 'task-123',
       action: 'update',
       payload: JSON.stringify({ status: 'completed' }),
       created_at: now(),
       status: 'pending'
     })
```

**Payload Examples:**
```json
{
  "entity_type": "task",
  "action": "update",
  "payload": {
    "id": "task-123",
    "status": "completed",
    "updated_at": 1705610530123
  }
}

{
  "entity_type": "briefing",
  "action": "create",
  "payload": {
    "id": "briefing-new-456",
    "title": "Q2 Planning",
    "content": "...",
    "created_at": 1705610530123
  }
}

{
  "entity_type": "approval",
  "action": "update",
  "payload": {
    "id": "approval-789",
    "briefing_id": "briefing-123",
    "status": "approved",
    "comment": "Looks good",
    "updated_at": 1705610530123
  }
}
```

### 3.2 Retry Strategy on Reconnect

```
Network becomes available
  ├─ Get all pending actions: SELECT * FROM action_queue WHERE status = 'pending'
  ├─ For each action:
  │  ├─ Attempt POST/PUT/DELETE to API
  │  ├─ On success:
  │  │  ├─ Update action_queue.status = 'synced'
  │  │  ├─ Remove from local DB (or mark soft-deleted)
  │  │  └─ Update entity's synced_at timestamp
  │  │
  │  └─ On failure:
  │     ├─ Increment retry_count
  │     ├─ If retry_count < max_retries:
  │     │  └─ Schedule next retry (exponential backoff)
  │     └─ If retry_count >= max_retries:
  │        ├─ action_queue.status = 'failed'
  │        └─ Show user notification: "Action failed. Retry? [Yes] [No]"
  │
  └─ After all retries: Trigger full sync (fetch server state)
```

**Exponential Backoff for Action Queue:**
```
Action created at T0

Retry Attempt  Delay from creation  Total time so far
─────────────────────────────────────────────────
1 (immediate)  0s                  0s
2              5s                  5s
3              15s                 20s
4              45s                 65s
5              135s (2m15s)        200s (3m20s)
6              405s (6m45s)        605s (10m5s) ← If still failing, notify user
```

### 3.3 Conflict Handling for Queued Actions

**Scenario: User edits task offline, server also changes it**

```
Action Queue Entry:
  entity_type: 'task'
  entity_id: 'task-123'
  action: 'update'
  payload: { status: 'completed' }

When retrying (network available):
  ├─ Before sending: Fetch latest server state for task-123
  ├─ Compare with local state:
  │  ├─ If server version > local version:
  │  │  ├─ CONFLICT DETECTED
  │  │  ├─ Log to conflicts table
  │  │  ├─ Merge strategy: Server wins
  │  │  ├─ Discard queued action
  │  │  ├─ Notify user: "This task was updated by someone else. Your change was discarded."
  │  │  └─ Optionally: Show "Redo" button to re-apply change
  │  │
  │  └─ If server version == local version:
  │     └─ Send action to server (no conflict)
  │
  └─ After send: Update action_queue.status = 'synced'
```

**Conflict Resolution Rules for Different Entity Types:**

```
BRIEFING APPROVAL (most sensitive):
  └─ Server state always wins
  └─ User cannot override another approver's decision
  └─ Queued approval action discarded if server state changed
  └─ Notify: "Someone already [approved/rejected] this. Your action was discarded."

TASK UPDATE:
  ├─ If only assigned_to changed by both: Server wins
  ├─ If status changed by both: Server wins + notify
  ├─ If due_date changed: Server wins + notify
  └─ User can retry their change if desired

PROJECT/BRIEFING CREATION:
  ├─ If entity_id is temporary (local-generated):
  │  └─ Cannot conflict (server generates real ID)
  │  └─ Action queue maps temp_id → real_id on response
  └─ Always succeeds (unless validation fails)
```

---

## 4. PUSH NOTIFICATION SETUP

### 4.1 Push Notification Triggers

**Backend Decision Tree:**

```
User A approves briefing X
  ├─ Query: Who needs to be notified?
  ├─ Get: audience list + stakeholders
  ├─ For each user (except approver):
  │  └─ Send push notification:
  │     ├─ Title: "Briefing X approved"
  │     ├─ Body: "Approved by [User A]"
  │     ├─ Sound: enabled
  │     ├─ Badge: +1 for pending briefings
  │     ├─ Payload: {
  │     │    briefing_id: "X",
  │     │    action: "briefing_approved",
  │     │    timestamp: now()
  │     │  }
  │     └─ Importance: HIGH

Task is assigned to you
  ├─ Send push:
  │  ├─ Title: "New task assigned"
  │  ├─ Body: "[Project] [Task name]"
  │  ├─ Payload: {
  │  │    task_id: "Y",
  │  │    action: "task_assigned",
  │  │    timestamp: now()
  │  │  }
  │  └─ Importance: MEDIUM

Task due date is tomorrow
  ├─ Trigger: Nightly cron (9 AM user timezone)
  ├─ Send push to task assignee:
  │  ├─ Title: "Task due tomorrow"
  │  ├─ Body: "[Task name] due at [time]"
  │  ├─ Payload: {
  │  │    task_id: "Y",
  │  │    action: "task_due_soon",
  │  │    timestamp: now()
  │  │  }
  │  └─ Importance: LOW

Briefing needs your approval (pending >4 hours)
  ├─ Trigger: Scheduled check every 30 minutes
  ├─ Send push reminder:
  │  ├─ Title: "Approval needed"
  │  ├─ Body: "Briefing [X] needs your decision"
  │  ├─ Payload: {
  │  │    briefing_id: "X",
  │  │    action: "approval_reminder",
  │  │    timestamp: now()
  │  │  }
  │  └─ Importance: HIGH
  │  └─ Max frequency: 1 per briefing per 4 hours
```

### 4.2 iOS Push Notification Implementation

**APNs Configuration:**
```
1. Certificate: iOS team's Apple Push Notification certificate
2. Key ID: Your APNs Key ID
3. Team ID: Apple Developer Team ID
4. Topic: com.mission-control.app

Backend:
  ├─ Store device tokens in users table
  ├─ On logout: Revoke token (send delete request)
  ├─ On app reinstall: New token generated
  └─ Validate tokens monthly (APNs returns 400 if stale)

Payload Example:
{
  "aps": {
    "alert": {
      "title": "Briefing X approved",
      "body": "Approved by [User A]"
    },
    "sound": "default",
    "badge": 5,
    "content-available": 1
  },
  "briefing_id": "brief-123",
  "action": "briefing_approved",
  "timestamp": "2026-03-18T20:00:00Z"
}
```

### 4.3 Notification-Triggered UI Update

**App Lifecycle:**

```
Push received (app in background or foreground)
  │
  ├─ App in foreground:
  │  ├─ Show banner notification
  │  ├─ Sound + haptic feedback
  │  └─ On tap: Navigate to entity (briefing/task)
  │
  ├─ App in background:
  │  ├─ Show system notification
  │  ├─ Badge count updated
  │  ├─ On tap: App opens → Check notification payload
  │  └─ Auto-fetch entity data on resume
  │
  └─ App killed:
     ├─ Show system notification
     ├─ Badge count set
     └─ On tap: App launches → Initial sync fetches data

User taps notification
  ├─ App becomes active
  ├─ Extract entity_id from notification payload
  ├─ Execute:
  │  ├─ Fetch latest entity state from API
  │  ├─ Update local SQLite database
  │  ├─ Navigate to detail view with fresh data
  │  └─ Mark notification as handled
  │
  └─ If offline:
     ├─ Navigate to cached entity (if exists)
     └─ Show "Syncing..." indicator (will refresh when online)
```

### 4.4 Badge Count Management

```sql
-- Unread briefings that need approval
SELECT COUNT(*) as pending_approvals
FROM briefing_approvals
WHERE approver_id = ?
  AND status = 'pending'
  AND briefing_id IN (
    SELECT id FROM briefings
    WHERE is_deleted = 0
  );

-- Update badge on app launch and after every sync
UIApplication.shared.applicationIconBadgeNumber = pending_approvals;
```

---

## 5. SYNC STATE MANAGEMENT

### 5.1 State Tracking

**sync_state table:**
```sql
INSERT OR REPLACE INTO sync_state (key, value, updated_at) VALUES
  ('online_status', 'online', 1705610530123),
  ('last_full_sync', '1705610530123', 1705610530123),
  ('last_task_sync', '1705610530123', 1705610530123),
  ('last_briefing_sync', '1705610530123', 1705610530123),
  ('ws_connected', 'true', 1705610530123),
  ('pending_actions_count', '3', 1705610530123),
  ('battery_mode', 'normal', 1705610530123),
  ('network_type', 'wifi', 1705610530123);
```

**In-Memory State (SyncManager):**
```typescript
class SyncManager {
  // Connection state
  isOnline: boolean = true;
  wsConnected: boolean = false;
  wsAttempt: number = 0;
  
  // Sync timestamps
  lastFullSync: number = 0;
  lastTaskSync: number = 0;
  lastBriefingSync: number = 0;
  
  // Queue state
  pendingActionsCount: number = 0;
  failedActionsCount: number = 0;
  
  // Device state
  batteryLevel: number = 100;
  lowPowerMode: boolean = false;
  networkType: 'wifi' | 'cellular' | 'none' = 'none';
  
  // UI state
  isSyncing: boolean = false;
  syncError: string | null = null;
  
  // Polling
  pollingInterval: number = 30;
  pollingActive: boolean = false;
}
```

### 5.2 UI Display of Sync State

**Status Indicator (Top of App):**
```
Online, Connected (WebSocket)
├─ Icon: ✓ green dot
├─ Text: "Connected"
└─ Timestamp: "Last synced 2m ago"

Online, No WebSocket (Polling)
├─ Icon: ⊙ yellow dot
├─ Text: "Connected (polling)"
└─ Timestamp: "Last synced 45s ago"

Offline
├─ Icon: ✗ red dot
├─ Text: "Offline"
└─ Timestamp: "Last synced 3h ago"

Syncing
├─ Icon: ⟳ spinning indicator
├─ Text: "Syncing..."
└─ Timestamp: (hidden while syncing)

Battery Saver
├─ Icon: 🔋 yellow
├─ Text: "Battery Saver: Updates may be delayed"
└─ Can still queue offline actions
```

**Action Queue Status:**
```
Pending Actions: 3
├─ Show badge on "More" tab (red dot with number)
├─ On open:
│  ├─ List pending actions
│  ├─ Show status of each:
│  │  ├─ "Waiting to send..." (no retries yet)
│  │  ├─ "Retry 2 of 5..." (with timestamp of next retry)
│  │  └─ "Failed" (with error message + Retry button)
│  │
│  └─ Buttons:
│     ├─ "Retry All" (if network available)
│     └─ "Discard Failed" (asks for confirmation)
```

### 5.3 Memory Persistence

**On App Launch:**
```
1. Restore sync_state from SQLite
2. Initialize SyncManager with values
3. Check if last_sync < 5 minutes ago
   ├─ If NO: Queue full sync
   └─ If YES: Skip initial sync, do on network change
4. Initialize WebSocket/polling
5. Check for pending actions
   ├─ If any: Retry (with backoff consideration)
   └─ Otherwise: Mark as synced
```

**On App Background:**
```
1. Save sync_state to SQLite
2. Save pending action count
3. Close WebSocket (optional, can keep alive)
4. Stop polling
5. Disable background sync (rely on push notifications)
```

**On App Resume:**
```
1. Restore sync_state from SQLite
2. Reconnect WebSocket
3. If offline: Restart polling
4. If last_sync > 5 minutes: Queue full sync
5. Resume pending action retries
```

---

## 6. DATA MIGRATION STRATEGY

### 6.1 Web State → iOS Device

**Source: ~/.mission-control-state.json**
```json
{
  "currentUser": { /* user profile */ },
  "projects": [ /* array of projects */ ],
  "tasks": [ /* array of tasks */ ],
  "briefings": [ /* array of briefings */ ],
  "permissions": { /* user permissions */ },
  "settings": { /* user preferences */ }
}
```

### 6.2 Initial Import (First Launch)

```
App launches for first time
  │
  ├─ 1. Check: Is ~/.mission-control-state.json available?
  │  ├─ YES:
  │  │  ├─ Read file
  │  │  ├─ Validate structure & user ID
  │  │  ├─ Parse projects, tasks, briefings
  │  │  └─ Proceed to step 2
  │  │
  │  └─ NO:
  │     ├─ Skip to step 5 (will fetch from API)
  │     └─ Continue normally
  │
  ├─ 2. Open SQLite database (create if needed)
  │
  ├─ 3. Insert from web state:
  │  ├─ Projects: INSERT INTO projects (...)
  │  ├─ Tasks: INSERT INTO tasks (...)
  │  ├─ Briefings: INSERT INTO briefings (...)
  │  └─ For each: Set server_version = 0, synced_at = import_time
  │
  ├─ 4. Initialize sync_state:
  │  ├─ last_full_sync = now()
  │  ├─ online_status = 'online'
  │  └─ pending_actions_count = 0
  │
  └─ 5. Complete setup:
     ├─ Remove .mission-control-state.json (optional, for cleanup)
     ├─ Show "Import complete" toast
     └─ Proceed to main app
```

**Error Handling During Import:**
```
If import fails:
  ├─ Log error: "Web state import failed: [error]"
  ├─ Show user: "Couldn't import web data. Fetch from server instead?"
  └─ Options:
     ├─ [Import anyway] → Skip web state, fetch from API
     └─ [Cancel] → Stay on setup screen, retry
```

### 6.3 Bidirectional Sync After Import

```
After successful import:
  │
  ├─ Device is now source of truth (locally)
  ├─ Do NOT re-import from web
  │
  └─ Sync flow (normal):
     ├─ iOS makes changes → Send to API
     ├─ Web makes changes → Fetch via sync
     ├─ Other devices make changes → Fetch via sync/push
     └─ Conflict resolution applies (see section 1.4)
```

**Preventing Double-Import:**
```sql
-- Track import state
CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT
);

INSERT INTO metadata (key, value) VALUES
  ('import_version', '1'),
  ('import_source', 'web'),
  ('import_timestamp', '1705610530123'),
  ('is_initial_import_complete', 'true');

-- On subsequent launches:
SELECT value FROM metadata WHERE key = 'is_initial_import_complete';
-- If 'true' → Skip import, proceed to sync
-- If 'false' or NULL → Attempt import
```

---

## 7. SECURITY ARCHITECTURE

### 7.1 JWT Token Storage (iOS Secure Enclave)

**Keychain (iOS Secure Storage):**
```swift
import Security

class TokenManager {
  static let accessTokenKey = "mission-control.access-token"
  static let refreshTokenKey = "mission-control.refresh-token"
  
  static func storeAccessToken(_ token: String) {
    let data = token.data(using: .utf8)!
    
    // Delete existing token if present
    SecItemDelete(deleteQuery(for: accessTokenKey))
    
    // Store in Keychain
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: accessTokenKey,
      kSecValueData as String: data,
      kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    ]
    
    let status = SecItemAdd(query as CFDictionary, nil)
    guard status == errSecSuccess else {
      print("Failed to store access token: \(status)")
      return
    }
  }
  
  static func retrieveAccessToken() -> String? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: accessTokenKey,
      kSecReturnData as String: true
    ]
    
    var result: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    
    guard status == errSecSuccess,
          let data = result as? Data,
          let token = String(data: data, encoding: .utf8) else {
      return nil
    }
    
    return token
  }
  
  static func deleteTokens() {
    SecItemDelete(deleteQuery(for: accessTokenKey))
    SecItemDelete(deleteQuery(for: refreshTokenKey))
  }
  
  private static func deleteQuery(for key: String) -> [String: Any] {
    [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: key
    ]
  }
}
```

**NEVER store tokens in:**
- UserDefaults (unencrypted)
- Plist files
- Plain text files
- SQLite database (without encryption)

### 7.2 Token Refresh & Expiry

**Automatic Token Refresh:**
```typescript
class AuthManager {
  private tokenExpiresAt: number = 0;
  private refreshTimer: NodeJS.Timeout | null = null;
  
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    const { access_token, refresh_token, expires_in } = await response.json();
    
    // Store tokens securely
    TokenManager.storeAccessToken(access_token);
    TokenManager.storeRefreshToken(refresh_token);
    
    // Calculate expiry: 5 minutes before actual expiry
    this.tokenExpiresAt = Date.now() + (expires_in * 1000) - (5 * 60 * 1000);
    
    // Schedule refresh before expiry
    this.scheduleTokenRefresh();
  }
  
  private scheduleTokenRefresh() {
    const timeUntilExpiry = this.tokenExpiresAt - Date.now();
    
    if (timeUntilExpiry <= 0) {
      this.refreshToken();
      return;
    }
    
    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, timeUntilExpiry);
  }
  
  async refreshToken() {
    try {
      const refreshToken = TokenManager.retrieveRefreshToken();
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (!response.ok) {
        // Refresh failed → Force logout
        this.logout();
        return;
      }
      
      const { access_token, refresh_token, expires_in } = await response.json();
      
      TokenManager.storeAccessToken(access_token);
      TokenManager.storeRefreshToken(refresh_token);
      
      this.tokenExpiresAt = Date.now() + (expires_in * 1000) - (5 * 60 * 1000);
      this.scheduleTokenRefresh();
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }
  }
  
  async logout() {
    TokenManager.deleteTokens();
    clearTimeout(this.refreshTimer!);
    // Navigate to login screen
  }
}
```

### 7.3 Re-auth on Token Expiry

**Handling Expired Token During API Call:**
```swift
func makeAPIRequest<T: Decodable>(
  endpoint: String,
  method: String = "GET"
) async throws -> T {
  
  var request = URLRequest(url: URL(string: endpoint)!)
  request.httpMethod = method
  
  // Add access token
  if let token = TokenManager.retrieveAccessToken() {
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
  }
  
  do {
    let (data, response) = try await URLSession.shared.data(for: request)
    
    if let httpResponse = response as? HTTPURLResponse {
      if httpResponse.statusCode == 401 {
        // Token expired or invalid
        let refreshed = await refreshToken()
        
        if refreshed {
          // Retry request with new token
          return try await makeAPIRequest(endpoint: endpoint, method: method)
        } else {
          // Refresh failed → Logout
          logout()
          throw AuthError.sessionExpired
        }
      }
    }
    
    let decoder = JSONDecoder()
    return try decoder.decode(T.self, from: data)
  } catch {
    throw error
  }
}
```

### 7.4 Logout & Data Clearance

**Complete Data Wipe:**
```swift
func logout() {
  // 1. Clear tokens
  TokenManager.deleteTokens()
  
  // 2. Clear SQLite database
  let databasePath = NSSearchPathForDirectoriesInDomains(
    .documentDirectory,
    .userDomainMask,
    true
  ).first! + "/mission-control.db"
  
  do {
    try FileManager.default.removeItem(atPath: databasePath)
  } catch {
    print("Error deleting database: \(error)")
  }
  
  // 3. Clear UserDefaults (settings)
  UserDefaults.standard.dictionaryRepresentation().keys.forEach { key in
    if key.hasPrefix("com.mission-control") {
      UserDefaults.standard.removeObject(forKey: key)
    }
  }
  
  // 4. Clear cache
  URLCache.shared.removeAllCachedResponses()
  
  // 5. Close WebSocket
  syncManager.closeWebSocket()
  
  // 6. Navigate to login
  showLoginScreen()
}
```

---

## 8. DOCUMENTATION & DIAGRAMS

### 8.1 Data Flow Diagram (Offline → Online → Server)

```
┌──────────────────────────────────────────────────────────────┐
│                      MISSION CONTROL iOS                     │
│                   Data Flow Architecture                      │
└──────────────────────────────────────────────────────────────┘

                            USER ACTIONS
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                 Online       Offline      Both
                    │            │            │
                    ▼            ▼            ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │  API     │  │ Action   │  │  SQLite  │
            │ Request  │  │  Queue   │  │  Local   │
            │  (REST)  │  │ (Queued) │  │   DB     │
            └────┬─────┘  └────┬─────┘  └─────┬────┘
                 │             │              │
                 │             │         Offline Updates
                 │        Optimistic       (cached)
                 │       UI Update         │
                 │             │           │
                 │             └───┬───────┘
                 │                 │
                 ▼                 ▼
         ┌─────────────────────────────┐
         │   Local SQLite Database     │
         ├─────────────────────────────┤
         │ • Projects                  │
         │ • Tasks                     │
         │ • Briefings                 │
         │ • Approvals                 │
         │ • Sync State                │
         │ • Action Queue              │
         │ • Conflicts                 │
         └────────────┬────────────────┘
                      │
              ┌───────┴────────┐
              │                │
         Background        Network
         WebSocket         Status
         (real-time)       Change
              │                │
              ▼                ▼
         ┌─────────────────────────────┐
         │   API Gateway (Backend)     │
         ├─────────────────────────────┤
         │ • Sync endpoint             │
         │ • Action endpoint           │
         │ • Token refresh             │
         └────────────┬────────────────┘
                      │
              ┌───────┴────────┐
              │                │
              ▼                ▼
         ┌──────────────┐  ┌──────────────┐
         │  Database    │  │  WebSocket   │
         │  (Server)    │  │  Broadcast   │
         └──────────────┘  └──────────────┘
              │                  │
              └──────────┬───────┘
                         │
              ┌──────────▼──────────┐
              │ Real-time Updates   │
              │ (Other clients)     │
              └─────────────────────┘
```

### 8.2 Briefing Approval Workflow (Sequence Diagram)

```
User         iOS App          Local DB      API          Server DB
 │              │                │           │               │
 │ tap approve  │                │           │               │
 ├─────────────▶│                │           │               │
 │              │ check network  │           │               │
 │              ├──────┐         │           │               │
 │              │      │ online  │           │               │
 │              │◀─────┘         │           │               │
 │              │ optimistic     │           │               │
 │              │ update UI      │           │               │
 │              ├────────────────▶          │               │
 │              │ (show "approved")         │               │
 │              │ queue action              │               │
 │              ├────────────────▶          │               │
 │              │                │           │               │
 │              │ POST /briefings/X/approve │               │
 │              ├───────────────────────────▶               │
 │              │                │           │ store in     │
 │              │                │           │ database     │
 │              │                │           ├─────────────▶│
 │              │                │           │               │
 │              │  200 OK + metadata        │               │
 │              │◀───────────────────────────               │
 │              │ update approval record    │               │
 │              ├────────────────▶          │               │
 │              │ mark synced                │               │
 │              ├────────────────▶          │               │
 │              │ (remove from queue)        │               │
 │              ├────────────────▶          │               │
 │              │ show "synced" toast      │               │
 │◀─────────────┤                │           │               │
 │              │                │           │               │
 │              │ [WebSocket: Briefing approval updated]     │
 │              │◀───────────────────────────────────────────│
 │              │ update UI (other approvers notified)      │
 │              │ broadcast status                          │
 │◀─────────────┤                │           │               │
 │              │                │           │               │

 OFFLINE CASE:
 
 │ tap approve  │                │           │               │
 ├─────────────▶│                │           │               │
 │              │ check network  │           │               │
 │              ├──────┐         │           │               │
 │              │      │ offline │           │               │
 │              │◀─────┘         │           │               │
 │              │ queue action   │           │               │
 │              ├────────────────▶          │               │
 │              │ optimistic UI  │           │               │
 │              │ show badge     │           │               │
 │◀─────────────┤ "1 pending"    │           │               │
 │              │                │           │               │
 │     (network available)        │           │               │
 │              │ auto-retry     │           │               │
 │              ├────────────────▶          │               │
 │              │ [action dequeued]         │               │
 │              │ POST /approve  │           │               │
 │              ├───────────────────────────▶               │
 │              │                │           │ store + broadcast
 │              │  200 OK        │           ├─────────────▶│
 │              │◀───────────────────────────               │
 │              │ update DB      │           │               │
 │              ├────────────────▶          │               │
 │              │ show "synced"  │           │               │
 │◀─────────────┤                │           │               │
```

### 8.3 Conflict Resolution Decision Tree

```
Sync receives entity update (from server or polling)
  │
  ├─ Compare: local.version vs server.version
  │  │
  │  ├─ IF local.version > server.version
  │  │  ├─ Client made updates, server didn't change
  │  │  ├─ Is entity in action_queue (pending retry)?
  │  │  │  ├─ YES: Queue will retry POST/PUT
  │  │  │  └─ NO: Send update immediately
  │  │  │
  │  │  └─ RESULT: Accept local version (push to server)
  │  │
  │  ├─ IF local.version < server.version
  │  │  ├─ Server changed, client didn't
  │  │  ├─ Check: local.last_edit_timestamp vs server.timestamp
  │  │  │  ├─ If local is stale: Accept server
  │  │  │  └─ If local is fresh: CONFLICT!
  │  │  │
  │  │  └─ RESULT: Accept server version (fetch + merge)
  │  │
  │  └─ IF local.version == server.version
  │     ├─ Both unchanged OR both edited same number of times
  │     ├─ Tiebreaker: server.timestamp > local.timestamp?
  │     │  ├─ YES: Accept server (server authoritative)
  │     │  └─ NO: Accept local (client has newer data)
  │     │
  │     └─ RESULT: Depends on tiebreaker
  │
  ├─ CONFLICT DETECTED (rare)
  │  ├─ Log to conflicts table
  │  ├─ Snapshot both versions (JSON)
  │  ├─ Strategy: SERVER WINS
  │  ├─ Discard local change (or queue as new action)
  │  ├─ Update DB with server version
  │  ├─ Notify user:
  │  │  ├─ "Your edit was overridden by server change"
  │  │  ├─ Show: server change
  │  │  └─ Option: "Redo my change" (creates new action)
  │  │
  │  └─ RESULT: Server state becomes canonical
  │
  └─ NO CONFLICT (typical)
     ├─ Merge data (update local DB)
     ├─ Update: server_version, synced_at
     ├─ Trigger UI refresh if critical field changed
     └─ RESULT: DB updated, UI reflects server state
```

### 8.4 Testing Scenarios

#### Scenario 1: Offline → Online Transition

```
1. Start: App online, all data synced
2. Turn off network (airplane mode)
3. Create a new task
   ├─ Verify: Task appears in UI (optimistic)
   ├─ Verify: Task in action_queue table (status = 'pending')
   ├─ Verify: No API request sent
   └─ Verify: Badge shows "1 pending"

4. Turn on network
5. Verify: Action queue retry triggered
   ├─ Verify: API POST request sent
   ├─ Verify: Task synced (action_queue.status = 'synced')
   ├─ Verify: Badge cleared
   └─ Verify: Task marked with server ID

6. Expected: No errors, task appears on web/other devices
```

#### Scenario 2: Concurrent Edit (Conflict)

```
1. Device A & Web open same briefing (both synced)
2. Device A: Edit title offline
   ├─ Optimistic: Title changes in UI
   ├─ Queue: Action added (status = 'pending')

3. Web: Edit title (different text) and save
   ├─ Server updates: version = 2, timestamp = T1

4. Device A: Network available
5. Sync starts:
   ├─ Fetch latest briefing: version = 2, text = "Web version"
   ├─ Compare: local.version (1) < server.version (2)
   ├─ CONFLICT DETECTED
   ├─ Check action_queue: Found pending edit
   ├─ Decision: DISCARD local change (server wins)
   ├─ Update UI: Show "Briefing was updated by web. Your change discarded."
   ├─ Option: Button "Redo my change" → new action to queue
   │
   └─ Verify: DB has server version, action_queue cleaned

6. Expected: No data loss, user aware of conflict
```

#### Scenario 3: Offline with Multiple Queued Actions

```
1. Device offline, user queues:
   ├─ Create new task (action 1)
   ├─ Approve briefing (action 2)
   ├─ Update project name (action 3)

2. Verify action_queue: 3 pending entries
3. Verify UI: Badge shows "3 pending" in queue view

4. Network available
5. Retry logic:
   ├─ Attempt action 1: Success → status = 'synced'
   ├─ Attempt action 2: Success → status = 'synced'
   ├─ Attempt action 3: Conflict (project deleted) → status = 'failed'
   │  ├─ Retry count incremented
   │  ├─ Next retry: 5 seconds
   │
   └─ UI shows: "1 action failed. Retry?"

6. Manual retry or auto-retry after 5s:
   ├─ Action 3 fails again (project still deleted)
   ├─ Increment retry count (now 2/5)
   ├─ Next retry: 15 seconds

7. After 5 retries:
   ├─ Status = 'failed'
   ├─ Show user: "Couldn't approve briefing. Project was deleted."
   ├─ Option: "Delete this action" or "Retry"

8. Expected: No data loss, user informed, retry possible
```

#### Scenario 4: WebSocket Reconnection with Backoff

```
1. App has active WebSocket
2. Network disconnect
3. Verify:
   ├─ WebSocket closes
   ├─ Attempt 1: Reconnect immediately (fail expected)
   ├─ Attempt 2: Wait 1s + jitter, try again
   ├─ Attempt 3: Wait 2s + jitter, try again
   ├─ ... (backoff continues)

4. After 3 failed attempts:
   ├─ Switch to polling
   ├─ Verify: GET /api/v1/sync every 30s
   ├─ No critical updates missed

5. Network available
6. Verify:
   ├─ Next poll succeeds
   ├─ Switch back to WebSocket
   ├─ Reset attempt counter
   ├─ Reconnect succeeds

7. Expected: Smooth transition, no missed updates, battery efficient
```

#### Scenario 5: Battery Saver Mode

```
1. Device battery < 20%
2. Enable low power mode
3. Verify:
   ├─ WebSocket disabled (polling only)
   ├─ Polling interval: 60 seconds (not 30)
   ├─ Animations reduced
   ├─ UI shows: "Battery saver mode"

4. Queue offline action
5. Verify:
   ├─ Action queued
   ├─ No immediate retry on network (respects battery)
   ├─ Retry after next polling cycle

6. Battery > 20%
7. Disable low power mode
8. Verify:
   ├─ WebSocket re-enables
   ├─ Polling interval returns to 30s
   ├─ Pending actions retry immediately

9. Expected: Battery respected, data integrity maintained
```

---

## 9. API CONTRACT ADDENDUMS

### 9.1 Sync Endpoint Specification

**GET /api/v1/sync**

Query Parameters:
```
- since: Integer (Unix timestamp ms)
  ├─ Returns: Only entities changed since this time
  └─ Example: ?since=1705610530123

- entities: Comma-separated string
  ├─ Values: "projects,tasks,briefings,approvals"
  └─ Example: ?entities=tasks,briefings

- include_deleted: Boolean
  ├─ Default: false
  ├─ If true: Include soft-deleted entities
  └─ Use for: Cleanup/tombstone propagation

- limit: Integer (max results per entity)
  ├─ Default: 1000
  └─ Example: ?limit=500
```

Response:
```json
{
  "timestamp": 1705610530123,
  "sync_token": "abc123def456",
  "data": {
    "projects": [
      {
        "id": "proj-1",
        "name": "Q1 Planning",
        "version": 5,
        "timestamp": 1705610530000,
        "is_deleted": false
      }
    ],
    "tasks": [
      {
        "id": "task-1",
        "project_id": "proj-1",
        "title": "Design homepage",
        "status": "in_progress",
        "version": 3,
        "timestamp": 1705610520000,
        "is_deleted": false
      }
    ],
    "briefings": [ /* ... */ ],
    "approvals": [ /* ... */ ]
  },
  "has_more": false
}
```

### 9.2 Action Endpoint Specification

**POST /api/v1/actions**

Request:
```json
{
  "action_id": "uuid-client-generated",
  "entity_type": "task",
  "action": "update",
  "payload": {
    "id": "task-1",
    "status": "completed",
    "updated_at": 1705610530123
  }
}
```

Response:
```json
{
  "success": true,
  "action_id": "uuid-client-generated",
  "entity_id": "task-1",
  "entity_version": 4,
  "timestamp": 1705610530123,
  "sync_token": "abc123def456"
}
```

**Error Responses:**
```json
{
  "success": false,
  "action_id": "uuid-client-generated",
  "error_code": "CONFLICT",
  "error_message": "Entity was modified by another client",
  "server_version": 5,
  "client_version": 3,
  "server_data": { /* current server state */ }
}
```

### 9.3 Version & Timestamp Headers

**All API Responses Include:**
```
Content-Type: application/json
X-API-Version: 1.0
X-Server-Timestamp: 1705610530123
X-Sync-Token: abc123def456
```

**Client Must:**
```
- Extract X-Server-Timestamp
- Use for conflict detection (tiebreaker)
- Update local sync_state.last_full_sync
- Store X-Sync-Token for pagination
```

---

## 10. CODE EXAMPLES

### 10.1 SyncManager Class (Pseudo-Swift)

```swift
import Foundation
import SQLite3

class SyncManager {
  var isOnline = true
  var wsConnected = false
  var isSyncing = false
  var pendingActionsCount = 0
  
  var lastFullSync: Int64 = 0
  var wsAttempt = 0
  var pollingTimer: Timer?
  
  let db: Database
  let apiClient: APIClient
  let wsClient: WebSocketClient
  
  func startSync() {
    guard !isSyncing else { return }
    isSyncing = true
    
    Task {
      do {
        // 1. Fetch changes from server
        let syncResponse = try await apiClient.sync(
          since: lastFullSync,
          entities: ["projects", "tasks", "briefings", "approvals"]
        )
        
        // 2. Merge into local DB
        try mergeSync(syncResponse)
        
        // 3. Retry pending actions
        try await retryPendingActions()
        
        // 4. Update state
        lastFullSync = syncResponse.timestamp
        isSyncing = false
        
        // 5. Notify UI
        NotificationCenter.default.post(name: NSNotification.Name("SyncComplete"))
      } catch {
        isSyncing = false
        print("Sync failed: \(error)")
      }
    }
  }
  
  private func mergeSync(_ response: SyncResponse) throws {
    try db.transaction {
      for project in response.data.projects {
        try mergeEntity(project, type: "projects")
      }
      for task in response.data.tasks {
        try mergeEntity(task, type: "tasks")
      }
      // ... briefings, approvals
    }
  }
  
  private func mergeEntity(_ entity: [String: Any], type: String) throws {
    let entityId = entity["id"] as! String
    let serverVersion = entity["version"] as! Int
    
    // Check for conflict
    let localVersion = try db.query(
      "SELECT local_version FROM \(type) WHERE id = ?",
      [entityId]
    ).first?["local_version"] as? Int ?? 0
    
    if localVersion > serverVersion {
      // Client has newer edits, don't overwrite
      return
    }
    
    if localVersion < serverVersion {
      // Check if there's a pending action
      let pendingAction = try db.query(
        "SELECT * FROM action_queue WHERE entity_id = ? AND status = ?",
        [entityId, "pending"]
      ).first
      
      if pendingAction != nil {
        // Log conflict
        try logConflict(entityId, localData: [:], serverData: entity)
      }
    }
    
    // Merge
    try db.execute(
      "UPDATE \(type) SET server_version = ?, synced_at = ? WHERE id = ?",
      [serverVersion, Date().timeIntervalSince1970 * 1000, entityId]
    )
  }
  
  func queueAction(entity_id: String, action: String, payload: [String: Any]) throws {
    let actionId = UUID().uuidString
    
    try db.execute(
      """
      INSERT INTO action_queue 
      (id, entity_type, entity_id, action, payload, created_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      """,
      [actionId, "task", entity_id, action, try JSONSerialization.data(withJSONObject: payload), Date().timeIntervalSince1970 * 1000, "pending"]
    )
    
    updatePendingCount()
  }
  
  func retryPendingActions() async throws {
    let actions = try db.query("SELECT * FROM action_queue WHERE status = ? ORDER BY created_at", ["pending"])
    
    for actionDict in actions {
      let action = ActionQueueEntry(from: actionDict)
      
      do {
        let response = try await apiClient.executeAction(action)
        try db.execute("UPDATE action_queue SET status = ? WHERE id = ?", ["synced", action.id])
      } catch let error as APIError {
        if error.code == "CONFLICT" {
          // Discard action
          try db.execute("DELETE FROM action_queue WHERE id = ?", [action.id])
        } else {
          // Retry later
          let nextRetryDelay = calculateBackoff(action.retry_count)
          try db.execute(
            "UPDATE action_queue SET retry_count = ?, last_retry_at = ? WHERE id = ?",
            [action.retry_count + 1, Date().timeIntervalSince1970 * 1000 + (nextRetryDelay * 1000), action.id]
          )
        }
      }
    }
    
    updatePendingCount()
  }
  
  func connectWebSocket() {
    wsClient.delegate = self
    wsClient.connect()
  }
  
  func startPolling() {
    pollingTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { _ in
      self.startSync()
    }
  }
  
  func handleNetworkChange(_ isOnline: Bool) {
    self.isOnline = isOnline
    
    if isOnline {
      startSync()
      if !wsConnected {
        connectWebSocket()
      }
    } else {
      wsClient.disconnect()
      pollingTimer?.invalidate()
    }
  }
  
  private func updatePendingCount() {
    let count = try? db.query("SELECT COUNT(*) as cnt FROM action_queue WHERE status = ?", ["pending"]).first?["cnt"] as? Int ?? 0
    self.pendingActionsCount = count ?? 0
  }
}
```

### 10.2 WebSocket Handler

```swift
extension SyncManager: WebSocketClientDelegate {
  func webSocketDidConnect() {
    wsConnected = true
    wsAttempt = 0
    print("WebSocket connected")
  }
  
  func webSocketDidReceive(message: [String: Any]) {
    guard let type = message["type"] as? String else { return }
    
    switch type {
    case "update":
      handleUpdate(message)
    case "notify":
      handleNotification(message)
    case "ping":
      wsSendPong()
    case "error":
      handleError(message)
    default:
      break
    }
  }
  
  func handleUpdate(_ message: [String: Any]) {
    guard let entityType = message["entity_type"] as? String,
          let entityId = message["entity_id"] as? String,
          let data = message["data"] as? [String: Any] else {
      return
    }
    
    Task {
      do {
        try mergeEntity(data, type: entityType)
        NotificationCenter.default.post(
          name: NSNotification.Name("EntityUpdated"),
          object: ["entity_id": entityId, "type": entityType]
        )
      } catch {
        print("Failed to merge entity: \(error)")
      }
    }
  }
  
  func handleNotification(_ message: [String: Any]) {
    guard let action = message["action"] as? String else { return }
    
    let notification = UNMutableNotificationContent()
    notification.sound = .default
    
    switch action {
    case "briefing_approved":
      notification.title = "Briefing Approved"
      notification.body = message["body"] as? String ?? ""
    case "task_assigned":
      notification.title = "New Task Assigned"
      notification.body = message["body"] as? String ?? ""
    default:
      return
    }
    
    // Add badge
    updateBadgeCount()
    
    UNUserNotificationCenter.current().add(
      UNNotificationRequest(identifier: UUID().uuidString, content: notification, trigger: nil)
    )
  }
  
  func webSocketDidDisconnect(error: Error?) {
    wsConnected = false
    scheduleReconnect()
  }
  
  func scheduleReconnect() {
    let delays = [1, 2, 4, 8, 16, 32, 64, 120]
    let delay = delays[min(wsAttempt, 7)]
    let jitter = Double.random(in: 0...(Double(delay) * 0.2))
    
    DispatchQueue.main.asyncAfter(deadline: .now() + Double(delay) + jitter) {
      if self.isOnline {
        self.wsAttempt += 1
        self.connectWebSocket()
      }
    }
  }
}
```

---

## 11. TEST PLAN FOR OFFLINE SCENARIOS

### Test Coverage Matrix

```
┌────────────────────────────────────────────────────────────┐
│ Offline Scenario Test Plan                                 │
├────────────────────────────────────────────────────────────┤
│ TEST ID │ SCENARIO              │ EXPECTED      │ STATUS   │
├─────────┼───────────────────────┼───────────────┼──────────┤
│ T1      │ App launches offline  │ Shows cached  │ ◯        │
│         │                       │ data + sync   │          │
│         │                       │ indicator     │          │
│─────────┼───────────────────────┼───────────────┼──────────┤
│ T2      │ Create task offline   │ UI updates,   │ ◯        │
│         │                       │ action queued │          │
│─────────┼───────────────────────┼───────────────┼──────────┤
│ T3      │ Edit task offline     │ Optimistic    │ ◯        │
│         │                       │ update, can   │          │
│         │                       │ continue work │          │
│─────────┼───────────────────────┼───────────────┼──────────┤
│ T4      │ Network returns       │ Action queue  │ ◯        │
│         │                       │ retries,      │          │
│         │                       │ syncs complete│          │
│─────────┼───────────────────────┼───────────────┼──────────┤
│ T5      │ Conflict detected     │ User notified │ ◯        │
│         │                       │ server wins   │          │
│─────────┼───────────────────────┼───────────────┼──────────┤
│ T6      │ WebSocket drops       │ Falls back to │ ◯        │
│         │                       │ polling       │          │
│─────────┼───────────────────────┼───────────────┼──────────┤
│ T7      │ Queued actions fail   │ Shows failed  │ ◯        │
│         │                       │ badge, allows │          │
│         │                       │ retry         │          │
│─────────┼───────────────────────┼───────────────┼──────────┤
│ T8      │ App killed (offline)  │ On restart:   │ ◯        │
│         │                       │ Data restored │          │
│         │                       │ pending queue │          │
│─────────┼───────────────────────┼───────────────┼──────────┤
│ T9      │ Battery saver mode    │ WebSocket off │ ◯        │
│         │                       │ polling only  │          │
│─────────┼───────────────────────┼───────────────┼──────────┤
│ T10     │ Airplane mode toggle  │ Clean state   │ ◯        │
│         │                       │ transitions   │          │
└────────┴───────────────────────┴───────────────┴──────────┘
```

### Unit Tests

```swift
class SyncManagerTests: XCTestCase {
  var syncManager: SyncManager!
  var mockDB: MockDatabase!
  var mockAPIClient: MockAPIClient!
  
  override func setUp() {
    super.setUp()
    mockDB = MockDatabase()
    mockAPIClient = MockAPIClient()
    syncManager = SyncManager(db: mockDB, apiClient: mockAPIClient)
  }
  
  // Test 1: Queue action when offline
  func testQueueActionWhenOffline() throws {
    syncManager.isOnline = false
    
    try syncManager.queueAction(entity_id: "task-1", action: "update", payload: ["status": "completed"])
    
    let queued = try mockDB.query("SELECT * FROM action_queue WHERE status = ?", ["pending"])
    XCTAssertEqual(queued.count, 1)
    XCTAssertEqual(syncManager.pendingActionsCount, 1)
  }
  
  // Test 2: Retry on network return
  func testRetryOnNetworkReturn() async throws {
    syncManager.isOnline = false
    try syncManager.queueAction(entity_id: "task-1", action: "update", payload: ["status": "completed"])
    
    syncManager.isOnline = true
    try await syncManager.retryPendingActions()
    
    let synced = try mockDB.query("SELECT * FROM action_queue WHERE status = ?", ["synced"])
    XCTAssertEqual(synced.count, 1)
  }
  
  // Test 3: Conflict detection
  func testConflictDetection() throws {
    // Insert local entity with version 2
    try mockDB.execute("INSERT INTO tasks (id, local_version, server_version) VALUES (?, ?, ?)", ["task-1", 2, 1])
    
    // Attempt merge with version 1 (server has older version)
    let entityData: [String: Any] = ["id": "task-1", "version": 1]
    
    // Should not overwrite (local has newer edits)
    XCTAssertThrows {
      try syncManager.mergeEntity(entityData, type: "tasks")
    }
  }
  
  // Test 4: Backoff calculation
  func testBackoffCalculation() {
    XCTAssertEqual(syncManager.calculateBackoff(0), 1)
    XCTAssertEqual(syncManager.calculateBackoff(1), 2)
    XCTAssertEqual(syncManager.calculateBackoff(2), 4)
    XCTAssertEqual(syncManager.calculateBackoff(7), 120)
    XCTAssertEqual(syncManager.calculateBackoff(8), 120) // cap
  }
}
```

### Integration Tests

```swift
class OfflineIntegrationTests: XCTestCase {
  var app: XCUIApplication!
  
  override func setUp() {
    super.setUp()
    app = XCUIApplication()
    app.launch()
  }
  
  // Test: Full offline workflow
  func testOfflineWorkflow() throws {
    // 1. Go offline
    XCUIDevice.shared.simulateLocation()
    
    // 2. Create task
    app.buttons["Create Task"].tap()
    app.textFields["Title"].typeText("Test Task")
    app.buttons["Save"].tap()
    
    // 3. Verify in UI
    XCTAssert(app.staticTexts["Test Task"].exists)
    
    // 4. Verify badge shows pending
    let badge = app.staticTexts["1"]
    XCTAssert(badge.exists)
    
    // 5. Come online
    XCUIDevice.shared.clearSimulatedLocation()
    
    // 6. Wait for sync
    sleep(2)
    
    // 7. Verify synced (badge gone)
    XCTAssertFalse(badge.exists)
  }
}
```

---

## 12. SUMMARY & NEXT STEPS

### Architecture Strengths

✅ **Offline-First**: Users can work without network  
✅ **Real-Time Ready**: WebSocket for live updates  
✅ **Conflict-Safe**: Server-authoritative resolution  
✅ **Secure**: Keychain storage, token refresh  
✅ **Efficient**: Polling fallback, battery-aware  
✅ **Observable**: Clear sync state in UI  

### Implementation Roadmap

**Phase 1 (Week 1-2):** SQLite schema + basic sync  
**Phase 2 (Week 2-3):** WebSocket connection + retry logic  
**Phase 3 (Week 3-4):** Action queue + conflict handling  
**Phase 4 (Week 4-5):** Push notifications + UI integration  
**Phase 5 (Week 5-6):** Testing + optimization  

### Critical Dependencies

- iOS 14+ (for Keychain, BackgroundTasks)
- SQLite3 (bundled with iOS)
- Server API (GET /sync, POST /actions, WebSocket upgrade)
- APNs certificate (push notifications)

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-18  
**Next Review:** Post-implementation (Week 6)
