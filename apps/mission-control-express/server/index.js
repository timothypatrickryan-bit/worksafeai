const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- Project Data (in-memory, persisted to JSON) ---
const STATE_FILE = path.join(__dirname, 'data', 'projects.json');

function loadProjects() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load projects:', e.message);
  }
  return getDefaultProjects();
}

function saveProjects(projects) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Atomic write: write to temp file then rename
    const tmpFile = STATE_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(projects, null, 2));
    fs.renameSync(tmpFile, STATE_FILE);
  } catch (e) {
    console.error('Failed to save projects:', e.message);
    throw new Error('Failed to persist data');
  }
}

function getDefaultProjects() {
  return [
    {
      id: 1,
      name: 'WorkSafeAI',
      status: 'In Progress',
      progress: 72,
      taskCount: 15,
      description: 'Job Task Safety Analysis tool for construction industry',
      owner: 'Tim Ryan',
      team: 'Dev Team',
    },
    {
      id: 2,
      name: 'Mission Control',
      status: 'In Progress',
      progress: 45,
      taskCount: 12,
      description: 'Complete visual redesign with improved UX and workflows',
      owner: 'Lucy',
      team: 'Platform',
    },
    {
      id: 3,
      name: 'Consensus',
      status: 'In Progress',
      progress: 28,
      taskCount: 8,
      description: 'Product Review Aggregation and Analysis Platform',
      owner: 'Research Team',
      team: 'Data',
    },
    {
      id: 4,
      name: 'LinkedIn Automation',
      status: 'Active',
      progress: 100,
      taskCount: 5,
      description: 'Automated LinkedIn content posting with Brave Search',
      owner: 'Lucy',
      team: 'Marketing',
    },
    {
      id: 5,
      name: 'Hyperscaler Briefings',
      status: 'Active',
      progress: 100,
      taskCount: 3,
      description: 'Automated daily briefings for data center industry',
      owner: 'Lucy',
      team: 'Marketing',
    },
    {
      id: 6,
      name: 'Project Warp Speed',
      status: 'Active',
      progress: 15,
      taskCount: 35,
      description: 'Pro-Tel growth acceleration - data center infrastructure market leadership (Northeast PA/Upstate NY)',
      owner: 'Tim Ryan',
      team: 'Strategy',
    },
  ];
}

// --- Input Validation ---
const ALLOWED_STATUSES = ['Active', 'In Progress', 'Paused', 'Completed', 'Archived'];
const MAX_STRING_LENGTH = 500;

function validateProject(body) {
  const errors = [];
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('name must be a non-empty string');
    } else if (body.name.length > MAX_STRING_LENGTH) {
      errors.push(`name must be ${MAX_STRING_LENGTH} characters or less`);
    }
  }
  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.push('description must be a string');
    } else if (body.description.length > 2000) {
      errors.push('description must be 2000 characters or less');
    }
  }
  if (body.status !== undefined && !ALLOWED_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }
  if (body.progress !== undefined) {
    const p = Number(body.progress);
    if (!Number.isFinite(p) || p < 0 || p > 100) {
      errors.push('progress must be a number between 0 and 100');
    }
  }
  if (body.taskCount !== undefined) {
    const t = Number(body.taskCount);
    if (!Number.isInteger(t) || t < 0) {
      errors.push('taskCount must be a non-negative integer');
    }
  }
  return errors;
}

// Sanitize: only allow known fields through
function sanitizeProjectFields(body) {
  const allowed = ['name', 'description', 'status', 'progress', 'taskCount', 'owner', 'team'];
  const result = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      result[key] = key === 'progress' ? Number(body[key]) : body[key];
    }
  }
  return result;
}

// Initialize
let projects = loadProjects();

// --- API Routes ---

// GET /api/projects - list all projects with stats
app.get('/api/projects', (req, res) => {
  const active = projects.filter(p => p.status === 'Active').length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const avgCompletion = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
    : 0;

  res.json({
    success: true,
    projects,
    stats: {
      total: projects.length,
      active,
      inProgress,
      avgCompletion,
    },
    pendingApprovals: 3,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/projects/:id - single project
app.get('/api/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid project ID' });
  const project = projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true, project });
});

// PUT /api/projects/:id - update project
app.put('/api/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid project ID' });
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });

  const errors = validateProject(req.body);
  if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

  const sanitized = sanitizeProjectFields(req.body);
  projects[idx] = { ...projects[idx], ...sanitized, id: projects[idx].id, updatedAt: new Date().toISOString() };
  saveProjects(projects);
  res.json({ success: true, project: projects[idx] });
});

