#!/bin/bash
# Restore mission control state from backup
# Usage: ./restore-state.sh [backup-filename or date]
# Examples:
#   ./restore-state.sh state-20260318-205301.json
#   ./restore-state.sh 20260318   (will find latest backup for that date)

set -e

WORKSPACE_DIR="/Users/timothyriam/.openclaw/workspace"
BACKUP_DIR="$WORKSPACE_DIR/backups/mission-control-state"
STATE_FILE="$WORKSPACE_DIR/.mission-control-state.json"

if [ -z "$1" ]; then
  echo "Usage: $0 [backup-filename or date pattern]"
  echo ""
  echo "Available backups:"
  ls -lh "$BACKUP_DIR"/state-*.json 2>/dev/null | tail -10 || echo "No backups found"
  exit 1
fi

# Find the backup file
BACKUP_FILE=""
if [ -f "$BACKUP_DIR/$1" ]; then
  BACKUP_FILE="$BACKUP_DIR/$1"
elif [ -f "$BACKUP_DIR/state-$1"*.json ]; then
  # If given date pattern, get the latest for that date
  BACKUP_FILE=$(ls -t "$BACKUP_DIR/state-$1"*.json 2>/dev/null | head -1)
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup not found: $1"
  echo ""
  echo "Available backups:"
  ls -lh "$BACKUP_DIR"/state-*.json 2>/dev/null | tail -10 || echo "No backups found"
  exit 1
fi

# Create safety backup of current state
SAFETY_BACKUP="$BACKUP_DIR/state-RESTORE-SAFETY-$(date +%Y%m%d-%H%M%S).json"
cp "$STATE_FILE" "$SAFETY_BACKUP"
echo "💾 Safety backup created: $SAFETY_BACKUP"

# Restore the backup
cp "$BACKUP_FILE" "$STATE_FILE"
echo "✅ State restored from: $(basename $BACKUP_FILE)"
echo ""
echo "⚠️  Remember to restart Mission Control:"
echo "   pkill -f 'npm start'"
echo "   cd $WORKSPACE_DIR/apps/mission-control && npm start"

exit 0
