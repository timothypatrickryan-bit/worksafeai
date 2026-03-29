#!/bin/bash

# Install Memory Consolidation Automation
# Creates launchd job to run daily @ 10 PM EST

PLIST_FILE="$HOME/Library/LaunchAgents/com.openclaw.consolidate-memory.plist"
SCRIPT_FILE="/Users/timothyryan/.openclaw/workspace/scripts/consolidate-memory.js"
LOG_FILE="/Users/timothyryan/.openclaw/workspace/.memory-consolidation.log"

echo "🚀 Installing Memory Consolidation Automation..."
echo ""

# Create LaunchAgent plist
cat > "$PLIST_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openclaw.consolidate-memory</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/timothyryan/.openclaw/workspace/scripts/consolidate-memory.js</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>22</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/timothyryan/.openclaw/workspace/.memory-consolidation.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/timothyryan/.openclaw/workspace/.memory-consolidation-error.log</string>
</dict>
</plist>
EOF

echo "✅ Created plist: $PLIST_FILE"

# Load the job
if launchctl load "$PLIST_FILE" 2>/dev/null; then
  echo "✅ Loaded launchd job: com.openclaw.consolidate-memory"
else
  # Job might already be loaded, try unloading first
  launchctl unload "$PLIST_FILE" 2>/dev/null
  launchctl load "$PLIST_FILE"
  echo "✅ Reloaded launchd job: com.openclaw.consolidate-memory"
fi

echo ""
echo "⏰ Schedule: Daily @ 10:00 PM EST"
echo "📝 Log: $LOG_FILE"
echo "📝 Error log: ${LOG_FILE%-.*}-error.log"
echo ""
echo "✅ Installation complete!"
echo ""
echo "🔍 Verify installation:"
echo "   launchctl list | grep consolidate-memory"
echo ""
echo "📖 View logs:"
echo "   tail -f $LOG_FILE"
echo ""
echo "✋ Uninstall (if needed):"
echo "   launchctl unload '$PLIST_FILE'"