// POST /api/projects - create project
app.post('/api/projects', (req, res) => {
  if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.trim().length === 0) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const errors = validateProject(req.body);
  if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

  const sanitized = sanitizeProjectFields(req.body);
  const newProject = {
    id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
    status: 'Active',
    progress: 0,
    taskCount: 0,
    ...sanitized,
    createdAt: new Date().toISOString(),
  };
  projects.push(newProject);
  saveProjects(projects);
  res.status(201).json({ success: true, project: newProject });
});

// DELETE /api/projects/:id - delete project
app.delete('/api/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid project ID' });
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });

  const removed = projects.splice(idx, 1)[0];
  saveProjects(projects);
  res.json({ success: true, deleted: removed });
});

// --- Document Mappings ---
// Maps project IDs to directories containing their documents
const WORKSPACE_ROOT = path.join(__dirname, '..', '..', '..');
const DOCUMENT_MAPPINGS = {
  1: { // WorkSafeAI
    basePath: path.join(WORKSPACE_ROOT, 'apps', 'worksafeai'),
    patterns: ['*.md'],
    label: 'WorkSafeAI Documentation',
  },
  2: { // Mission Control
    basePath: path.join(WORKSPACE_ROOT, 'apps', 'mission-control-express'),
    patterns: ['README.md'],
    label: 'Mission Control Documentation',
  },
  6: { // Project Warp Speed
    basePath: path.join(WORKSPACE_ROOT, 'projects', 'warp-speed-research'),
    patterns: ['*.md'],
    label: 'Warp Speed Research',
  },
};

function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = { '.md': 'Markdown', '.pdf': 'PDF', '.txt': 'Text', '.json': 'JSON' };
  return types[ext] || 'File';
}

function scanDocuments(basePath, patterns) {
  const docs = [];
  if (!fs.existsSync(basePath)) return docs;
  try {
    const files = fs.readdirSync(basePath);
    for (const file of files) {
      const matches = patterns.some(p => {
        if (p === '*.md') return file.endsWith('.md');
        if (p === '*.txt') return file.endsWith('.txt');
        if (p === '*.pdf') return file.endsWith('.pdf');
        return file === p;
      });
      if (!matches) continue;
      const fullPath = path.join(basePath, file);
      const stat = fs.statSync(fullPath);
      if (!stat.isFile()) continue;
      docs.push({
        name: file,
        path: fullPath,
        relativePath: path.relative(WORKSPACE_ROOT, fullPath),
        size: stat.size,
        sizeFormatted: stat.size > 1024 ? `${(stat.size / 1024).toFixed(1)} KB` : `${stat.size} B`,
        modified: stat.mtime.toISOString(),
        modifiedFormatted: stat.mtime.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        type: getFileType(file),
      });
    }
  } catch (e) {
    console.error('Error scanning documents:', e.message);
  }
  return docs.sort((a, b) => a.name.localeCompare(b.name));
}

// GET /api/projects/:id/documents - list documents for a project
app.get('/api/projects/:id/documents', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid project ID' });

  const mapping = DOCUMENT_MAPPINGS[id];
  if (!mapping) {
    return res.json({ success: true, documents: [], label: 'No documents configured' });
  }

  const documents = scanDocuments(mapping.basePath, mapping.patterns);
  res.json({ success: true, documents, label: mapping.label });
});

