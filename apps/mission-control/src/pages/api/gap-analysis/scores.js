import fs from 'fs';
import path from 'path';
import { parseGapAnalysis } from '../../../utils/parse-gap-analysis';

/**
 * GET /api/gap-analysis/scores
 * 
 * Returns structured swimlane scores from today's DAILY_GAP_ANALYSIS markdown file
 * Falls back to .gap-analysis-history.json for previous assessments
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const workspacePath = '/Users/timothyryan/.openclaw/workspace';
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyGapFile = path.join(workspacePath, `DAILY_GAP_ANALYSIS_${today}.md`);
    
    let parsed = null;
    let source = null;
    let lastUpdated = null;

    // Try to load today's daily gap analysis
    if (fs.existsSync(dailyGapFile)) {
      const content = fs.readFileSync(dailyGapFile, 'utf8');
      parsed = parseGapAnalysis(content);
      source = `DAILY_GAP_ANALYSIS_${today}.md`;
      lastUpdated = new Date(fs.statSync(dailyGapFile).mtime).toISOString();
    }

    // Build the response
    const response = {
      date: today,
      source: source,
      lastUpdated: lastUpdated,
      overallHealth: parsed?.overallHealth || null,
      topPriority: parsed?.topPriority || null,
      swimlanes: parsed?.swimlanes || [],
      remediationActions: parsed?.remediationActions || null,
      effortEstimate: parsed?.effortEstimate || null,
      previousAssessment: getPreviousAssessment(workspacePath)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in /api/gap-analysis/scores:', error);
    res.status(500).json({
      error: 'Failed to fetch gap analysis scores',
      message: error.message
    });
  }
}

/**
 * Get the previous assessment from history file
 */
function getPreviousAssessment(workspacePath) {
  try {
    const historyPath = path.join(workspacePath, '.gap-analysis-history.json');
    
    if (!fs.existsSync(historyPath)) {
      return null;
    }

    const historyContent = fs.readFileSync(historyPath, 'utf8');
    const history = JSON.parse(historyContent);

    if (history.assessments && history.assessments.length > 0) {
      const latest = history.assessments[0];
      return {
        date: latest.date,
        overallScore: latest.overallScore,
        timestamp: latest.timestamp
      };
    }

    return null;
  } catch (error) {
    // Silently fail on history lookup
    return null;
  }
}
