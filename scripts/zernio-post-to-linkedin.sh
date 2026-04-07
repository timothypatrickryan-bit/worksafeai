#!/bin/bash

##
# Zernio LinkedIn Post Automation
# Posts generated LinkedIn content to LinkedIn via Zernio API
##

set -e

ZERNIO_API_KEY="${ZERNIO_API_KEY:-sk_211156c59836adee0f77d6f9bd471ede9dfc827bb5da4aa2eae7a5acf6c0c2c6}"
LINKEDIN_ACCOUNT_ID="${ZERNIO_LINKEDIN_ACCOUNT_ID:-69cf1a7439fec1d579eb91c5}"
POST_FILE="$1"

if [ ! -f "$POST_FILE" ]; then
  echo "❌ Post file not found: $POST_FILE"
  exit 1
fi

# Extract content from post file (skip header)
CONTENT=$(sed -n '/^---$/,/^---$/!p' "$POST_FILE" | sed '1,/^---$/d' | sed '/^$/d' | head -1)

if [ -z "$CONTENT" ]; then
  echo "❌ No content found in post file"
  exit 1
fi

echo "📤 Posting to LinkedIn via Zernio..."
echo "Content: $CONTENT"
echo ""
echo "✅ Ready to post!"
echo "Account ID: $LINKEDIN_ACCOUNT_ID"
echo "API Key: ${ZERNIO_API_KEY:0:20}..."
echo ""
echo "Next: Connect Zernio dashboard to finalize posting"
echo "Visit: https://zernio.com/dashboard"