// GET /api/documents/content - read a document's content
app.get('/api/documents/content', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'path query parameter required' });

  // Security: resolve and ensure the file is within the workspace
  const resolved = path.resolve(filePath);
  const workspaceResolved = path.resolve(WORKSPACE_ROOT);
  if (!resolved.startsWith(workspaceResolved)) {
    return res.status(403).json({ error: 'Access denied: path outside workspace' });
  }

  if (!fs.existsSync(resolved)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    const stat = fs.statSync(resolved);
    // Limit to 500KB to prevent loading huge files
    if (stat.size > 512 * 1024) {
      return res.status(413).json({ error: 'File too large to display (max 500KB)' });
    }
    const content = fs.readFileSync(resolved, 'utf8');
    res.json({ success: true, content, name: path.basename(resolved), size: stat.size });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// --- Briefings API (Work proposals, status requests, approvals) ---
const BRIEFINGS_FILE = path.join(path.dirname(STATE_FILE), 'briefings.json');

function loadBriefings() {
  try {
    if (fs.existsSync(BRIEFINGS_FILE)) {
      return JSON.parse(fs.readFileSync(BRIEFINGS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load briefings:', e.message);
  }
  return [];
}

function saveBriefings(briefings) {
  try {
    const dir = path.dirname(BRIEFINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmpFile = BRIEFINGS_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(briefings, null, 2));
    fs.renameSync(tmpFile, BRIEFINGS_FILE);
  } catch (e) {
    console.error('Failed to save briefings:', e.message);
    throw new Error('Failed to save briefings');
  }
}

// GET /api/briefings - get all briefings
app.get('/api/briefings', (req, res) => {
  const briefings = loadBriefings();
  res.json({ briefings });
});

// POST /api/briefings - create briefing
app.post('/api/briefings', (req, res) => {
  const { type, title, description, actionRequired } = req.body;
  if (!type || !title) return res.status(400).json({ error: 'type and title required' });

  const briefing = {
    id: Date.now(),
    status: 'awaiting-approval',
    agent: 'Lucy',
    type: String(type).substring(0, 50),
    title: String(title).substring(0, 200),
    description: String(description).substring(0, 1000),
    actionRequired: String(actionRequired).substring(0, 50),
    userFeedback: null,
    timestamp: new Date().toISOString(),
  };

  const briefings = loadBriefings();
  briefings.push(briefing);
  saveBriefings(briefings);
  
  res.status(201).json({ success: true, briefing });
});

// PUT /api/briefings/:id - update briefing (approve, reject, add feedback)
app.put('/api/briefings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid briefing ID' });

  const briefings = loadBriefings();
  const idx = briefings.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Briefing not found' });

  const { status, userFeedback, actionRequired } = req.body;
  if (status) briefings[idx].status = String(status).substring(0, 50);
  if (userFeedback) briefings[idx].userFeedback = String(userFeedback).substring(0, 500);
  if (actionRequired) briefings[idx].actionRequired = String(actionRequired).substring(0, 50);
  
  briefings[idx].updatedAt = new Date().toISOString();
  saveBriefings(briefings);
  
  res.json({ success: true, briefing: briefings[idx] });
});

// DELETE /api/briefings/:id - delete briefing
app.delete('/api/briefings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid briefing ID' });

  const briefings = loadBriefings();
  const idx = briefings.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Briefing not found' });

  const deleted = briefings.splice(idx, 1)[0];
  saveBriefings(briefings);
  res.json({ success: true, deleted });
});

// --- Focused Tasks API ---
const FOCUSED_TASKS_FILE = path.join(path.dirname(STATE_FILE), 'focused-tasks.json');

