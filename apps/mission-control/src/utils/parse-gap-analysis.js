/**
 * Parse DAILY_GAP_ANALYSIS markdown files into structured data
 * Resilient parser: gracefully handles missing fields
 */

export function parseGapAnalysis(content) {
  if (!content) return {};

  const result = {
    overallHealth: extractOverallHealth(content),
    topPriority: extractTopPriority(content),
    swimlanes: extractSwimlaneTrends(content),
    remediationActions: extractRemediationActions(content),
    effortEstimate: extractEffortEstimate(content)
  };

  return result;
}

/**
 * Extract overall health status (GREEN/YELLOW/RED)
 */
function extractOverallHealth(content) {
  // Look for patterns like "Overall Mission Health: 🟢 GREEN" or "🟡 YELLOW"
  const healthMatch = content.match(/Overall(?:\sMission)?\sHealth[\s:]*(?:🟢|🟡|🔴)\s*(GREEN|YELLOW|RED)/i);
  if (healthMatch) {
    return healthMatch[1].toUpperCase();
  }

  // Fallback: look for just the color emoji with status
  const emojiHealthMatch = content.match(/🟢\s*GREEN|🟡\s*YELLOW|🔴\s*RED/i);
  if (emojiHealthMatch) {
    if (emojiHealthMatch[0].includes('🟢')) return 'GREEN';
    if (emojiHealthMatch[0].includes('🟡')) return 'YELLOW';
    if (emojiHealthMatch[0].includes('🔴')) return 'RED';
  }

  return null;
}

/**
 * Extract top priority section
 */
function extractTopPriority(content) {
  // Look for "## 🔴 TOP PRIORITY" or similar section
  const topPriorityMatch = content.match(
    /##\s*(?:🔴|[*\-])\s*TOP\s*PRIORITY[^\n]*\n+([\s\S]*?)(?=\n##|$)/i
  );

  if (!topPriorityMatch) return null;

  const prioritySection = topPriorityMatch[1];
  const result = {};

  // Extract swimlane (look for "swimlane:" or context clues)
  const swimlaneMatch = prioritySection.match(/(?:swimlane|area|track):\s*([^\n]*)/i);
  if (swimlaneMatch) {
    result.swimlane = swimlaneMatch[1].trim();
  }

  // Extract gap description (usually the first bold/emphasized text or after "Why This Matters")
  const gapMatch = prioritySection.match(
    /\*\*(.*?)\*\*|^###\s+(.*?)$/m
  );
  if (gapMatch) {
    result.gap = (gapMatch[1] || gapMatch[2]).trim();
  }

  // Extract estimated hours (look for patterns like "40-60 hours" or "Effort Required: 80 hours")
  const hoursMatch = prioritySection.match(
    /(?:Effort\s*(?:Required|Estimate)?|Hours?)[:\s]*(?:(\d+)\s*(?:\-|to)\s*)?(\d+)\s*hours?/i
  );
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[2]);
    result.estimatedHours = hours;
  }

  // Extract rationale (look for "Why This Matters" section)
  const rationaleMatch = prioritySection.match(
    /Why\s+This\s+Matters[:\s]*([\s\S]*?)(?=\n\n|Current\s+State|\n##)/i
  );
  if (rationaleMatch) {
    const rationale = rationaleMatch[1]
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.match(/^[-*]/))
      .join(' ');
    result.rationale = rationale.slice(0, 200); // Limit to 200 chars
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Extract swimlane scores and trends from content
 */
function extractSwimlaneTrends(content) {
  const swimlanes = [
    { id: 'autonomy', name: '🤖 Autonomy & Independence' },
    { id: 'value', name: '💰 Value Generation & Delivery' },
    { id: 'organization', name: '🏗️ Organization & Structure' },
    { id: 'scale', name: '📈 Scalability & Growth' },
    { id: 'reliability', name: '🛡️ Reliability & Resilience' },
    { id: 'human', name: '👤 Human-AI Collaboration' }
  ];

  // Look for score tables in content
  const scoreData = extractScoresFromTables(content);

  return swimlanes.map(lane => {
    const score = scoreData[lane.id];
    return {
      id: lane.id,
      name: lane.name,
      score: score || null,
      source: score ? 'auto-detected' : null,
      trend: extractTrend(content, lane.id)
    };
  }).filter(l => l.score !== null);
}

/**
 * Extract scores from markdown tables
 */
function extractScoresFromTables(content) {
  const scores = {};

  // Look for score mentions (3.5/5, 3.5/10, or just scores like "3.5")
  const scorePatterns = [
    /🤖[^|]*(autonomy)[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi,
    /💰[^|]*(value)[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi,
    /🏗️[^|]*(organization)[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi,
    /📈[^|]*(scale)[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi,
    /🛡️[^|]*(reliability)[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi,
    /👤[^|]*(human|collaboration)[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi
  ];

  // Also look for ID-based matches
  const idPatterns = [
    { id: 'autonomy', pattern: /autonomy[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi },
    { id: 'value', pattern: /value[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi },
    { id: 'organization', pattern: /organization[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi },
    { id: 'scale', pattern: /scale[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi },
    { id: 'reliability', pattern: /reliability[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi },
    { id: 'human', pattern: /human|collaboration[^|]*?(\d+\.?\d*)\s*\/\s*\d+/gi }
  ];

  for (const { id, pattern } of idPatterns) {
    const match = pattern.exec(content);
    if (match && match[1]) {
      scores[id] = parseFloat(match[1]);
    }
  }

  return scores;
}

/**
 * Extract trend information (up, down, stable)
 */
function extractTrend(content, swimlaneId) {
  // Look for trend indicators near the swimlane
  const trendPatterns = [
    { trend: 'up', patterns: [/↗️|↑|up/i, /📈/] },
    { trend: 'down', patterns: [/↘️|↓|down/i, /📉/] },
    { trend: 'stable', patterns: [/→|stable|same/i, /➡️/] }
  ];

  for (const { trend, patterns } of trendPatterns) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        return trend;
      }
    }
  }

  return 'stable';
}

/**
 * Extract remediation/action items
 */
function extractRemediationActions(content) {
  const actions = [];

  // Look for sections with action items (numbered lists, bullet points)
  // Common patterns: "- [ ]", "- [x]", "1.", "* ", etc.
  const actionLines = content.split('\n').filter(
    line => /^[\s]*[-*•]\s*(?:\[[ x]\])?/.test(line) && line.length > 10
  );

  // Take first 5 action items
  actionLines.slice(0, 5).forEach((line, idx) => {
    const cleaned = line.replace(/^[\s]*[-*•]\s*(?:\[[ x]\])?\s*/, '').trim();
    if (cleaned && !cleaned.match(/^[|#]/)) {
      actions.push({
        id: `action-${idx}`,
        description: cleaned,
        completed: line.includes('[x]')
      });
    }
  });

  return actions.length > 0 ? actions : null;
}

/**
 * Extract effort estimate from content
 */
function extractEffortEstimate(content) {
  // Look for effort/hour patterns
  const effortMatch = content.match(/(\d+)\s*(?:\-|to)\s*(\d+)\s*hours?/i);
  if (effortMatch) {
    return {
      min: parseInt(effortMatch[1]),
      max: parseInt(effortMatch[2])
    };
  }

  const singleMatch = content.match(/(?:Effort|Hours?)[:\s]*(\d+)\s*hours?/i);
  if (singleMatch) {
    return {
      min: parseInt(singleMatch[1]),
      max: parseInt(singleMatch[1])
    };
  }

  return null;
}

export default parseGapAnalysis;
