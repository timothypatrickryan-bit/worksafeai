import fs from 'fs';
import path from 'path';

/**
 * GET /api/gap-analysis/remediation
 * 
 * Returns all gap remediations from state file with summary statistics
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const workspacePath = '/Users/timothyryan/.openclaw/workspace';
    const remediations = loadGapRemediations(workspacePath);
    const summary = calculateSummary(remediations);

    res.status(200).json({
      remediations: remediations,
      summary: summary
    });
  } catch (error) {
    console.error('Error in /api/gap-analysis/remediation:', error);
    res.status(500).json({
      error: 'Failed to fetch gap remediations',
      message: error.message
    });
  }
}

/**
 * Load gap remediations from state file or return empty array
 */
function loadGapRemediations(workspacePath) {
  try {
    // Try multiple possible locations for remediation state
    const possiblePaths = [
      path.join(workspacePath, '.gap-remediations.json'),
      path.join(workspacePath, 'gap-remediations.json'),
      path.join(workspacePath, '.gap-analysis-remediations.json')
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Handle both direct array and {remediations: [...]} structure
        if (Array.isArray(data)) {
          return data;
        }
        if (data.remediations && Array.isArray(data.remediations)) {
          return data.remediations;
        }
      }
    }

    // If no file found, return empty array
    return [];
  } catch (error) {
    console.error('Error loading remediations:', error);
    return [];
  }
}

/**
 * Calculate summary statistics from remediations
 */
function calculateSummary(remediations) {
  const summary = {
    total: remediations.length,
    completed: 0,
    inProgress: 0,
    identified: 0,
    totalHoursSpent: 0,
    averageHoursPerGap: 0
  };

  if (remediations.length === 0) {
    return summary;
  }

  remediations.forEach(rem => {
    // Count by status
    if (rem.status === 'completed' || rem.completed === true) {
      summary.completed++;
    } else if (rem.status === 'in-progress' || rem.status === 'inProgress') {
      summary.inProgress++;
    } else if (rem.status === 'identified') {
      summary.identified++;
    }

    // Accumulate hours spent
    if (rem.hoursSpent) {
      summary.totalHoursSpent += rem.hoursSpent;
    }
    if (rem.hours) {
      summary.totalHoursSpent += rem.hours;
    }
  });

  // Calculate average
  if (summary.totalHoursSpent > 0) {
    summary.averageHoursPerGap = parseFloat(
      (summary.totalHoursSpent / remediations.length).toFixed(1)
    );
  }

  return summary;
}
