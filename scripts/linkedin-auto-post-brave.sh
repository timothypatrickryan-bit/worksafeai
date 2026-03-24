#!/bin/bash

# LinkedIn Auto-Post with Brave Search Integration
# Triggered by launchd (Tue/Thu/Sat @ 9 AM EST)

WORKSPACE="/Users/timothyryan/.openclaw/workspace"
NODE_ENV="production"

# Load environment
if [ -f "$WORKSPACE/.env" ]; then
  export $(cat "$WORKSPACE/.env" | grep -v '^#' | xargs)
fi

# Determine which post type to use (rotate: insight → trending → insight)
if [ -f "$WORKSPACE/.linkedin-current-post.json" ]; then
  LAST_TYPE=$(jq -r '.type' "$WORKSPACE/.linkedin-current-post.json" 2>/dev/null)
else
  LAST_TYPE="trending"
fi

if [ "$LAST_TYPE" = "trending" ]; then
  POST_TYPE="insight"
else
  POST_TYPE="trending"
fi

echo "[$(date)] 🚀 LinkedIn Auto-Post Starting (Type: $POST_TYPE)" >> "$WORKSPACE/.linkedin-launchd.log"

# Generate post with Brave Search
cd "$WORKSPACE"
node scripts/linkedin-post-now-brave.js "$POST_TYPE" 2>> "$WORKSPACE/.linkedin-launchd-error.log"

if [ $? -eq 0 ]; then
  echo "[$(date)] ✅ Post generated successfully" >> "$WORKSPACE/.linkedin-launchd.log"
  
  # Log the post content
  jq -r '.fullPost' "$WORKSPACE/.linkedin-current-post.json" >> "$WORKSPACE/.linkedin-posts-published.log" 2>/dev/null
  echo "---" >> "$WORKSPACE/.linkedin-posts-published.log"
else
  echo "[$(date)] ⚠️ Post generation completed (with fallback)" >> "$WORKSPACE/.linkedin-launchd.log"
fi

echo "[$(date)] 🏁 LinkedIn Auto-Post Complete" >> "$WORKSPACE/.linkedin-launchd.log"
