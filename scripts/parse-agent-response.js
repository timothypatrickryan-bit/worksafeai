#!/usr/bin/env node

/**
 * Agent Response Parser - Extracts completion signals from agent responses
 * 
 * Parses agent briefing responses for completion signals:
 * - [TASK_COMPLETE] = task finished
 * - [EXECUTION_UPDATE] = progress update
 * - [TASK_BLOCKED] = blocker encountered
 * - [DELIVERABLE] = output file path
 * 
 * Usage:
 *   node parse-agent-response.js <responseText>
 */

const fs = require('fs');

const SIGNALS = {
  COMPLETE: /\[TASK_COMPLETE\]\s*(.+?)(?=\n\[|$)/is,
  UPDATE: /\[EXECUTION_UPDATE\]\s*(.+?)(?=\n\[|$)/is,
  BLOCKED: /\[TASK_BLOCKED\]\s*(.+?)(?=\n\[|$)/is,
  DELIVERABLE: /\[DELIVERABLE\]\s*(.+?)(?=\n\[|$)/is
};

// Parse response for signals
function parseResponse(responseText) {
  const signals = {
    complete: null,
    update: null,
    blocked: null,
    deliverables: [],
    raw: responseText
  };

  // Extract completion signal
  const completeMatch = responseText.match(SIGNALS.COMPLETE);
  if (completeMatch) {
    signals.complete = {
      detected: true,
      summary: completeMatch[1].trim(),
      timestamp: new Date().toISOString()
    };
  }

  // Extract execution update
  const updateMatch = responseText.match(SIGNALS.UPDATE);
  if (updateMatch) {
    signals.update = {
      detected: true,
      progress: updateMatch[1].trim(),
      timestamp: new Date().toISOString()
    };
  }

  // Extract blocked signal
  const blockedMatch = responseText.match(SIGNALS.BLOCKED);
  if (blockedMatch) {
    signals.blocked = {
      detected: true,
      reason: blockedMatch[1].trim(),
      timestamp: new Date().toISOString()
    };
  }

  // Extract deliverables
  const deliverableMatches = responseText.matchAll(SIGNALS.DELIVERABLE);
  for (const match of deliverableMatches) {
    signals.deliverables.push({
      path: match[1].trim(),
      timestamp: new Date().toISOString()
    });
  }

  return signals;
}

// Determine task status from signals
function determineTaskStatus(signals) {
  if (signals.complete && signals.complete.detected) {
    return 'complete';
  }
  if (signals.blocked && signals.blocked.detected) {
    return 'blocked';
  }
  if (signals.update && signals.update.detected) {
    return 'executing';
  }
  return 'unknown';
}

// Generate status update payload
function generateStatusUpdate(taskId, signals) {
  const status = determineTaskStatus(signals);

  return {
    taskId,
    status,
    signals,
    updates: {
      ...(signals.complete && { executionComplete: true }),
      ...(signals.blocked && { statusReason: signals.blocked.reason }),
      ...(signals.update && { lastProgressUpdate: signals.update.timestamp }),
      ...(signals.deliverables.length > 0 && { 
        deliverablePath: signals.deliverables[0].path,
        deliverables: signals.deliverables 
      }),
      statusUpdatedAt: new Date().toISOString()
    }
  };
}

// Main
function main() {
  // Read from stdin or command line
  let responseText = process.argv[2] || '';

  if (!responseText && process.stdin.isTTY === false) {
    // Reading from pipe
    let data = '';
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      processResponse(data);
    });
  } else {
    processResponse(responseText);
  }

  function processResponse(text) {
    if (!text) {
      console.error('Usage: node parse-agent-response.js "<response text>"');
      console.error('       OR: cat response.txt | node parse-agent-response.js');
      process.exit(1);
    }

    const signals = parseResponse(text);
    const status = determineTaskStatus(signals);

    console.log('=== PARSED SIGNALS ===');
    console.log(`Status: ${status}`);
    console.log(JSON.stringify(signals, null, 2));

    if (process.argv[3]) {
      // If task ID provided, generate update payload
      const taskId = process.argv[3];
      const update = generateStatusUpdate(taskId, signals);
      console.log('\n=== STATUS UPDATE PAYLOAD ===');
      console.log(JSON.stringify(update, null, 2));
    }

    process.exit(0);
  }
}

main();
