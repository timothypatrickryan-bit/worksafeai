#!/bin/bash
# Mission Control Production Server (Stable build)
# Usage: ./mission-control-prod.sh [start|stop|restart|rebuild]

MC_DIR="/Users/timothyryan/.openclaw/workspace/apps/mission-control"
LOG_FILE="/Users/timothyryan/.openclaw/workspace/.mc-prod.log"
PID_FILE="/tmp/mc-prod.pid"
DEV_PID="/tmp/mc-dev.pid"
PORT=3001

start_prod() {
  # Check if dev is running
  if [ -f "$DEV_PID" ] && ps -p "$(cat $DEV_PID)" > /dev/null 2>&1; then
    echo "⚠️  Warning: Dev server is still running on port 3000"
    echo "   You can have both, but typically use one at a time."
  fi
  
  if [ -f "$PID_FILE" ]; then
    existing_pid=$(cat "$PID_FILE")
    if ps -p "$existing_pid" > /dev/null 2>&1; then
      echo "⚠️  Prod server already running (PID: $existing_pid) on port $PORT"
      return 1
    fi
  fi
  
  echo "🚀 Starting Mission Control PROD server on port $PORT..."
  cd "$MC_DIR"
  PORT=$PORT npm start > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  
  echo "✅ Prod server starting (PID: $(cat $PID_FILE))"
  echo "📝 Logs: tail -f $LOG_FILE"
  echo "🌐 URL: http://localhost:$PORT"
  echo ""
  echo "⏳ Waiting for startup (~10 seconds)..."
  
  for i in {1..20}; do
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
      echo "✨ Prod server ready!"
      return 0
    fi
    sleep 1
  done
  
  echo "⚠️  Server may still be starting. Check logs: tail -f $LOG_FILE"
  return 0
}

stop_prod() {
  if [ -f "$PID_FILE" ]; then
    pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null 2>&1; then
      kill $pid
      rm "$PID_FILE"
      echo "✅ Prod server stopped (PID: $pid)"
      return 0
    fi
  fi
  
  echo "⚠️  Prod server not running"
  return 1
}

rebuild_prod() {
  echo "🔨 Building production bundle..."
  cd "$MC_DIR"
  
  # Clean old build
  rm -rf .next
  
  # Build
  if npm run build > "$LOG_FILE" 2>&1; then
    echo "✅ Build complete"
    return 0
  else
    echo "❌ Build failed. Check logs: cat $LOG_FILE"
    return 1
  fi
}

restart_prod() {
  echo "🔄 Restarting prod server..."
  stop_prod
  sleep 2
  start_prod
}

case "${1:-start}" in
  start)
    start_prod
    ;;
  stop)
    stop_prod
    ;;
  restart)
    restart_prod
    ;;
  rebuild)
    rebuild_prod
    ;;
  *)
    echo "Usage: $0 [start|stop|restart|rebuild]"
    exit 1
    ;;
esac
