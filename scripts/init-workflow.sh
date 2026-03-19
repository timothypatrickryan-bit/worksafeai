#!/bin/bash

# Workflow Initialization Script
# Sets up the task workflow automation system

set -e

WORKSPACE="/Users/timothyryan/.openclaw/workspace"
SCRIPTS_DIR="$WORKSPACE/scripts"
WORKFLOW_DIR="$WORKSPACE/.workflow"

echo "🚀 Initializing Task Workflow System..."

# Create directories
echo "📁 Creating directories..."
mkdir -p "$WORKFLOW_DIR"
chmod 755 "$WORKFLOW_DIR"

# Initialize .workflow-state.json if it doesn't exist
if [ ! -f "$WORKSPACE/.workflow-state.json" ]; then
  echo "📝 Initializing workflow state file..."
  cat > "$WORKSPACE/.workflow-state.json" << 'EOF'
{
  "initialized": true,
  "initializationDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "executions": [],
  "completedCount": 0,
  "failedCount": 0,
  "lastRun": null,
  "version": "1.0.0"
}
EOF
  chmod 644 "$WORKSPACE/.workflow-state.json"
  echo "✓ Created .workflow-state.json"
else
  echo "✓ .workflow-state.json already exists"
fi

# Make scripts executable
echo "🔧 Setting permissions..."
chmod +x "$SCRIPTS_DIR/task-workflow-executor.js"
chmod 644 "$SCRIPTS_DIR/workflow-state-manager.js"
chmod +x "$SCRIPTS_DIR/init-workflow.sh"

echo ""
echo "✅ Workflow System Initialized!"
echo ""
echo "📍 Location: $WORKFLOW_DIR"
echo "📊 State file: $WORKSPACE/.workflow-state.json"
echo "📋 Main executor: $SCRIPTS_DIR/task-workflow-executor.js"
echo ""
echo "🚀 To start processing queued tasks, run:"
echo "   node $SCRIPTS_DIR/task-workflow-executor.js"
echo ""