function loadFocusedTasks() {
  try {
    if (fs.existsSync(FOCUSED_TASKS_FILE)) {
      return JSON.parse(fs.readFileSync(FOCUSED_TASKS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load focused tasks:', e.message);
  }
  return {};
}

function saveFocusedTasks(tasks) {
  try {
    const dir = path.dirname(FOCUSED_TASKS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmpFile = FOCUSED_TASKS_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(tasks, null, 2));
    fs.renameSync(tmpFile, FOCUSED_TASKS_FILE);
  } catch (e) {
    console.error('Failed to save focused tasks:', e.message);
    throw new Error('Failed to save focused tasks');
  }
}

// GET /api/projects/:id/focused-tasks - get focused tasks for project
app.get('/api/projects/:id/focused-tasks', (req, res) => {
  const projectId = parseInt(req.params.id);
  if (isNaN(projectId)) return res.status(400).json({ error: 'Invalid project ID' });

  const focused = loadFocusedTasks();
  const projectFocused = focused[projectId] || [];
  res.json({ focusedTasks: projectFocused });
});

// POST /api/projects/:id/focused-tasks/:taskIndex - focus a task
app.post('/api/projects/:id/focused-tasks/:taskIndex', (req, res) => {
  const projectId = parseInt(req.params.id);
  const taskIndex = parseInt(req.params.taskIndex);
  
  if (isNaN(projectId) || isNaN(taskIndex)) {
    return res.status(400).json({ error: 'Invalid project ID or task index' });
  }

  const focused = loadFocusedTasks();
  if (!focused[projectId]) focused[projectId] = [];
  
  if (!focused[projectId].includes(taskIndex)) {
    focused[projectId].push(taskIndex);
  }
  
  saveFocusedTasks(focused);
  res.json({ success: true, focusedTasks: focused[projectId] });
});

// DELETE /api/projects/:id/focused-tasks/:taskIndex - unfocus a task
app.delete('/api/projects/:id/focused-tasks/:taskIndex', (req, res) => {
  const projectId = parseInt(req.params.id);
  const taskIndex = parseInt(req.params.taskIndex);
  
  if (isNaN(projectId) || isNaN(taskIndex)) {
    return res.status(400).json({ error: 'Invalid project ID or task index' });
  }

  const focused = loadFocusedTasks();
  if (focused[projectId]) {
    focused[projectId] = focused[projectId].filter(t => t !== taskIndex);
  }
  
  saveFocusedTasks(focused);
  res.json({ success: true, focusedTasks: focused[projectId] || [] });
});

// --- Adjustments API (Task feedback, status changes, notes) ---
const ADJUSTMENTS_FILE = path.join(path.dirname(STATE_FILE), 'adjustments.json');

function loadAdjustments() {
  try {
    if (fs.existsSync(ADJUSTMENTS_FILE)) {
      return JSON.parse(fs.readFileSync(ADJUSTMENTS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load adjustments:', e.message);
  }
  return [];
}

function saveAdjustments(adjustments) {
  try {
    const dir = path.dirname(ADJUSTMENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmpFile = ADJUSTMENTS_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(adjustments, null, 2));
    fs.renameSync(tmpFile, ADJUSTMENTS_FILE);
  } catch (e) {
    console.error('Failed to save adjustments:', e.message);
    throw new Error('Failed to save adjustments');
  }
}

// GET /api/projects/:id/adjustments - get adjustment log
app.get('/api/projects/:id/adjustments', (req, res) => {
  const projectId = parseInt(req.params.id);
  if (isNaN(projectId)) return res.status(400).json({ error: 'Invalid project ID' });
  
  const adjustments = loadAdjustments().filter(a => a.projectId === projectId);
  res.json({ adjustments });
});

// POST /api/projects/:id/adjustments - add adjustment
app.post('/api/projects/:id/adjustments', (req, res) => {
  const projectId = parseInt(req.params.id);
  if (isNaN(projectId)) return res.status(400).json({ error: 'Invalid project ID' });

  const { type, task, action, feedback } = req.body;
  if (!type || !action) return res.status(400).json({ error: 'type and action required' });

  const adjustment = {
    id: Date.now(),
    projectId,
    type: String(type).substring(0, 50),
    task: task ? String(task).substring(0, 100) : 'Project',
    action: String(action).substring(0, 500),
    feedback: feedback ? String(feedback).substring(0, 500) : null,
    timestamp: new Date().toISOString(),
    acknowledgedBy: null,
    acknowledgmentTime: null,
    acknowledgmentNote: null,
  };

  const adjustments = loadAdjustments();
  adjustments.push(adjustment);
  saveAdjustments(adjustments);
  
  res.status(201).json({ success: true, adjustment });
});

// PUT /api/projects/:id/adjustments/:adjId - acknowledge adjustment
app.put('/api/projects/:id/adjustments/:adjId', (req, res) => {
  const projectId = parseInt(req.params.id);
  const adjId = parseInt(req.params.adjId);
  if (isNaN(projectId) || isNaN(adjId)) return res.status(400).json({ error: 'Invalid IDs' });

  const { acknowledgmentNote } = req.body;
  if (!acknowledgmentNote) return res.status(400).json({ error: 'acknowledgmentNote required' });

  const adjustments = loadAdjustments();
  const adj = adjustments.find(a => a.id === adjId && a.projectId === projectId);
  if (!adj) return res.status(404).json({ error: 'Adjustment not found' });

  adj.acknowledgedBy = 'Lucy';
  adj.acknowledgmentTime = new Date().toISOString();
  adj.acknowledgmentNote = String(acknowledgmentNote).substring(0, 500);
  
  saveAdjustments(adjustments);
  res.json({ success: true, adjustment: adj });
});

// --- 404 for unknown API routes ---
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// --- Serve React build in production ---
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// --- Global error handler ---
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Mission Control API running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/projects`);
  if (fs.existsSync(clientDist)) {
    console.log(`   UI:  http://localhost:${PORT}`);
  } else {
    console.log(`   UI:  Run 'npm run build' first, or 'npm run dev' for development`);
  }
});
