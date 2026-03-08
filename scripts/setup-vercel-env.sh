#!/bin/bash
set -e

# Vercel Environment Setup Script
# Usage: ./scripts/setup-vercel-env.sh <APP_NAME> <ENV_FILE>
# Example: ./scripts/setup-vercel-env.sh worksafeai apps/worksafeai/api/.env.production

APP_NAME=$1
ENV_FILE=$2
VERCEL_TOKEN=${VERCEL_TOKEN:-}

if [ -z "$APP_NAME" ] || [ -z "$ENV_FILE" ]; then
  echo "❌ Usage: $0 <APP_NAME> <ENV_FILE>"
  echo "Example: $0 worksafeai apps/worksafeai/api/.env.production"
  exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN environment variable not set"
  echo "Set it with: export VERCEL_TOKEN=vcp_xxxxx"
  exit 1
fi

# Determine project type (api or web)
if [[ $ENV_FILE == *"/api/"* ]]; then
  PROJECT_TYPE="api"
elif [[ $ENV_FILE == *"/web/"* ]]; then
  PROJECT_TYPE="web"
else
  echo "❌ Error: Can't determine project type from path"
  exit 1
fi

# Get project ID from .vercel/project.json
PROJECT_DIR=$(dirname "$ENV_FILE")/..
VERCEL_JSON="$PROJECT_DIR/.vercel/project.json"

if [ ! -f "$VERCEL_JSON" ]; then
  echo "❌ Error: .vercel/project.json not found at $VERCEL_JSON"
  echo "Did you deploy to Vercel yet?"
  echo "Run: cd $PROJECT_DIR && vercel deploy --prod"
  exit 1
fi

# Extract project ID (works with or without jq)
PROJECT_ID=$(grep -o '"projectId":"[^"]*"' "$VERCEL_JSON" | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Could not extract projectId from $VERCEL_JSON"
  exit 1
fi

echo "📦 Setting environment variables for $APP_NAME ($PROJECT_TYPE)"
echo "   Project ID: $PROJECT_ID"
echo "   Config file: $ENV_FILE"
echo ""

# Counter for tracking
VARS_SET=0
VARS_FAILED=0

# Read env file and set each variable
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ $key == \#* ]] && continue
  [[ -z $key ]] && continue
  
  # Trim whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)

  # Remove quotes if present
  value="${value%\"}"
  value="${value#\"}"

  if [ -z "$value" ]; then
    echo "⚠️  Skipping empty value for: $key"
    continue
  fi

  echo -n "→ Setting $key... "
  
  RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
    -d "{\"key\":\"$key\",\"value\":\"$value\",\"type\":\"plain\",\"target\":[\"production\"]}")
  
  # Check if response contains error
  if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌"
    echo "   Error: $RESPONSE"
    ((VARS_FAILED++))
  else
    echo "✅"
    ((VARS_SET++))
  fi
  
done < "$ENV_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Complete: Set $VARS_SET variables"

if [ $VARS_FAILED -gt 0 ]; then
  echo "❌ Failed: $VARS_FAILED variables"
  exit 1
fi

echo ""
echo "Next steps:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Check that variables appear in project settings"
echo "3. (Optional) Trigger a new deployment"
