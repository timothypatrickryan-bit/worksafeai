#!/bin/bash
# Mission Control Development Server (Auto-rebuild on file changes)
# Usage: ./mission-control-dev.sh [start|stop|restart]

MC_DIR="/Users/timothyryan/.openclaw/workspace/apps/mission-control"
LOG_FILE="/Users/timothyryan/.openclaw/workspace/.mc-dev.log"
PID_FILE="/tmp/mc-dev.pid"

start_dev() {
  if [ -f "$PID_FILE" ]; then
    existing_pid=$(cat "$PID_FILE")
    if ps -p "$existing_pid" > /dev/null 2>&1; then
      echo "⚠️  Dev server already running (PID: $existing_pid)"
      return 1
    fi
  fi
  
  echo "🚀 Starting Mission Control DEV server on port 3000..."
  cd "$MC_DIR"
  echo "🔨 Building from source (one-time)..."
  npm run build > "$LOG_FILE" 2>&1
  echo "✅ Build complete. Starting server..."
  PORT=3000 npm start > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  
  echo "✅ Dev server starting (PID: $(cat $PID_FILE))"
  echo "📝 Logs: tail -f $LOG_FILE"
  echo "🌐 URL: http://localhost:3000"
  echo ""
  echo "⏳ Waiting for build (~30 seconds)..."
  sleep 5
  tail -f "$LOG_FILE" &
  TAIL_PID=$!
  
  # Wait for "ready" message
  for i in {1..60}; do
    if grep -q "ready - started server on" "$LOG_FILE"; then
      echo "✨ Dev server ready!"
      kill $TAIL_PID 2>/dev/null
      return 0
    fi
    sleep 1
  done
  
  return 1
}

stop_dev() {
  if [ -f "$PID_FILE" ]; then
    pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null 2>&1; then
      kill $pid
      rm "$PID_FILE"
      echo "✅ Dev server stopped (PID: $pid)"
      return 0
    fi
  fi
  
  echo "⚠️  Dev server not running"
  return 1
}

restart_dev() {
  echo "🔄 Restarting dev server..."
  stop_dev
  sleep 2
  start_dev
}

case "${1:-start}" in
  start)
    start_dev
    ;;
  stop)
    stop_dev
    ;;
  restart)
    restart_dev
    ;;
  *)
    echo "Usage: $0 [start|stop|restart]"
    exit 1
    ;;
esac
