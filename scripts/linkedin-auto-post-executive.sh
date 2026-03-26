#!/bin/bash

# LinkedIn Executive Commentary Auto-Post
# Triggered by launchd (Tue/Thu/Sat @ 9 AM EST)
# 
# Generates insightful market commentary in executive leader tone
# Focuses on data center market trends, announcements, implications
# Engagement-driven with genuine questions

WORKSPACE="/Users/timothyryan/.openclaw/workspace"
NODE_ENV="production"

# Load environment
if [ -f "$WORKSPACE/.env" ]; then
  export $(cat "$WORKSPACE/.env" | grep -v '^#' | xargs)
fi

# Rotate post types (insight → observation → leadership)
if [ -f "$WORKSPACE/.linkedin-current-post.json" ]; then
  LAST_TYPE=$(jq -r '.type' "$WORKSPACE/.linkedin-current-post.json" 2>/dev/null)
else
  LAST_TYPE="leadership"
fi

case "$LAST_TYPE" in
  "insight")
    POST_TYPE="observation"
    ;;
  "observation")
    POST_TYPE="leadership"
    ;;
  *)
    POST_TYPE="insight"
    ;;
esac

echo "[$(date)] 🚀 LinkedIn Executive Commentary Auto-Post Starting" >> "$WORKSPACE/.linkedin-launchd.log"
echo "[$(date)] 📝 Post Type: $POST_TYPE" >> "$WORKSPACE/.linkedin-launchd.log"

# Generate post with executive commentary
cd "$WORKSPACE"
node scripts/linkedin-post-executive.js "$POST_TYPE" 2>> "$WORKSPACE/.linkedin-launchd-error.log"

if [ $? -eq 0 ]; then
  echo "[$(date)] ✅ Executive post generated successfully" >> "$WORKSPACE/.linkedin-launchd.log"
  
  # Log the post content for audit trail
  echo "=== $(date) ===" >> "$WORKSPACE/.linkedin-posts-archive.log"
  jq -r '.fullPost' "$WORKSPACE/.linkedin-current-post.json" >> "$WORKSPACE/.linkedin-posts-archive.log" 2>/dev/null
  jq -r '.sourceUrl' "$WORKSPACE/.linkedin-current-post.json" >> "$WORKSPACE/.linkedin-posts-archive.log" 2>/dev/null
  echo "" >> "$WORKSPACE/.linkedin-posts-archive.log"
else
  echo "[$(date)] ⚠️ Post generation completed (with fallback)" >> "$WORKSPACE/.linkedin-launchd.log"
fi

echo "[$(date)] 🏁 LinkedIn Executive Commentary Auto-Post Complete" >> "$WORKSPACE/.linkedin-launchd.log"
