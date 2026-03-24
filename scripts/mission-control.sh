#!/bin/bash
# Mission Control - Unified Dev + Prod Management
# Usage: ./mission-control.sh [dev|prod] [start|stop|restart|rebuild|status|logs]

MC_DIR="/Users/timothyryan/.openclaw/workspace/apps/mission-control"
SCRIPTS_DIR="/Users/timothyryan/.openclaw/workspace/scripts"
MC_DEV_LOG="/Users/timothyryan/.openclaw/workspace/.mc-dev.log"
MC_PROD_LOG="/Users/timothyryan/.openclaw/workspace/.mc-prod.log"
MC_DEV_PID="/tmp/mc-dev.pid"
MC_PROD_PID="/tmp/mc-prod.pid"

print_header() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║         Mission Control - Dev & Prod Management                ║"
  echo "╠════════════════════════════════════════════════════════════════╣"
  echo "║ DEV (3000):  Auto-rebuild on file changes — for development   ║"
  echo "║ PROD (3001): Stable build — for real work                     ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
}

print_status() {
  echo "📊 STATUS:"
  echo ""
  
  # Check dev
  if [ -f "$MC_DEV_PID" ] && ps -p "$(cat $MC_DEV_PID)" > /dev/null 2>&1; then
    echo "  ✅ DEV  (3000): Running (PID $(cat $MC_DEV_PID))"
  else
    echo "  ❌ DEV  (3000): Stopped"
  fi
  
  # Check prod
  if [ -f "$MC_PROD_PID" ] && ps -p "$(cat $MC_PROD_PID)" > /dev/null 2>&1; then
    echo "  ✅ PROD (3001): Running (PID $(cat $MC_PROD_PID))"
  else
    echo "  ❌ PROD (3001): Stopped"
  fi
  
  echo ""
}

print_usage() {
  print_header
  print_status
  
  echo "USAGE:"
  echo "  ./mission-control.sh [env] [command]"
  echo ""
  echo "ENVIRONMENTS:"
  echo "  dev              Development server (auto-rebuild)"
  echo "  prod             Production server (stable)"
  echo "  all              Both servers"
  echo ""
  echo "COMMANDS:"
  echo "  start            Start server(s)"
  echo "  stop             Stop server(s)"
  echo "  restart          Restart server(s)"
  echo "  rebuild          Rebuild production (prod only)"
  echo "  status           Show server status"
  echo "  logs             Tail logs"
  echo ""
  echo "EXAMPLES:"
  echo "  ./mission-control.sh dev start     # Start dev server"
  echo "  ./mission-control.sh prod logs     # Tail prod logs"
  echo "  ./mission-control.sh all restart   # Restart both"
  echo "  ./mission-control.sh prod rebuild  # Rebuild prod"
  echo ""
}

dev_command() {
  case "$1" in
    start)
      bash "$SCRIPTS_DIR/mission-control-dev.sh" start
      ;;
    stop)
      bash "$SCRIPTS_DIR/mission-control-dev.sh" stop
      ;;
    restart)
      bash "$SCRIPTS_DIR/mission-control-dev.sh" restart
      ;;
    logs)
      tail -f "$MC_DEV_LOG"
      ;;
    *)
      echo "Unknown command: $1"
      exit 1
      ;;
  esac
}

prod_command() {
  case "$1" in
    start)
      bash "$SCRIPTS_DIR/mission-control-prod.sh" start
      ;;
    stop)
      bash "$SCRIPTS_DIR/mission-control-prod.sh" stop
      ;;
    restart)
      bash "$SCRIPTS_DIR/mission-control-prod.sh" restart
      ;;
    rebuild)
      bash "$SCRIPTS_DIR/mission-control-prod.sh" rebuild
      ;;
    logs)
      tail -f "$MC_PROD_LOG"
      ;;
    *)
      echo "Unknown command: $1"
      exit 1
      ;;
  esac
}

all_command() {
  case "$1" in
    start)
      echo "Starting both servers..."
      bash "$SCRIPTS_DIR/mission-control-dev.sh" start
      sleep 2
      bash "$SCRIPTS_DIR/mission-control-prod.sh" start
      echo ""
      print_status
      ;;
    stop)
      echo "Stopping both servers..."
      bash "$SCRIPTS_DIR/mission-control-dev.sh" stop
      bash "$SCRIPTS_DIR/mission-control-prod.sh" stop
      echo ""
      print_status
      ;;
    restart)
      echo "Restarting both servers..."
      bash "$SCRIPTS_DIR/mission-control-dev.sh" stop
      bash "$SCRIPTS_DIR/mission-control-prod.sh" stop
      sleep 2
      bash "$SCRIPTS_DIR/mission-control-dev.sh" start
      sleep 2
      bash "$SCRIPTS_DIR/mission-control-prod.sh" start
      echo ""
      print_status
      ;;
    *)
      echo "Unknown command for 'all': $1"
      exit 1
      ;;
  esac
}

# Main
if [ $# -eq 0 ]; then
  print_usage
  exit 0
fi

ENV="$1"
CMD="${2:-status}"

case "$ENV" in
  dev)
    dev_command "$CMD"
    ;;
  prod)
    prod_command "$CMD"
    ;;
  all)
    all_command "$CMD"
    ;;
  status)
    print_header
    print_status
    ;;
  *)
    echo "Unknown environment: $ENV"
    echo ""
    print_usage
    exit 1
    ;;
esac
