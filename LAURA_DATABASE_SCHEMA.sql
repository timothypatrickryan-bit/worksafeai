-- Mission Control iOS: SQLite Database Schema
-- Version: 1.0
-- Created: 2026-03-18

-- ============================================================================
-- METADATA & CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER DEFAULT (CAST(strftime('%s','now') * 1000 AS INTEGER))
);

INSERT OR IGNORE INTO metadata (key, value) VALUES
  ('db_version', '1.0'),
  ('app_version', '1.0.0'),
  ('import_complete', 'false'),
  ('import_source', ''),
  ('import_timestamp', '0');

-- ============================================================================
-- SYNC STATE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER DEFAULT (CAST(strftime('%s','now') * 1000 AS INTEGER))
);

INSERT OR IGNORE INTO sync_state (key, value) VALUES
  -- Connection status
  ('online_status', 'unknown'),
  ('ws_connected', 'false'),
  ('ws_attempt_count', '0'),
  
  -- Sync timestamps (milliseconds since epoch)
  ('last_full_sync', '0'),
  ('last_task_sync', '0'),
  ('last_briefing_sync', '0'),
  ('last_approval_sync', '0'),
  
  -- Device state
  ('battery_level', '100'),
  ('low_power_mode', 'false'),
  ('network_type', 'none'),
  
  -- Queue state
  ('pending_actions_count', '0'),
  ('failed_actions_count', '0'),
  
  -- Sync token (for pagination/checkpoint)
  ('last_sync_token', '');

-- ============================================================================
-- CORE ENTITIES: PROJECTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Timestamps (milliseconds since epoch)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  -- Versioning & sync tracking
  server_version INTEGER DEFAULT 0,      -- Server's version counter
  local_version INTEGER DEFAULT 0,       -- Local edits counter
  synced_at INTEGER DEFAULT 0,           -- Last successful sync time
  
  -- Soft delete support
  is_deleted BOOLEAN DEFAULT 0,
  
  -- Metadata
  owner_id TEXT,
  created_by TEXT,
  
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_projects_synced ON projects(synced_at);
CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects(is_deleted);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);

-- ============================================================================
-- CORE ENTITIES: TASKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  
  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  author_id TEXT,
  
  -- Task state machine
  status TEXT NOT NULL CHECK(status IN ('open','in_progress','completed','blocked')),
  priority TEXT NOT NULL CHECK(priority IN ('low','medium','high','critical')),
  
  -- Dates (milliseconds since epoch)
  due_date INTEGER,
  started_at INTEGER,
  completed_at INTEGER,
  
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  -- Versioning & sync tracking
  server_version INTEGER DEFAULT 0,
  local_version INTEGER DEFAULT 0,
  synced_at INTEGER DEFAULT 0,
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT 0,
  
  -- Metadata
  estimated_hours REAL,
  tags TEXT,                             -- JSON array of strings
  
  FOREIGN KEY(project_id) REFERENCES projects(id),
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_synced ON tasks(synced_at);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(is_deleted);

-- ============================================================================
-- CORE ENTITIES: BRIEFINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS briefings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  
  -- Metadata
  author_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft','pending_approval','approved','rejected')),
  
  -- Dates (milliseconds since epoch)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  approved_at INTEGER,
  
  -- Versioning & sync tracking
  server_version INTEGER DEFAULT 0,
  local_version INTEGER DEFAULT 0,
  synced_at INTEGER DEFAULT 0,
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT 0,
  
  -- Audience (JSON array of user IDs)
  audience TEXT,
  
  -- Attachments metadata (references stored separately)
  attachment_count INTEGER DEFAULT 0,
  
  FOREIGN KEY(project_id) REFERENCES projects(id),
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_briefings_project ON briefings(project_id);
CREATE INDEX IF NOT EXISTS idx_briefings_status ON briefings(status);
CREATE INDEX IF NOT EXISTS idx_briefings_author ON briefings(author_id);
CREATE INDEX IF NOT EXISTS idx_briefings_synced ON briefings(synced_at);
CREATE INDEX IF NOT EXISTS idx_briefings_deleted ON briefings(is_deleted);

-- ============================================================================
-- APPROVAL WORKFLOW: BRIEFING APPROVALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS briefing_approvals (
  id TEXT PRIMARY KEY,
  briefing_id TEXT NOT NULL,
  approver_id TEXT NOT NULL,
  
  -- Approval state
  status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected')),
  comment TEXT,
  
  -- Dates (milliseconds since epoch)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  -- Versioning & sync tracking
  server_version INTEGER DEFAULT 0,
  local_version INTEGER DEFAULT 0,
  synced_at INTEGER DEFAULT 0,
  
  -- Metadata
  approval_order INTEGER,                -- Sequence (1st approver, 2nd, etc)
  required BOOLEAN DEFAULT 1,            -- Is approval mandatory?
  
  FOREIGN KEY(briefing_id) REFERENCES briefings(id),
  UNIQUE(briefing_id, approver_id)
);

