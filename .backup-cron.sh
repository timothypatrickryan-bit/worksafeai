#!/bin/bash
# OpenClaw cron job for automated backups
# This script runs on OpenClaw's cron scheduler

# Run state backup every 6 hours
/Users/timothyryan/.openclaw/workspace/scripts/backup-state.sh

# Run app backup daily at 2 AM (only keep 7 days to save space)
HOUR=$(date +%H)
if [ "$HOUR" = "02" ]; then
  /Users/timothyryan/.openclaw/workspace/scripts/backup-app.sh
fi

exit 0
