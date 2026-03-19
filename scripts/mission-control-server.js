#!/usr/bin/env node

/**
 * Mission Control Server
 * Express API + WebSocket for real-time updates
 * 
 * Usage:
 *   node scripts/mission-control-server.js
 * 
 * Access:
 *   http://localhost:3000
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const MEMORY_FILE = path.join(WORKSPACE, 'MEMORY.md');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(express.static(path.join(WORKSPACE, 'web')));

// Enable CORS for cross-origin requests (localhost:3001 <-> localhost:3000)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper: read state file
function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return {
      lastUpdate: new Date().toISOString(),
      agents: {},
      projects: {},
      inbox: [],
      alerts: []
    };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

// Helper: write state file
function writeState(state) {
  state.lastUpdate = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  broadcastUpdate(state);
}

// Helper: add activity event
function addActivity(state, event) {
  if (!state.activity) state.activity = [];
  
  const activity = {
    type: event.type,
    title: event.title,
    description: event.description,
    message: event.message,
    timestamp: new Date().toISOString(),
  };
  
  state.activity.unshift(activity); // Add to front (newest first)
  state.activity = state.activity.slice(0, 50); // Keep only last 50
  
  return activity;
}

// Helper: broadcast to all WebSocket clients
function broadcastUpdate(state) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'state-update',
        payload: state
      }));
    }
  });
}

// Helper: broadcast activity event to all clients
function broadcastActivity(event) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'activity',
        event: event
      }));
    }
  });
}

// WebSocket connections
wss.on('connection', (ws) => {
  console.log('📡 Client connected');
  
  // Send current state immediately
  ws.send(JSON.stringify({
    type: 'state-update',
    payload: readState()
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.action) {
        case 'inbox-send': {
          const state = readState();
          const item = state.inbox.find(i => i.id === data.id);
          if (item) {
            item.status = 'sent';
            item.sentAt = new Date().toISOString();
            writeState(state);
          }
          break;
        }
        
        case 'agent-status': {
          const state = readState();
          if (state.agents[data.agent]) {
            state.agents[data.agent].status = data.status;
            writeState(state);
          }
          break;
        }
        
        case 'inbox-add': {
          const state = readState();
          state.inbox.push({
            id: `inbox-${Date.now()}`,
            timestamp: new Date().toISOString(),
            from: data.from,
            to: data.to,
            type: data.type,
            message: data.message,
            status: 'ready-to-send',
            ttl: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });
          writeState(state);
          break;
        }
        
        default:
          console.log('Unknown action:', data.action);
      }
    } catch (err) {
      console.error('WebSocket error:', err.message);
    }
  });
  
  ws.on('close', () => {
    console.log('📡 Client disconnected');
  });
});

// REST API Routes

// GET /api/status - Current state
app.get('/api/status', (req, res) => {
  res.json(readState());
});

// GET /api/agents - All agents
app.get('/api/agents', (req, res) => {
  const state = readState();
  res.json(state.agents);
});

// GET /api/projects - All projects
app.get('/api/projects', (req, res) => {
  const state = readState();
  res.json(state.projects);
});

// GET /api/inbox - All inbox items
app.get('/api/inbox', (req, res) => {
  const state = readState();
  res.json(state.inbox);
});

// GET /api/alerts - All alerts
app.get('/api/alerts', (req, res) => {
  const state = readState();
  res.json(state.alerts);
});

// POST /api/inbox/send/:id - Mark inbox item as sent
app.post('/api/inbox/send/:id', (req, res) => {
  const state = readState();
  const item = state.inbox.find(i => i.id === req.params.id);
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  item.status = 'sent';
  item.sentAt = new Date().toISOString();
  writeState(state);
  
  res.json({ success: true, item });
});

// POST /api/agent/:name/status - Update agent status
app.post('/api/agent/:name/status', (req, res) => {
  const state = readState();
  const { status } = req.body;
  
  if (!state.agents[req.params.name]) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  state.agents[req.params.name].status = status;
  writeState(state);
  
  res.json({ success: true });
});

// POST /api/inbox - Add inbox item
app.post('/api/inbox', (req, res) => {
  const { from, to, type, message } = req.body;
  const state = readState();
  
  const item = {
    id: `inbox-${Date.now()}`,
    timestamp: new Date().toISOString(),
    from,
    to,
    type,
    message,
    status: 'ready-to-send',
    ttl: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  
  state.inbox.push(item);
  writeState(state);
  
  res.json({ success: true, item });
});

// Task endpoints
app.post('/api/tasks/add', (req, res) => {
  const state = readState();
  if (!state.tasks) state.tasks = [];
  
  const task = {
    id: `task-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  
  state.tasks.push(task);
  
  // Log activity
  const activity = addActivity(state, {
    type: 'task-created',
    title: `New task: ${task.title}`,
    description: task.description,
  });
  
  writeState(state);
  broadcastActivity(activity);
  
  res.json(task);
});

app.post('/api/tasks/:id/approve', (req, res) => {
  const state = readState();
  if (!state.tasks) state.tasks = [];
  
  const task = state.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  
  task.status = 'queued';
  task.approvedAt = new Date().toISOString();
  
  // Log activity
  const activity = addActivity(state, {
    type: 'task-approved',
    title: `Task approved: ${task.title}`,
    description: `Moved to queued for ${task.assignedTo || 'assignment'}`,
  });
  
  writeState(state);
  broadcastActivity(activity);
  
  res.json({ ok: true });
});

app.post('/api/tasks/:id/reject', (req, res) => {
  const state = readState();
  if (!state.tasks) state.tasks = [];
  
  const task = state.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  
  task.status = 'rejected';
  task.rejectedAt = new Date().toISOString();
  
  // Log activity
  const activity = addActivity(state, {
    type: 'task-rejected',
    title: `Task rejected: ${task.title}`,
    description: `Task removed from review`,
  });
  
  writeState(state);
  broadcastActivity(activity);
  
  res.json({ ok: true });
});

// Update task status (for drag & drop)
app.put('/api/tasks/:id/status', (req, res) => {
  const state = readState();
  if (!state.tasks) state.tasks = [];
  
  const { status } = req.body;
  if (!['review', 'queued', 'working', 'complete'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const task = state.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  
  const oldStatus = task.status;
  task.status = status;
  if (status === 'complete') {
    task.completedAt = new Date().toISOString();
  }
  
  // Log activity
  const statusLabels = { review: 'Review', queued: 'Queued', working: 'In Progress', complete: 'Completed' };
  const activity = addActivity(state, {
    type: status === 'complete' ? 'task-completed' : 'task-status-changed',
    title: `Task moved: ${task.title}`,
    description: `${statusLabels[oldStatus]} → ${statusLabels[status]}`,
  });
  
  writeState(state);
  broadcastActivity(activity);
  
  res.json({ ok: true });
});

// Contact endpoints
app.post('/api/contacts/add', (req, res) => {
  const state = readState();
  if (!state.contacts) state.contacts = {};
  
  const { id, name, title, role, channels, timezone, notes } = req.body;
  
  if (!id || !name) {
    return res.status(400).json({ error: 'ID and Name are required' });
  }
  
  state.contacts[id] = {
    name,
    title,
    role,
    channels: channels || {},
    timezone: timezone || 'UTC',
    notes,
  };
  
  writeState(state);
  
  res.json({ ok: true, contact: state.contacts[id] });
});

app.get('/api/contacts', (req, res) => {
  const state = readState();
  res.json(state.contacts || {});
});

app.post('/api/contacts/update', (req, res) => {
  const state = readState();
  const { id, contact } = req.body;
  
  if (!id || !state.contacts[id]) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  
  state.contacts[id] = contact;
  writeState(state);
  
  res.json({ ok: true, contact });
});

app.post('/api/contacts/delete/:id', (req, res) => {
  const state = readState();
  const id = req.params.id;
  
  if (!state.contacts[id]) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  
  delete state.contacts[id];
  writeState(state);
  
  res.json({ ok: true });
});

// Memory endpoints
app.post('/api/memories/add', (req, res) => {
  const state = readState();
  if (!state.memories) state.memories = [];
  
  const { date, content, type, timestamp } = req.body;
  
  if (!date || !content) {
    return res.status(400).json({ error: 'Date and content required' });
  }
  
  const entry = {
    date,
    content,
    type: type || 'journal',
    timestamp: timestamp || new Date().toISOString(),
  };
  
  state.memories.push(entry);
  writeState(state);
  
  res.json({ ok: true, entry });
});

app.get('/api/memories', (req, res) => {
  const state = readState();
  const memories = (state.memories || [])
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(memories);
});

app.get('/api/memories/date/:date', (req, res) => {
  const state = readState();
  const date = req.params.date;
  const memories = (state.memories || [])
    .filter(m => m.date === date)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(memories);
});

// Load daily memory files from workspace
app.get('/api/memories/load-daily', (req, res) => {
  try {
    const memories = [];
    
    // Check if memory directory exists
    if (fs.existsSync(MEMORY_DIR)) {
      const files = fs.readdirSync(MEMORY_DIR)
        .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
        .sort()
        .reverse();
      
      files.forEach(file => {
        const date = file.replace('.md', '');
        const filepath = path.join(MEMORY_DIR, file);
        const content = fs.readFileSync(filepath, 'utf8');
        const preview = content.split('\n').slice(0, 3).join('\n');
        
        memories.push({
          date,
          filename: `memory/${file}`,
          title: file.replace('.md', ''),
          preview: preview || content,
          content,
        });
      });
    }
    
    res.json(memories);
  } catch (err) {
    console.error('Error loading daily memories:', err);
    res.status(500).json({ error: err.message });
  }
});

// Load long-term memory from MEMORY.md
app.get('/api/memories/load-longterm', (req, res) => {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      const content = fs.readFileSync(MEMORY_FILE, 'utf8');
      res.json({ content, exists: true });
    } else {
      res.json({ content: null, exists: false });
    }
  } catch (err) {
    console.error('Error loading long-term memory:', err);
    res.status(500).json({ error: err.message });
  }
});

// Auto-categorize documents based on filename and content
function categorizeDoc(filename, content) {
  const nameLower = filename.toLowerCase();
  
  // Categorization rules (in order of priority)
  if (nameLower.includes('setup') || nameLower.includes('install') || nameLower.includes('config')) return 'setup';
  if (nameLower.includes('deploy') || nameLower.includes('production') || nameLower.includes('release')) return 'deployment';
  if (nameLower.includes('architecture') || nameLower.includes('design') || nameLower.includes('structure')) return 'architecture';
  if (nameLower.includes('api') || nameLower.includes('endpoint') || nameLower.includes('route')) return 'api';
  if (nameLower.includes('agent') || nameLower.includes('spawn') || nameLower.includes('laura') || nameLower.includes('opus')) return 'agent';
  if (nameLower.includes('automation') || nameLower.includes('cron') || nameLower.includes('schedule') || nameLower.includes('linkedin')) return 'automation';
  if (nameLower.includes('worksafeai') || nameLower.includes('consensus') || nameLower.includes('project')) return 'project';
  
  // Default category
  return 'other';
}

// Load all markdown documents from workspace
app.get('/api/docs/list', (req, res) => {
  try {
    const docs = [];
    
    // Scan workspace root for markdown files
    function scanDir(dir, baseDir = '') {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const relativePath = path.join(baseDir, file);
        
        // Skip certain directories
        if (stat.isDirectory()) {
          if (!['node_modules', '.git', 'apps', '.next', 'dist', '.vercel'].includes(file)) {
            scanDir(fullPath, relativePath);
          }
        } else if (file.endsWith('.md')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n').length;
            const preview = content.split('\n').slice(0, 10).join('\n');
            const stat2 = fs.statSync(fullPath);
            
            docs.push({
              filename: relativePath.replace(/\\/g, '/'),
              title: file.replace('.md', '').replace(/_/g, ' ').replace(/-/g, ' '),
              category: categorizeDoc(file, content),
              lines,
              preview,
              modified: stat2.mtime.toISOString(),
              size: stat2.size,
            });
          } catch (err) {
            console.error('Error reading doc:', fullPath, err.message);
          }
        }
      });
    }
    
    // Start scanning from workspace root
    scanDir(WORKSPACE);
    
    // Also scan apps/ for project-specific docs
    const appsDir = path.join(WORKSPACE, 'apps');
    if (fs.existsSync(appsDir)) {
      const appDirs = fs.readdirSync(appsDir);
      appDirs.forEach(appName => {
        const appPath = path.join(appsDir, appName);
        if (fs.statSync(appPath).isDirectory()) {
          scanDir(appPath, `apps/${appName}`);
        }
      });
    }
    
    // Sort by modified date (newest first)
    docs.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    
    res.json(docs);
  } catch (err) {
    console.error('Error listing docs:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get full doc content
app.get('/api/docs/:filename(*)', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(WORKSPACE, filename);
    
    // Security: prevent directory traversal
    if (!filepath.startsWith(WORKSPACE)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const content = fs.readFileSync(filepath, 'utf8');
    res.json({ content });
  } catch (err) {
    console.error('Error reading doc:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate subagent using smart agent generator
app.post('/api/team/generate-subagent', (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description required' });
    }
    
    const { generateAgentProfile } = require('./smart-agent-generator');
    const agentProfile = generateAgentProfile(description);
    
    res.json(agentProfile);
  } catch (err) {
    console.error('Error generating agent:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new subagent
app.post('/api/team/subagent', (req, res) => {
  try {
    const { name, title, scope, model, specialties, skills, team } = req.body;

    // Accept either scope or specialties (from smart generator)
    const specialty = scope || (specialties && specialties[0]) || 'General';

    if (!name || !title || !model) {
      return res.status(400).json({ error: 'Missing required fields: name, title, model' });
    }

    const state = readState();
    const subagentId = name.toLowerCase().replace(/\s+/g, '-');

    const newSubagent = {
      id: subagentId,
      name,
      title,
      type: 'subagent',
      role: 'agent',
      status: 'idle',
      model,
      device: 'Cloud / OpenClaw',
      team: team || 'Execution', // Add team field (Leadership, Oversight, or Execution)
      specialty: specialty,
      specialties: specialties || [specialty],
      skills: skills || {},
      capabilities: [],
      notes: `Created on ${new Date().toISOString()}`,
    };

    // Add to state.team.members array
    if (!state.team) state.team = { members: [], structure: { leadership: [], oversight: [], execution: [] } };
    if (!state.team.members) state.team.members = [];
    state.team.members.push(newSubagent);

    // Update structure if team is specified
    if (team && state.team.structure) {
      const teamKey = team.toLowerCase();
      if (!state.team.structure[teamKey]) state.team.structure[teamKey] = [];
      if (!state.team.structure[teamKey].includes(subagentId)) {
        state.team.structure[teamKey].push(subagentId);
      }
    }

    writeState(state);

    res.json({ success: true, subagent: newSubagent });
  } catch (err) {
    console.error('Error creating subagent:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:taskId - Get full task details with delegation plan
app.get('/api/tasks/:taskId', (req, res) => {
  try {
    const state = readState();
    const task = (state.tasks || []).find(t => t.id === req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Find delegation record
    const delegation = (state.delegations || []).find(d => d.linkedTask === task.id);
    
    // Find agent
    const agent = (state.team?.members || []).find(m => m.id === (delegation?.assignedAgent || task.assignedTo));
    
    res.json({
      task,
      delegation,
      agent,
      lucyPlan: task.lucyPlan,
      agentBriefing: task.agentBriefing || null,
    });
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks/:taskId/briefing - Agent provides execution plan
app.post('/api/tasks/:taskId/briefing', (req, res) => {
  try {
    const state = readState();
    const task = (state.tasks || []).find(t => t.id === req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const { agent, deliverables, timeline, milestones, blockers } = req.body;
    
    if (!agent || !deliverables) {
      return res.status(400).json({ error: 'Missing required fields: agent, deliverables' });
    }
    
    // Store briefing
    task.agentBriefing = {
      agent,
      deliverables,
      timeline: timeline || null,
      milestones: milestones || [],
      blockers: blockers || [],
      submittedAt: new Date().toISOString(),
    };
    
    task.briefingStatus = 'received';
    
    writeState(state);
    
    // Add activity
    addActivity(state, {
      type: 'briefing-received',
      title: `${agent} submitted execution plan for "${task.title}"`,
      description: `Deliverables: ${deliverables.map(d => d.title).join(', ')}`,
    });
    
    writeState(state);
    
    res.json({ success: true, briefing: task.agentBriefing });
  } catch (err) {
    console.error('Error submitting briefing:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks - Get all tasks with progress
app.get('/api/tasks', (req, res) => {
  try {
    const state = readState();
    const tasks = (state.tasks || []).map(task => {
      const delegation = (state.delegations || []).find(d => d.linkedTask === task.id);
      const agent = (state.team?.members || []).find(m => m.id === (delegation?.assignedAgent || task.assignedTo));
      
      return {
        ...task,
        assignedAgent: agent,
        delegation,
        progress: task.progress || 0,
      };
    });
    
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:taskId/progress - Update task progress
app.put('/api/tasks/:taskId/progress', (req, res) => {
  try {
    const state = readState();
    const task = (state.tasks || []).find(t => t.id === req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const { progress, update } = req.body;
    
    if (progress !== undefined) {
      task.progress = Math.min(100, Math.max(0, progress));
    }
    
    if (update) {
      if (!task.updates) task.updates = [];
      task.updates.push({
        message: update,
        timestamp: new Date().toISOString(),
      });
    }
    
    writeState(state);
    res.json({ success: true, task });
  } catch (err) {
    console.error('Error updating task progress:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get team data (mission, agents, subagents, contacts)
app.get('/api/team', (req, res) => {
  try {
    const state = readState();
    
    // Default team members (hardcoded)
    const defaultMembers = [
      {
        id: 'lucy',
        name: 'Lucy',
        title: 'Personal AI Assistant',
        type: 'agent',
        role: 'leader',
        status: 'active',
        model: 'Claude Haiku 4.5 (default)',
        device: 'Cloud / OpenClaw',
        specialty: 'Task automation, code review, document generation',
        capabilities: [
          'Execute shell commands',
          'Code analysis & review',
          'Document creation',
          'Web scraping',
          'Subagent orchestration',
          'Memory management',
        ],
        notes: 'Primary orchestrator. Runs locally on Tim\'s machine via OpenClaw. 🍀',
      },
      {
        id: 'tim-ryan',
        name: 'Tim Ryan',
        title: 'Founder & Decision Maker',
        type: 'agent',
        role: 'leader',
        status: 'active',
        model: 'Human intelligence',
        device: 'Mac mini (M1, 8GB)',
        specialty: 'Product vision, technical decisions, app development',
        capabilities: [
          'Full-stack development',
          'Product strategy',
          'Code architecture',
          'App deployment',
          'Team coordination',
        ],
        notes: 'Central decision maker. Runs 3 active projects (WorkSafeAI, Consensus, Mission Control).',
      },
      {
        id: 'laura',
        name: 'Laura',
        title: 'Elevated Children\'s Brand Strategy Manager',
        type: 'subagent',
        role: 'agent',
        status: 'idle',
        model: 'Claude Opus 4.6',
        device: 'Cloud / OpenClaw',
        specialty: 'Premium children\'s apparel branding, market strategy',
        capabilities: [
          'Brand positioning analysis',
          'Competitive research',
          'Product development strategy',
          'Retail partnership planning',
          'DTC marketing strategy',
        ],
        notes: 'Specialized for elevated children\'s brand work. Recently completed Q2 strategy analysis.',
      },
      {
        id: 'opus-reviewer',
        name: 'Opus Code Reviewer',
        title: 'Automated Code Analysis & Security',
        type: 'subagent',
        role: 'tool',
        status: 'idle',
        model: 'Claude Opus 4.6',
        device: 'Cloud / OpenClaw',
        specialty: 'Deep code analysis, security audits, design reviews',
        capabilities: [
          'Security vulnerability detection',
          'Code quality analysis',
          'Architecture review',
          'Performance optimization',
          'Auto-fix implementation',
        ],
        notes: 'Spawned on-demand for WorkSafeAI project. Finds and auto-fixes issues.',
      },
      {
        id: 'linkedin-bot',
        name: 'LinkedIn Auto-Poster',
        title: 'Social Media Automation',
        type: 'tool',
        role: 'tool',
        status: 'scheduled',
        model: 'Custom Node.js script',
        device: 'macOS / Cron + Browser Relay',
        specialty: 'Content generation, social media scheduling, LinkedIn posting',
        capabilities: [
          'Topic-based post generation',
          'Scheduled automation (Tue/Thu/Sat @ 9 AM EST)',
          'Chrome browser relay posting',
          'Activity logging',
          'Alternating topic rotation',
        ],
        notes: 'Fully automated. Runs via launchd plist. Posts industry insights, trending topics.',
      },
    ];
    
    // Merge with dynamically created subagents from state
    let members = [...defaultMembers];
    if (state.team && state.team.members) {
      // Add any new subagents from state that aren't in defaults
      state.team.members.forEach(stateMember => {
        const exists = members.find(m => m.id === stateMember.id);
        if (!exists) {
          members.push(stateMember);
        }
      });
    }
    
    const teamData = {
      mission: 'An autonomous organization of AI agents that does work for me and produces value 24/7',
      members: members,
      contacts: [
        {
          name: 'Tim Ryan',
          role: 'Founder',
          channels: ['Telegram: @tryanz92', 'Email: tim.ryan@pro-tel.com'],
        },
        {
          name: 'Kelly',
          role: 'Sister / Consultant',
          channels: ['WhatsApp: (pending)', 'Email: (pending)'],
        },
      ],
    }
    res.json(teamData)
  } catch (err) {
    console.error('Error loading team:', err)
    res.status(500).json({ error: err.message })
  }
});

// Gap Analysis endpoints
const GAP_ANALYSIS_FILE = path.join(WORKSPACE, '.gap-analysis-history.json');

function readGapAnalysisHistory() {
  if (!fs.existsSync(GAP_ANALYSIS_FILE)) {
    return { assessments: [] };
  }
  return JSON.parse(fs.readFileSync(GAP_ANALYSIS_FILE, 'utf8'));
}

function writeGapAnalysisHistory(data) {
  fs.writeFileSync(GAP_ANALYSIS_FILE, JSON.stringify(data, null, 2));
}

// Save gap analysis assessment
app.post('/api/gap-analysis/save', (req, res) => {
  try {
    const assessment = req.body;
    const history = readGapAnalysisHistory();
    
    // Add to history
    history.assessments = history.assessments || [];
    history.assessments.unshift(assessment); // Add to front (newest first)
    
    // Keep last 30 assessments
    if (history.assessments.length > 30) {
      history.assessments = history.assessments.slice(0, 30);
    }
    
    writeGapAnalysisHistory(history);
    res.json({ ok: true, assessment });
  } catch (err) {
    console.error('Error saving gap analysis:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get gap analysis history
app.get('/api/gap-analysis/history', (req, res) => {
  try {
    const history = readGapAnalysisHistory();
    res.json(history);
  } catch (err) {
    console.error('Error loading gap analysis history:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete gap analysis assessment
app.delete('/api/gap-analysis/:id', (req, res) => {
  try {
    const id = req.params.id;
    const history = readGapAnalysisHistory();
    
    history.assessments = history.assessments.filter(a => a.id !== id);
    writeGapAnalysisHistory(history);
    
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting gap analysis:', err);
    res.status(500).json({ error: err.message });
  }
});

// Edit team member
app.put('/api/team/member/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, specialty, notes } = req.body;
    const state = readState();

    // Update in team members if exists
    if (state.team && state.team.members) {
      const memberIndex = state.team.members.findIndex(m => m.id === id);
      if (memberIndex >= 0) {
        state.team.members[memberIndex] = {
          ...state.team.members[memberIndex],
          name,
          title,
          specialty,
          notes,
        };
        writeState(state);
        return res.json({ ok: true });
      }
    }

    // If not in team members, just acknowledge (default members are read-only but we acknowledge the request)
    res.json({ ok: true, message: 'Member updated' });
  } catch (err) {
    console.error('Error editing team member:', err);
    res.status(500).json({ error: err.message });
  }
});

// Root - serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(WORKSPACE, 'web', 'mission-control-dashboard.html'));
});

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  Mission Control Dashboard`);
  console.log(`${'═'.repeat(50)}`);
  console.log(`\n  🌐 Open: http://localhost:${PORT}`);
  console.log(`  📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`  📂 State: ${STATE_FILE}`);
  console.log(`\n${'═'.repeat(50)}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down Mission Control Server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
