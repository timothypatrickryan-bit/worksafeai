import fs from 'fs';
import path from 'path';

/**
 * GET /api/docs/list
 * List all documentation files
 */
export default function handler(req, res) {
  try {
    const workspaceDir = '/Users/timothyryan/.openclaw/workspace';
    const docsDir = path.join(workspaceDir, 'docs');

    const docs = [];

    // Check /docs directory
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const filePath = path.join(docsDir, file);
          const stat = fs.statSync(filePath);
          docs.push({
            filename: file,
            title: file.replace('.md', '').replace(/-/g, ' '),
            category: 'documentation',
            path: `/docs/${file}`,
            size: stat.size,
            created: stat.birthtime,
          });
        }
      });
    }

    // Check workspace *.md files + important .txt/.log files
    if (fs.existsSync(workspaceDir)) {
      const workspaceFiles = fs.readdirSync(workspaceDir);
      workspaceFiles.forEach(file => {
        const isMd = file.endsWith('.md');
        const isTxt = file.endsWith('.txt') && (file.includes('log') || file.includes('LOG'));
        const isLog = (file.startsWith('.') && file.endsWith('.txt')) || (file.startsWith('.') && file.endsWith('-log.txt'));
        
        if ((isMd || isTxt || isLog) && !file.startsWith('_')) {
          const filePath = path.join(workspaceDir, file);
          const stat = fs.statSync(filePath);
          docs.push({
            filename: file,
            title: file.replace('.md', '').replace('.txt', '').replace(/-/g, ' '),
            category: categorizeDoc(file),
            path: `/${file}`,
            size: stat.size,
            created: stat.birthtime,
          });
        }
      });
    }

    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list docs', message: error.message });
  }
}

// Categorize docs by filename
function categorizeDoc(filename) {
  if (filename.includes('SETUP') || filename.includes('setup')) return 'setup';
  if (filename.includes('DEPLOYMENT') || filename.includes('deployment')) return 'deployment';
  if (filename.includes('API')) return 'api';
  if (filename.includes('AGENT')) return 'agent';
  if (filename.includes('AUTOMATION') || filename.includes('automation')) return 'automation';
  if (filename.includes('AUTONOMY') || filename.includes('autonomy')) return 'autonomy';
  if (filename.includes('LOG') || filename.includes('log')) return 'logs';
  if (filename.includes('PROJECT')) return 'project';
  if (filename.includes('ARCHITECTURE')) return 'architecture';
  if (filename.includes('BACKUP') || filename.includes('backup')) return 'backup';
  return 'other';
}
