#!/bin/bash

# LinkedIn Full Automation with Browser Relay
# Generates post and sends via OpenClaw browser relay
# Usage: Called by cron/LaunchAgent on Tue/Thu/Sat @ 9:00 AM EST

WORKSPACE="/Users/timothyryan/.openclaw/workspace"
POST_GENERATOR="$WORKSPACE/scripts/linkedin-post-relay.js"
POST_DATA="$WORKSPACE/.linkedin-current-post.json"

cd "$WORKSPACE"

echo "🚀 LinkedIn Automation Started"
echo "📅 $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo ""

# Step 1: Generate the post
echo "📝 Generating post content..."
node "$POST_GENERATOR"

if [ ! -f "$POST_DATA" ]; then
  echo "❌ Error: Post generation failed"
  exit 1
fi

# Step 2: Extract post content for relay
POST_CONTENT=$(jq -r '.fullPost' "$POST_DATA")
POST_TITLE=$(jq -r '.title' "$POST_DATA")

echo ""
echo "✅ Post ready:"
echo "   Title: $POST_TITLE"
echo "   Length: ${#POST_CONTENT} chars"
echo ""

# Step 3: Log that automation ran
echo "✨ Automation complete - post ready for browser relay"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] GENERATED: $POST_TITLE" >> "$WORKSPACE/.linkedin-automation.log"

exit 0
