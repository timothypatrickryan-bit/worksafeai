#!/bin/bash
# Backup full mission control app before major changes
# Run manually before deployments/rebuilds or via cron daily

set -e

WORKSPACE_DIR="/Users/timothyryan/.openclaw/workspace"
APP_DIR="$WORKSPACE_DIR/apps/mission-control"
BACKUP_DIR="$WORKSPACE_DIR/backups/mission-control-app"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mission-control-$TIMESTAMP.tar.gz"

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
  echo "❌ App directory not found: $APP_DIR"
  exit 1
fi

# Create compressed backup
echo "📦 Creating app backup (this may take a minute)..."
tar -czf "$BACKUP_FILE" "$APP_DIR" 2>/dev/null

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | awk '{print $1}')
echo "✅ App backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Keep only last 7 days of app backups (to save space)
find "$BACKUP_DIR" -name "mission-control-*.tar.gz" -mtime +7 -delete 2>/dev/null || true

# Log the backup
echo "[$(date '+%Y-%m-%d %H:%M:%S')] App backup created: $BACKUP_FILE ($BACKUP_SIZE)" >> "$BACKUP_DIR/backup.log"

# Show backup count
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/mission-control-*.tar.gz 2>/dev/null | wc -l)
echo "📦 Total backups: $BACKUP_COUNT (keeping last 7 days)"

exit 0
