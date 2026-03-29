// Memory Reader: Parse markdown memory files into structured timeline
const fs = require('fs');
const path = require('path');

class MemoryReader {
  constructor(memoryDir = '/Users/timothyryan/.openclaw/workspace/memory') {
    this.memoryDir = memoryDir;
    this.cache = new Map();
    this.cacheAge = 1000 * 60 * 60; // 1 hour TTL
  }

  // Get all memory dates available (sorted newest first)
  getDates() {
    try {
      const files = fs.readdirSync(this.memoryDir)
        .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
        .map(f => f.replace('.md', ''))
        .sort()
        .reverse();
      return files;
    } catch (e) {
      console.error('Error reading memory directory:', e.message);
      return [];
    }
  }

  // Parse single memory file and extract entries
  parse(date) {
    const cacheKey = `memory:${date}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.time < this.cacheAge) {
        return cached.data;
      }
    }

    const filePath = path.join(this.memoryDir, `${date}.md`);
    if (!fs.existsSync(filePath)) return null;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const entries = this._parseContent(content, date);
      
      // Cache it
      this.cache.set(cacheKey, { data: entries, time: Date.now() });
      return entries;
    } catch (e) {
      console.error(`Error parsing ${filePath}:`, e.message);
      return null;
    }
  }

  // Get latest N entries across all files
  getLatest(count = 50) {
    const dates = this.getDates();
    const allEntries = [];
    
    for (const date of dates) {
      const parsed = this.parse(date);
      if (parsed && parsed.items) {
        // Add date context to each entry
        for (const item of parsed.items) {
          allEntries.push({
            ...item,
            date,
          });
        }
        if (allEntries.length >= count) break;
      }
    }
    
    return allEntries.slice(0, count);
  }

  _parseContent(content, date) {
    // Extract timestamp from first line (e.g., "# Daily Gap Analysis — March 29, 2026 (9:03 AM EDT)")
    const timeMatch = content.match(/\((\d{1,2}:\d{2}\s[AP]M)/);
    const timestamp = timeMatch ? timeMatch[1] : '12:00 AM';

    // Split by section headers and extract meaningful content
    const items = [];
    const lines = content.split('\n');
    let currentItem = null;

    for (const line of lines) {
      // Detect section headers (## or ###)
      if (line.startsWith('##') || line.startsWith('###')) {
        // Save previous item if it has content
        if (currentItem && currentItem.text.trim()) {
          items.push(currentItem);
        }
        currentItem = {
          title: line.replace(/^#+\s*/, '').trim(),
          text: '',
          timestamp,
        };
      } else if (currentItem && line.trim() && !line.startsWith('#')) {
        // Accumulate content
        currentItem.text += line + '\n';
      }
    }
    
    // Don't forget the last item
    if (currentItem && currentItem.text.trim()) {
      items.push(currentItem);
    }

    return {
      date,
      timestamp,
      items,
      itemCount: items.length,
      fileSize: content.length,
    };
  }
}

module.exports = MemoryReader;
