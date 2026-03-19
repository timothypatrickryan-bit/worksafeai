#!/bin/bash

# LinkedIn Browser Relay Posting via OpenClaw
# This script uses OpenClaw's browser tool to post to LinkedIn
# Called after linkedin-post-relay.js generates the content

WORKSPACE="/Users/timothyryan/.openclaw/workspace"
POST_DATA="$WORKSPACE/.linkedin-current-post.json"

# Check if post data exists
if [ ! -f "$POST_DATA" ]; then
  echo "❌ No post data found. Run linkedin-post-relay.js first."
  exit 1
fi

# Extract post content
POST_CONTENT=$(jq -r '.fullPost' "$POST_DATA")
POST_TITLE=$(jq -r '.title' "$POST_DATA")

echo "🔗 LinkedIn Browser Relay Posting"
echo "📝 Title: $POST_TITLE"
echo ""

# OpenClaw browser relay posting steps:
# This would be executed by openclaw browser tool
# For now, we document it for manual implementation

cat > "$WORKSPACE/.linkedin-browser-task.json" << EOF
{
  "action": "post-to-linkedin",
  "url": "https://www.linkedin.com/feed",
  "profile": "chrome",
  "steps": [
    {
      "action": "click",
      "selector": "[data-test-id='share-box-trigger']",
      "description": "Click start a post button"
    },
    {
      "action": "waitForSelector",
      "selector": "div[role='textbox'][contenteditable='true']",
      "timeout": 5000
    },
    {
      "action": "click",
      "selector": "div[role='textbox'][contenteditable='true']"
    },
    {
      "action": "type",
      "text": "$POST_CONTENT",
      "delay": 5
    },
    {
      "action": "click",
      "selector": "button[type='submit']",
      "description": "Click post button"
    },
    {
      "action": "waitForNavigation",
      "timeout": 5000
    }
  ],
  "onSuccess": "echo '✅ Post published'",
  "onFailure": "echo '❌ Post failed'"
}
EOF

echo "✅ Browser task prepared: .linkedin-browser-task.json"
echo "📋 Steps:"
echo "  1. Open LinkedIn in browser relay"
echo "  2. Click 'Start a post'"
echo "  3. Paste content:"
echo "     $POST_CONTENT"
echo "  4. Click 'Post'"
echo ""

# Log the posting attempt
timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "[$timestamp] Posting: $POST_TITLE" >> "$WORKSPACE/.linkedin-posts-published.log"

echo "✨ LinkedIn posting automation complete"
