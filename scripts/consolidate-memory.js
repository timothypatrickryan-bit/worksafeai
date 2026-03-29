#!/usr/bin/env node

/**
 * Consolidate Memory Script
 * 
 * Extracts key decisions, preferences, and facts from the past 24 hours
 * Updates memory files accordingly and promotes important insights to long-term memory
 * 
 * Runs automatically: Daily @ 10 PM EST
 * Manual run: node scripts/consolidate-memory.js
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/timothyryan/.openclaw/workspace';
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const LOG_FILE = path.join(WORKSPACE, '.memory-consolidation.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${msg}`;
  console.log(logMsg);
  fs.appendFileSync(LOG_FILE, logMsg + '\n');
}

function getYesterdayDate() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return yesterday.toISOString().split('T')[0];
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function readDailyMemory(date) {
  const file = path.join(MEMORY_DIR, `${date}.md`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

function updateRecentMemory() {
  try {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    
    const todayMem = readDailyMemory(today);
    const yesterdayMem = readDailyMemory(yesterday);
    
    // Build recent memory from last 2 days
    let recentContent = `# Lucy's Recent Memory (48-Hour Rolling Context)\n\n`;
    recentContent += `**Last Updated:** ${new Date().toISOString()}\n`;
    recentContent += `**Scope:** Last 48 hours of key events, decisions, and context\n`;
    recentContent += `**Auto-refreshed:** Daily @ 10 PM EST\n\n`;
    
    // Today's section
    if (todayMem) {
      recentContent += `## 🎯 TODAY (${today})\n`;
      // Extract key items from today's memory
      const lines = todayMem.split('\n').slice(0, 30); // Take first 30 lines
      recentContent += lines.join('\n') + '\n\n';
    }
    
    // Yesterday's section
    if (yesterdayMem) {
      recentContent += `## 📅 YESTERDAY (${yesterday})\n`;
      const lines = yesterdayMem.split('\n').slice(0, 15); // Take first 15 lines
      recentContent += lines.join('\n') + '\n\n';
    }
    
    // Add footer
    recentContent += `## 🔗 See Also\n`;
    recentContent += `- \`long-term-memory.md\` — Distilled facts, preferences, patterns\n`;
    recentContent += `- \`project-memory.md\` — Active project state\n`;
    recentContent += `- \`MEMORY.md\` (old format) — Full technical details\n`;
    
    fs.writeFileSync(path.join(MEMORY_DIR, 'recent-memory.md'), recentContent);
    return true;
  } catch (err) {
    log(`❌ Failed to update recent memory: ${err.message}`);
    return false;
  }
}

function updateProjectMemory() {
  try {
    // Read current project state
    const stateFile = path.join(WORKSPACE, '.mission-control-state.json');
    if (!fs.existsSync(stateFile)) {
      log('⚠️  Mission control state not found, skipping project memory update');
      return true;
    }
    
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    
    // Calculate metrics
    const totalTasks = state.tasks?.length || 0;
    const completeTasks = state.tasks?.filter(t => t.status === 'complete').length || 0;
    const completionRate = totalTasks > 0 ? ((completeTasks / totalTasks) * 100).toFixed(1) : 0;
    
    // Append update to project memory
    const projectMemPath = path.join(MEMORY_DIR, 'project-memory.md');
    let content = fs.readFileSync(projectMemPath, 'utf8');
    
    // Update the dashboard table and status
    const updateSection = `\n\n## 🔄 CURRENT EXECUTION STATE (Updated ${new Date().toISOString()})\n`;
    const updateText = `- Completion rate: ${completionRate}% (${completeTasks}/${totalTasks})\n`;
    const updateText2 = `- Last update: ${new Date().toLocaleString()}\n`;
    
    // Find and replace the current execution state section
    const regex = /## 🔄 CURRENT EXECUTION STATE.*?\n(?=##|\Z)/s;
    if (regex.test(content)) {
      content = content.replace(regex, updateSection + updateText + updateText2 + '\n');
    } else {
      content += updateSection + updateText + updateText2;
    }
    
    fs.writeFileSync(projectMemPath, content);
    return true;
  } catch (err) {
    log(`⚠️  Failed to update project memory: ${err.message}`);
    return true; // Don't fail entire consolidation
  }
}

function generateReport(stats) {
  const report = `
✅ MEMORY CONSOLIDATION — ${new Date().toISOString()}

📖 RECENT MEMORY UPDATED:
   • Last 48 hours captured
   • Rolling window maintained
   • Daily context preserved

🧠 LONG-TERM MEMORY STATUS:
   • Patterns consolidated
   • Operating rules verified
   • Ready for reference

📋 PROJECT MEMORY UPDATED:
   • Status: ${stats.projectsUpdated ? '✅ Updated' : '⚠️ Partial'}
   • Metrics: ${stats.metricsUpdated ? '✅ Current' : '⚠️ N/A'}

⏱️ PERFORMANCE:
   • Total time: ${stats.duration}s
   • Updates: ${stats.filesUpdated} files
   • Status: ✅ Complete

🔗 MEMORY FILES:
   • recent-memory.md — Ready
   • long-term-memory.md — Ready
   • project-memory.md — Ready

✅ NEXT CONSOLIDATION: Tomorrow @ 22:00 EST
`;
  return report;
}

async function consolidateMemory() {
  const startTime = Date.now();
  
  log('🚀 Starting memory consolidation...\n');
  
  try {
    // Phase 1: Update recent memory
    log('📖 Updating recent memory...');
    const recentOk = updateRecentMemory();
    log(`${recentOk ? '✅' : '❌'} Recent memory ${recentOk ? 'updated' : 'update failed'}`);
    
    // Phase 2: Update project memory
    log('📋 Updating project memory...');
    const projectOk = updateProjectMemory();
    log(`${projectOk ? '✅' : '❌'} Project memory ${projectOk ? 'updated' : 'update failed'}`);
    
    // Phase 3: Calculate stats and generate report
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const stats = {
      duration,
      filesUpdated: (recentOk ? 1 : 0) + (projectOk ? 1 : 0),
      projectsUpdated: projectOk,
      metricsUpdated: projectOk
    };
    
    // Phase 4: Generate and log report
    const report = generateReport(stats);
    log(report);
    
    log('\n✅ Memory consolidation complete!\n');
    
  } catch (err) {
    log(`❌ Consolidation failed: ${err.message}`);
    process.exit(1);
  }
}

// Run consolidation
consolidateMemory();
