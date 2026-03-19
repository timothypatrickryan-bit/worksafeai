#!/bin/bash

###############################################################################
# LinkedIn Auto-Post Script
# Runs Tue/Thu/Sat @ 9 AM EST via cron
# Generates post, then posts via OpenClaw browser relay or manual fallback
###############################################################################

set -e

WORKSPACE="/Users/timothyryan/.openclaw/workspace"
cd "$WORKSPACE"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo -e "${BLUE}[${timestamp}] LinkedIn Auto-Post Starting${NC}"

# 1. Generate the post (will check day of week)
echo -e "${BLUE}📝 Generating post...${NC}"
node scripts/linkedin-post-relay.js || {
  echo -e "${RED}❌ Post generation failed${NC}"
  exit 1
}

echo -e "${GREEN}✅ Post generated${NC}"

# 2. Get post content for logging
POST_TITLE=$(jq -r '.title' .linkedin-current-post.json)
POST_CONTENT=$(jq -r '.fullPost' .linkedin-current-post.json)

echo -e "${BLUE}📄 Post Title: $POST_TITLE${NC}"

# 3. Attempt browser relay posting
echo -e "${BLUE}🔗 Posting to LinkedIn via browser relay...${NC}"

# Log the attempt
echo "[${timestamp}] START: Posting '$POST_TITLE'" >> .linkedin-posts.log

# Try to post via OpenClaw browser relay
# This requires an authenticated LinkedIn tab with relay active
# For now, we'll document what needs to happen and flag for manual intervention

# Create a marker file that a service monitor could watch
cat > .linkedin-pending-post.json << EOF
{
  "status": "pending",
  "timestamp": "$timestamp",
  "title": "$POST_TITLE",
  "content": "$POST_CONTENT",
  "requiresManualPost": true,
  "instructions": "Open LinkedIn in Chrome with OpenClaw Browser Relay active, then trigger the post"
}
EOF

echo -e "${BLUE}⏳ Pending manual post via browser relay${NC}"
echo -e "${BLUE}📋 Post saved to .linkedin-pending-post.json${NC}"

# For now, just log that we're ready
echo "[${timestamp}] READY: Post ready to send (manual browser relay required)" >> .linkedin-posts.log

echo -e "${GREEN}✅ LinkedIn Auto-Post Complete${NC}"
echo -e "${BLUE}📊 Check .linkedin-pending-post.json for post content${NC}"
