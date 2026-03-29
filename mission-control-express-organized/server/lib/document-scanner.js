// Document Scanner: Recursively scan workspace for documentation files
const fs = require('fs');
const path = require('path');

class DocumentScanner {
  constructor(workspaceRoot = '/Users/timothyryan/.openclaw/workspace') {
    this.workspaceRoot = workspaceRoot;
    this.cache = null;
    this.cacheAge = 1000 * 60 * 5; // 5 minute TTL
    this.cacheTime = null;
  }

  // Scan entire workspace and return categorized documents
  getCategories() {
    // Return cached result if still valid
    if (this.cache && this.cacheTime && Date.now() - this.cacheTime < this.cacheAge) {
      return this.cache;
    }

    const categories = {
      'Projects': [],
      'Architecture': [],
      'Operations': [],
      'Research': [],
      'Agents': [],
      'Other': []
    };

    // Scan multiple key directories
    const dirsToScan = [
      this.workspaceRoot,
      path.join(this.workspaceRoot, 'apps'),
      path.join(this.workspaceRoot, 'projects'),
      path.join(this.workspaceRoot, 'mission-control-express-organized'),
    ];

    for (const dir of dirsToScan) {
      if (fs.existsSync(dir)) {
        this._scanDir(dir, categories, 0);
      }
    }

    // Cache the result
    this.cache = categories;
    this.cacheTime = Date.now();
    return categories;
  }

  // Get single document by relative path
  getDocument(relativePath) {
    const fullPath = path.resolve(this.workspaceRoot, relativePath);
    
    // Security check: ensure path is within workspace
    if (!fullPath.startsWith(this.workspaceRoot)) {
      throw new Error('Access denied: path outside workspace');
    }

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    try {
      const stat = fs.statSync(fullPath);
      const content = fs.readFileSync(fullPath, 'utf8');

      return {
        name: path.basename(fullPath),
        path: relativePath,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        content,
      };
    } catch (e) {
      console.error(`Error reading document ${fullPath}:`, e.message);
      return null;
    }
  }

  // Search documents by name or content
  search(query) {
    const categories = this.getCategories();
    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const [category, docs] of Object.entries(categories)) {
      for (const doc of docs) {
        if (doc.name.toLowerCase().includes(lowerQuery) || 
            (doc.description && doc.description.toLowerCase().includes(lowerQuery))) {
          results.push({
            ...doc,
            category,
          });
        }
      }
    }

    return results;
  }

  _scanDir(dirPath, categories, depth) {
    // Prevent deep recursion
    if (depth > 4) return;
    if (!fs.existsSync(dirPath)) return;

    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        // Skip hidden and node_modules
        if (file.startsWith('.') || file === 'node_modules' || file === 'dist' || file === 'build') {
          continue;
        }

        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && file.endsWith('.md')) {
          const relPath = path.relative(this.workspaceRoot, fullPath);
          const doc = {
            id: relPath,
            name: file,
            path: relPath,
            size: stat.size,
            modified: stat.mtime.toISOString(),
            description: this._extractSummary(fullPath),
          };

          // Categorize by filename and directory
          const category = this._categorize(fullPath);
          if (categories[category]) {
            categories[category].push(doc);
          } else {
            categories['Other'].push(doc);
          }
        } else if (stat.isDirectory()) {
          this._scanDir(fullPath, categories, depth + 1);
        }
      }
    } catch (e) {
      console.error(`Error scanning ${dirPath}:`, e.message);
    }
  }

  _categorize(filePath) {
    const lowerPath = filePath.toLowerCase();
    
    // Agent-related
    if (lowerPath.includes('agent') || lowerPath.includes('AGENTS')) {
      return 'Agents';
    }
    
    // Project-related
    if (lowerPath.includes('/apps/') || lowerPath.includes('/projects/') || 
        lowerPath.includes('worksafe') || lowerPath.includes('consensus') || 
        lowerPath.includes('linkedin') || lowerPath.includes('hyperscaler') ||
        lowerPath.includes('warp')) {
      return 'Projects';
    }
    
    // Architecture and design
    if (lowerPath.includes('architect') || lowerPath.includes('structure') || 
        lowerPath.includes('design') || lowerPath.includes('SOUL') || 
        lowerPath.includes('IDENTITY')) {
      return 'Architecture';
    }
    
    // Operations and deployment
    if (lowerPath.includes('deploy') || lowerPath.includes('devops') || 
        lowerPath.includes('security') || lowerPath.includes('operation') || 
        lowerPath.includes('infra') || lowerPath.includes('TOOLS') || 
        lowerPath.includes('CREDENTIAL')) {
      return 'Operations';
    }
    
    // Research and analysis
    if (lowerPath.includes('research') || lowerPath.includes('brief') || 
        lowerPath.includes('analysis') || lowerPath.includes('review') ||
        lowerPath.includes('MISSION_CONTROL_REVIEW')) {
      return 'Research';
    }
    
    return 'Other';
  }

  _extractSummary(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Get first 10 non-header lines
      const lines = content
        .split('\n')
        .filter(line => !line.startsWith('#'))
        .slice(0, 10)
        .join(' ');
      
      return lines.slice(0, 120).trim() + (lines.length > 120 ? '...' : '');
    } catch (e) {
      return 'Unable to read summary';
    }
  }
}

module.exports = DocumentScanner;
