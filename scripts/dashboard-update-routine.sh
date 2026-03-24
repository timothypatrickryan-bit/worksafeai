#!/bin/bash

# Dashboard Update Routine
# 
# Integrates:
# 1. Periodic refresh daemon (updates every 5 minutes)
# 2. Event listener (triggers on work completion)
# 3. Heartbeat integration (updates on heartbeat)
# 4. On-demand refresh (manual trigger)
#
# Usage:
#   ./dashboard-update-routine.sh --start    (start both daemons)
#   ./dashboard-update-routine.sh --stop     (stop both daemons)
#   ./dashboard-update-routine.sh --refresh  (manual refresh now)
#   ./dashboard-update-routine.sh --status   (check status)

set -e

WORKSPACE="/Users/timothyryan/.openclaw/workspace"
DAEMON_PID_FILE="$WORKSPACE/.dashboard-daemon.pid"
LISTENER_PID_FILE="$WORKSPACE/.dashboard-listener.pid"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

start_daemons() {
  log "🚀 Starting dashboard update services..."
  
  # Start refresh daemon
  log "Starting refresh daemon (5-minute intervals)..."
  nohup node "$WORKSPACE/scripts/dashboard-refresh-daemon.js" --daemon > "$WORKSPACE/.dashboard-daemon.log" 2>&1 &
  echo $! > "$DAEMON_PID_FILE"
  log "✅ Refresh daemon started (PID: $(cat $DAEMON_PID_FILE))"
  
  # Start event listener
  log "Starting event listener (30-second checks)..."
  nohup node "$WORKSPACE/scripts/dashboard-event-listener.js" --daemon > "$WORKSPACE/.dashboard-listener.log" 2>&1 &
  echo $! > "$LISTENER_PID_FILE"
  log "✅ Event listener started (PID: $(cat $LISTENER_PID_FILE))"
  
  log "✅ All services started. Dashboard will auto-update:"
  log "   - Every 5 minutes (refresh daemon)"
  log "   - On significant events (event listener)"
  log "   - On heartbeat (integration)"
}

stop_daemons() {
  log "🛑 Stopping dashboard update services..."
  
  if [ -f "$DAEMON_PID_FILE" ]; then
    PID=$(cat "$DAEMON_PID_FILE")
    if kill $PID 2>/dev/null; then
      log "✅ Refresh daemon stopped"
    fi
    rm -f "$DAEMON_PID_FILE"
  fi
  
  if [ -f "$LISTENER_PID_FILE" ]; then
    PID=$(cat "$LISTENER_PID_FILE")
    if kill $PID 2>/dev/null; then
      log "✅ Event listener stopped"
    fi
    rm -f "$LISTENER_PID_FILE"
  fi
  
  log "✅ All services stopped"
}

refresh_now() {
  log "🔄 Triggering immediate dashboard refresh..."
  node "$WORKSPACE/scripts/dashboard-refresh-daemon.js"
}

check_status() {
  log "📊 Dashboard Service Status:"
  
  if [ -f "$DAEMON_PID_FILE" ]; then
    PID=$(cat "$DAEMON_PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
      log "✅ Refresh daemon: RUNNING (PID: $PID)"
    else
      log "❌ Refresh daemon: STOPPED (stale PID: $PID)"
    fi
  else
    log "⏸️ Refresh daemon: NOT STARTED"
  fi
  
  if [ -f "$LISTENER_PID_FILE" ]; then
    PID=$(cat "$LISTENER_PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
      log "✅ Event listener: RUNNING (PID: $PID)"
    else
      log "❌ Event listener: STOPPED (stale PID: $PID)"
    fi
  else
    log "⏸️ Event listener: NOT STARTED"
  fi
  
  log ""
  log "📋 Recent activity:"
  tail -3 "$WORKSPACE/.dashboard-refresh.log" 2>/dev/null || echo "No refresh activity yet"
}

case "${1:-}" in
  --start)
    start_daemons
    ;;
  --stop)
    stop_daemons
    ;;
  --refresh)
    refresh_now
    ;;
  --status)
    check_status
    ;;
  *)
    echo "Dashboard Update Routine"
    echo ""
    echo "Usage: $0 [--start|--stop|--refresh|--status]"
    echo ""
    echo "Commands:"
    echo "  --start    Start both daemons (refresh + event listener)"
    echo "  --stop     Stop both daemons"
    echo "  --refresh  Manually trigger dashboard refresh now"
    echo "  --status   Check daemon status"
    echo ""
    echo "Auto-Update Strategy:"
    echo "  ✅ Periodic (every 5 minutes) - catches all progress changes"
    echo "  ✅ Event-driven (on completion) - immediate updates"
    echo "  ✅ Heartbeat integrated - updates on every heartbeat"
    exit 1
    ;;
esac
