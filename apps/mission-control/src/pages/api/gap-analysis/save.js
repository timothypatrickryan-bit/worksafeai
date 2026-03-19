import fs from 'fs';
import path from 'path';

/**
 * POST /api/gap-analysis/save
 * Save assessment data
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const workspacePath = '/Users/timothyryan/.openclaw/workspace';
    const historyFile = path.join(workspacePath, '.gap-analysis-history.json');

    let history = [];
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    }

    // Add new assessment
    const assessment = {
      id: `assessment-${Date.now()}`,
      timestamp: new Date().toISOString(),
      data: req.body
    };

    history.push(assessment);

    // Save updated history
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

    res.status(200).json({ 
      success: true, 
      id: assessment.id,
      message: 'Assessment saved'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to save assessment', 
      message: error.message 
    });
  }
}
