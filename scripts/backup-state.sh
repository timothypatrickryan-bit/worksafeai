#!/bin/bash
# Backup mission control state file every 6 hours
# Run via cron or OpenClaw scheduler

set -e

WORKSPACE_DIR="/Users/timothyryan/.openclaw/workspace"
STATE_FILE="$WORKSPACE_DIR/.mission-control-state.json"
BACKUP_DIR="$WORKSPACE_DIR/backups/mission-control-state"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/state-$TIMESTAMP.json"

# Check if state file exists
if [ ! -f "$STATE_FILE" ]; then
  echo "❌ State file not found: $STATE_FILE"
  exit 1
fi

# Create backup
cp "$STATE_FILE" "$BACKUP_FILE"
echo "✅ State backup created: $BACKUP_FILE"

# Keep only last 30 days of backups (720 hours / 6 hours per backup = 120 files max)
# Remove backups older than 30 days
find "$BACKUP_DIR" -name "state-*.json" -mtime +30 -delete 2>/dev/null || true

# Log the backup
echo "[$(date '+%Y-%m-%d %H:%M:%S')] State backup created: $BACKUP_FILE" >> "$BACKUP_DIR/backup.log"

# Show backup count
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/state-*.json 2>/dev/null | wc -l)
echo "📦 Total backups: $BACKUP_COUNT (keeping last 30 days)"

exit 0
