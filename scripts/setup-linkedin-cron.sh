#!/bin/bash

# Setup LinkedIn Post Generation Cron Job
# Runs: Tuesday, Thursday, Saturday @ 9:00 AM EST
# Usage: bash scripts/setup-linkedin-cron.sh

WORKSPACE="/Users/timothyryan/.openclaw/workspace"
SCRIPT="$WORKSPACE/scripts/linkedin-post-telegram.js"

# Create crontab entry (2-digit days: Tuesday=2, Thursday=4, Saturday=6)
# Format: minute hour day month dayOfWeek command

CRON_ENTRY="0 9 * * 2,4,6 cd $WORKSPACE && /usr/bin/node $SCRIPT >> /tmp/linkedin-posts.log 2>&1"

# Check if already installed
if crontab -l 2>/dev/null | grep -q "linkedin-post-telegram"; then
  echo "✅ LinkedIn cron job already installed"
  crontab -l | grep linkedin
else
  echo "📝 Installing LinkedIn cron job..."
  (crontab -l 2>/dev/null || echo "") | { cat; echo "$CRON_ENTRY"; } | crontab -
  echo "✅ Cron job installed successfully"
  echo "   Schedule: Tuesday, Thursday, Saturday @ 9:00 AM EST"
  echo "   Log: /tmp/linkedin-posts.log"
  echo ""
  echo "To verify installation:"
  echo "  crontab -l | grep linkedin"
  echo ""
  echo "To remove:"
  echo "  crontab -e  # and delete the line"
fi
