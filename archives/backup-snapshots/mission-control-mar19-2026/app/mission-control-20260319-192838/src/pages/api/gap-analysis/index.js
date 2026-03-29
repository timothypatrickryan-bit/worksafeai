import fs from 'fs';
import path from 'path';

/**
 * GET /api/gap-analysis - Get gap analysis from markdown files
 */
export default function handler(req, res) {
  try {
    const workspacePath = '/Users/timothyryan/.openclaw/workspace';

    // Try to load latest GAP analysis file
    const gapAnalysisFile = path.join(workspacePath, 'DAILY_GAP_ANALYSIS_2026-03-19.md');
    
    if (!fs.existsSync(gapAnalysisFile)) {
      // Try the generic file
      const missionControlGapFile = path.join(workspacePath, 'MISSION_CONTROL_GAP_ANALYSIS.md');
      if (!fs.existsSync(missionControlGapFile)) {
        return res.status(200).json({
          analysis: {},
          content: '',
          message: 'No GAP analysis found'
        });
      }
      
      const content = fs.readFileSync(missionControlGapFile, 'utf8');
      return res.status(200).json({
        analysis: parseGapAnalysis(content),
        content: content,
        source: 'MISSION_CONTROL_GAP_ANALYSIS.md',
        lastUpdate: fs.statSync(missionControlGapFile).mtime
      });
    }

    // Load the daily analysis
    const content = fs.readFileSync(gapAnalysisFile, 'utf8');
    
    res.status(200).json({
      analysis: parseGapAnalysis(content),
      content: content,
      source: 'DAILY_GAP_ANALYSIS_2026-03-19.md',
      lastUpdate: fs.statSync(gapAnalysisFile).mtime
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to load GAP analysis', 
      message: error.message 
    });
  }
}

/**
 * Parse GAP analysis markdown into structured data
 */
function parseGapAnalysis(content) {
  const analysis = {
    raw_content: content
  };

  // Extract pillar scores (look for lines like "Autonomy: 3/10")
  const scoreRegex = /(\w+[\s\w]*?):\s*(\d+)\/10/gi;
  let match;
  const scores = {};
  while ((match = scoreRegex.exec(content)) !== null) {
    const pillar = match[1].trim();
    const score = parseInt(match[2]);
    scores[pillar] = score;
  }
  
  if (Object.keys(scores).length > 0) {
    analysis.pillar_scores = scores;
  }

  return analysis;
}
