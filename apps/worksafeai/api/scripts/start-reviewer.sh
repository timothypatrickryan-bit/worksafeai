#!/bin/bash

# Start the Opus review scheduler in background
# Usage: bash scripts/start-reviewer.sh

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_DIR/logs"

mkdir -p "$LOG_DIR"

# Kill existing reviewer if running
pkill -f "review-scheduler.js" || true

# Start new reviewer in background
nohup node "$PROJECT_DIR/scripts/review-scheduler.js" > "$LOG_DIR/reviewer.log" 2>&1 &

REVIEWER_PID=$!
echo "✓ Opus Review Scheduler started (PID: $REVIEWER_PID)"
echo "  Log file: $LOG_DIR/reviewer.log"
echo ""
echo "To stop the scheduler:"
echo "  kill $REVIEWER_PID"
echo "  or"
echo "  pkill -f 'review-scheduler.js'"
