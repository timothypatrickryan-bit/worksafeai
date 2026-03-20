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
  // Look for patterns like "Overall Mission Health: 🟡 **YELLOW**"
  const healthMatch = content.match(
    /Overall(?:\s+Mission)?\s+Health[\s:]*(?:🟢|🟡|🔴)\s*\*?\*?(GREEN|YELLOW|RED)\*?\*?/i
  );
  if (healthMatch) {
    return healthMatch[1].toUpperCase();
  }

  // Fallback: look for emoji with word
  const emojiHealthMatch = content.match(
    /(🟢\s*GREEN|🟡\s*YELLOW|🔴\s*RED)/i
  );
  if (emojiHealthMatch) {
    if (emojiHealthMatch[1].includes('🟢')) return 'GREEN';
    if (emojiHealthMatch[1].includes('🟡')) return 'YELLOW';
    if (emojiHealthMatch[1].includes('🔴')) return 'RED';
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

  // Extract gap description (look for bold text in the first few lines)
  const gapMatch = prioritySection.match(/\*\*([^*]+)\*\*/);
  if (gapMatch) {
    result.gap = gapMatch[1].trim();
  }

  // Look for swimlane info - could be "swimlane:", "lane:", or inferred from context
  // Also try to extract from the gap description
  if (result.gap && result.gap.includes('CRUD')) {
    result.swimlane = 'value'; // CRUD UIs are value delivery
  } else if (result.gap) {
    // Try to find mentioned swimlane keywords
    if (result.gap.toLowerCase().includes('autonomy')) result.swimlane = 'autonomy';
    else if (result.gap.toLowerCase().includes('value')) result.swimlane = 'value';
    else if (result.gap.toLowerCase().includes('organization')) result.swimlane = 'organization';
    else if (result.gap.toLowerCase().includes('scale')) result.swimlane = 'scale';
    else if (result.gap.toLowerCase().includes('reliability')) result.swimlane = 'reliability';
    else if (result.gap.toLowerCase().includes('human')) result.swimlane = 'human';
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
    if (rationale) {
      result.rationale = rationale.slice(0, 200);
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Extract swimlane scores and trends from content
 * Looks for inline score mentions or tables
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

  // Look for explicit score mentions in content
  const scoreMap = {};
  
  // Pattern 1: Look for "Lane: X/10" or "Lane: X.X/10"
  for (const lane of swimlanes) {
    const pattern = new RegExp(
      `${lane.id}[^\\d]*(\\d+\\.?\\d*)\\s*\\/\\s*\\d+`,
      'i'
    );
    const match = content.match(pattern);
    if (match) {
      scoreMap[lane.id] = parseFloat(match[1]);
    }
  }

  // Pattern 2: Look for status indicators with numbers
  // E.g., "Team Autonomy: ✅ Working" or mentions of scores in tables
  const scorePatterns = [
    { id: 'autonomy', keywords: ['autonomy', 'independent', 'automation'] },
    { id: 'value', keywords: ['value', 'delivery', 'output'] },
    { id: 'organization', keywords: ['organization', 'structure', 'architecture'] },
    { id: 'scale', keywords: ['scale', 'growth', 'expansion'] },
    { id: 'reliability', keywords: ['reliability', 'resilience', 'stability'] },
    { id: 'human', keywords: ['human', 'collaboration', 'interaction'] }
  ];

  return swimlanes
    .map(lane => {
      const score = scoreMap[lane.id];
      return {
        id: lane.id,
        name: lane.name,
        score: score || null,
        source: score ? 'auto-detected' : null,
        trend: extractTrend(content, lane.id)
      };
    })
    .filter(l => l.score !== null);
}

/**
 * Extract trend information (up, down, stable)
 */
function extractTrend(content, swimlaneId) {
  // Look for trend indicators
  const trendPatterns = [
    { trend: 'up', patterns: [/↗️|↑|\bup\b/i] },
    { trend: 'down', patterns: [/↘️|↓|\bdown\b/i] },
    { trend: 'stable', patterns: [/→|➡️|\bstable\b|\bsame\b/i] }
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
 * Extract remediation/action items from the content
 * Only gets actual action items, not metadata
 */
function extractRemediationActions(content) {
  const actions = [];

  // Look for the PRIORITY ACTION PLAN section specifically
  const actionPlanMatch = content.match(
    /##\s*🎯\s*PRIORITY\s+ACTION\s+PLAN[\s\S]*?(?=\n## |\n---|\n$)/
  );
  
  if (!actionPlanMatch) return null;
  
  const actionContent = actionPlanMatch[0];
  const lines = actionContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip phase headers and empty lines
    if (line.match(/^###|^##|^\s*$/) || line.length < 10) {
      continue;
    }
    
    // Match checkbox items [ ] or [x]
    const checkMatch = line.match(/^\s*[-*•]\s*(\[[\sx]\]\s+)?(.+)/);
    if (checkMatch) {
      const isChecked = line.includes('[x]') || line.includes('[X]');
      const desc = checkMatch[2].trim();
      
      // Skip table rows
      if (!desc.includes('|')) {
        actions.push({
          id: `action-${actions.length}`,
          description: desc.slice(0, 150),
          completed: isChecked
        });
        
        if (actions.length >= 10) break; // Limit to 10 actions
      }
    }
  }

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
