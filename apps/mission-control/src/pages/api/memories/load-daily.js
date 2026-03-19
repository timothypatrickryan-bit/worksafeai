import fs from 'fs';
import path from 'path';

/**
 * GET /api/memories/load-daily
 * Load daily memory from memory/YYYY-MM-DD.md
 * Returns all recent daily memories (last 7 days)
 */
export default function handler(req, res) {
  try {
    const workspaceMemoryDir = '/Users/timothyryan/.openclaw/workspace/memory';
    
    if (!fs.existsSync(workspaceMemoryDir)) {
      return res.status(200).json([]);
    }

    // Get all .md files in memory directory
    const files = fs.readdirSync(workspaceMemoryDir)
      .filter(f => f.match(/^\d{4}-\d{2}-\d{2}/) && f.endsWith('.md'))
      .sort()
      .reverse() // Most recent first

    // Load all daily memories
    const memories = files.map(file => {
      // Extract date from filename (YYYY-MM-DD is always first 10 chars)
      const date = file.substring(0, 10);
      const filePath = path.join(workspaceMemoryDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      return {
        date,
        title: formatDate(date),
        content,
        filename: file
      };
    });

    res.status(200).json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load daily memories', message: error.message });
  }
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateStr;
  }
}