CREATE INDEX IF NOT EXISTS idx_approvals_briefing ON briefing_approvals(briefing_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON briefing_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON briefing_approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_synced ON briefing_approvals(synced_at);

-- ============================================================================
-- COMMENTS & ACTIVITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,             -- 'task', 'briefing'
  entity_id TEXT NOT NULL,
  
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  
  server_version INTEGER DEFAULT 0,
  local_version INTEGER DEFAULT 0,
  synced_at INTEGER DEFAULT 0,
  
  is_deleted BOOLEAN DEFAULT 0,
  
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_synced ON comments(synced_at);

-- ============================================================================
-- OFFLINE ACTION QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS action_queue (
  id TEXT PRIMARY KEY,
  
  -- Entity reference
  entity_type TEXT NOT NULL CHECK(entity_type IN ('project','task','briefing','approval','comment')),
  entity_id TEXT NOT NULL,
  
  -- Action type
  action TEXT NOT NULL CHECK(action IN ('create','update','delete')),
  
  -- Payload (JSON string)
  payload TEXT NOT NULL,
  
  -- Queue timing
  created_at INTEGER NOT NULL,
  queued_at INTEGER NOT NULL,
  
  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 5,
  last_retry_at INTEGER DEFAULT 0,
  next_retry_at INTEGER DEFAULT 0,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','syncing','synced','failed','conflict')),
  error_message TEXT,
  
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON action_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_entity ON action_queue(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_queue_retry ON action_queue(next_retry_at) WHERE status IN ('pending','conflict');
CREATE INDEX IF NOT EXISTS idx_queue_created ON action_queue(created_at);

-- ============================================================================
-- CONFLICT RESOLUTION HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS conflicts (
  id TEXT PRIMARY KEY,
  
  -- Entity reference
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  
  -- Conflicting data snapshots (JSON strings)
  local_data TEXT,
  server_data TEXT,
  
  -- Resolution metadata
  resolution TEXT CHECK(resolution IN ('server_won','local_kept','merged','discarded')),
  resolved_at INTEGER,
  
  -- Conflict detection
  detected_at INTEGER NOT NULL,
  local_version INTEGER,
  server_version INTEGER,
  local_timestamp INTEGER,
  server_timestamp INTEGER,
  
  -- User notification
  user_notified BOOLEAN DEFAULT 0,
  
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_conflicts_entity ON conflicts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_detected ON conflicts(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_conflicts_resolved ON conflicts(resolution) WHERE resolution IS NOT NULL;

-- ============================================================================
-- USER/PROFILE DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Permissions
  role TEXT DEFAULT 'user',
  
  -- Sync metadata
  synced_at INTEGER DEFAULT 0,
  
  UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_users_synced ON users(synced_at);

-- ============================================================================
-- NOTIFICATION STATE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  
  user_id TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  
  title TEXT NOT NULL,
  body TEXT,
  action_type TEXT,
  
  created_at INTEGER NOT NULL,
  read_at INTEGER,
  
  is_read BOOLEAN DEFAULT 0,
  is_dismissed BOOLEAN DEFAULT 0,
  
  FOREIGN KEY(user_id) REFERENCES users(id),
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- ATTACHMENT METADATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  
  filename TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  
  created_at INTEGER NOT NULL,
  uploaded_at INTEGER,
  
  server_version INTEGER DEFAULT 0,
  synced_at INTEGER DEFAULT 0,
  
  -- Storage reference (not the actual file)
  storage_path TEXT,
  
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_synced ON attachments(synced_at);

-- ============================================================================
-- DEVICE/SESSION STATE
-- ============================================================================

CREATE TABLE IF NOT EXISTS device_state (
  key TEXT PRIMARY KEY,
  
  -- Device info
  device_id TEXT,
  device_name TEXT,
  os_version TEXT,
  app_version TEXT,
  
  -- Session
  session_id TEXT,
  session_start INTEGER,
  last_activity INTEGER,
  
  -- APNs
  device_token TEXT,
  device_token_synced_at INTEGER,
  
  updated_at INTEGER DEFAULT (CAST(strftime('%s','now') * 1000 AS INTEGER))
);

-- ============================================================================
-- BATCH OPERATIONS / TRANSACTIONS
-- ============================================================================

-- Track batch sync operations (for resume/recovery)
CREATE TABLE IF NOT EXISTS batch_sync (
  batch_id TEXT PRIMARY KEY,
  
  entity_type TEXT NOT NULL,
  total_count INTEGER,
  synced_count INTEGER,
  
  started_at INTEGER,
  completed_at INTEGER,
  
  status TEXT CHECK(status IN ('in_progress','completed','failed'))
);

CREATE INDEX IF NOT EXISTS idx_batch_status ON batch_sync(status);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Pending approvals for current user
CREATE VIEW IF NOT EXISTS pending_approvals_for_user AS
SELECT
  ba.id,
  ba.briefing_id,
  b.title as briefing_title,
  b.author_id,
  b.created_at,
  p.name as project_name,
  ba.status,
  ba.approval_order
FROM briefing_approvals ba
JOIN briefings b ON ba.briefing_id = b.id
JOIN projects p ON b.project_id = p.id
WHERE ba.status = 'pending'
  AND b.is_deleted = 0
  AND p.is_deleted = 0
ORDER BY ba.approval_order, b.created_at DESC;

-- Tasks by status
CREATE VIEW IF NOT EXISTS tasks_by_status AS
SELECT
  status,
  COUNT(*) as count,
  SUM(CASE WHEN assigned_to IS NOT NULL THEN 1 ELSE 0 END) as assigned_count
FROM tasks
WHERE is_deleted = 0
GROUP BY status;

-- Sync health summary
CREATE VIEW IF NOT EXISTS sync_health AS
SELECT
  (SELECT COUNT(*) FROM action_queue WHERE status = 'pending') as pending_actions,
  (SELECT COUNT(*) FROM action_queue WHERE status = 'failed') as failed_actions,
  (SELECT COUNT(*) FROM conflicts WHERE resolution IS NULL) as unresolved_conflicts,
  (SELECT value FROM sync_state WHERE key = 'online_status') as online_status,
  (SELECT value FROM sync_state WHERE key = 'ws_connected') as ws_connected,
  (SELECT value FROM sync_state WHERE key = 'last_full_sync') as last_full_sync;

-- ============================================================================
-- INITIALIZATION & TRIGGERS
-- ============================================================================

-- Auto-update updated_at on record modification
CREATE TRIGGER IF NOT EXISTS trigger_projects_update
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
  UPDATE projects SET updated_at = CAST(strftime('%s','now') * 1000 AS INTEGER)
  WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;

CREATE TRIGGER IF NOT EXISTS trigger_tasks_update
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
  UPDATE tasks SET updated_at = CAST(strftime('%s','now') * 1000 AS INTEGER)
  WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;

CREATE TRIGGER IF NOT EXISTS trigger_briefings_update
AFTER UPDATE ON briefings
FOR EACH ROW
BEGIN
  UPDATE briefings SET updated_at = CAST(strftime('%s','now') * 1000 AS INTEGER)
  WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;

-- ============================================================================
-- MIGRATION: Web State Import
-- ============================================================================

-- Helper function to detect if import is needed
-- SELECT has_import_needed() to check
CREATE VIEW IF NOT EXISTS import_status AS
SELECT
  CASE 
    WHEN (SELECT value FROM metadata WHERE key = 'import_complete') = 'true'
    THEN 0
    ELSE 1
  END as import_needed;

-- ============================================================================
-- ANALYSIS QUERIES
-- ============================================================================

-- Get sync lag for all entities
SELECT 'tasks' as entity_type, COUNT(*) as count, MAX(synced_at) as last_sync
FROM tasks WHERE synced_at > 0
UNION ALL
SELECT 'briefings', COUNT(*), MAX(synced_at)
FROM briefings WHERE synced_at > 0
UNION ALL
SELECT 'briefing_approvals', COUNT(*), MAX(synced_at)
FROM briefing_approvals WHERE synced_at > 0;

-- Identify conflict hotspots
SELECT entity_type, entity_id, COUNT(*) as conflict_count
FROM conflicts
WHERE resolution IS NULL
GROUP BY entity_type, entity_id
ORDER BY conflict_count DESC;

-- Action queue backlog
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(retry_count) as max_retries
FROM action_queue
GROUP BY status;

-- Pending actions for user
SELECT 
  a.entity_type,
  a.entity_id,
  a.action,
  a.retry_count,
  a.status,
  a.created_at
FROM action_queue a
WHERE a.status IN ('pending', 'failed', 'conflict')
ORDER BY a.created_at DESC;

-- ============================================================================
-- MAINTENANCE PROCEDURES
-- ============================================================================

-- Cleanup: Remove soft-deleted entities older than 30 days
-- DELETE FROM tasks WHERE is_deleted = 1 AND updated_at < (strftime('%s','now') * 1000) - (30 * 24 * 60 * 60 * 1000);

-- Cleanup: Remove resolved conflicts older than 7 days
-- DELETE FROM conflicts WHERE resolution IS NOT NULL AND resolved_at < (strftime('%s','now') * 1000) - (7 * 24 * 60 * 60 * 1000);

-- Cleanup: Archive successful actions older than 7 days
-- DELETE FROM action_queue WHERE status = 'synced' AND synced_at < (strftime('%s','now') * 1000) - (7 * 24 * 60 * 60 * 1000);

-- ============================================================================
-- DATABASE MAINTENANCE & INTEGRITY
-- ============================================================================

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Set WAL mode for better concurrent access
PRAGMA journal_mode = WAL;

-- Set reasonable page size
PRAGMA page_size = 4096;

-- Set cache size (in KB)
PRAGMA cache_size = 10000;

-- Synchronous mode: FULL for safety, NORMAL for speed
-- (Use NORMAL in production after stable launch)
PRAGMA synchronous = FULL;

-- Optimize for iOS app (small database)
PRAGMA temp_store = MEMORY;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
