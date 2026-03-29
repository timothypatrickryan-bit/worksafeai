// Agent Registry: Manage agent metadata and status
const fs = require('fs');
const path = require('path');

class AgentRegistry {
  constructor(dataDir = '/Users/timothyryan/.openclaw/workspace/mission-control-express-organized/server/data') {
    this.dataDir = dataDir;
    this.agentsFile = path.join(dataDir, 'agents.json');
    this.sessions = new Map(); // Track active sessions
  }

  // Load all agents from JSON
  getAll() {
    try {
      if (fs.existsSync(this.agentsFile)) {
        const data = fs.readFileSync(this.agentsFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading agents:', e.message);
    }
    return this._getDefaults();
  }

  // Get single agent by ID
  get(agentId) {
    const all = this.getAll();
    return all.find(a => a.id === agentId);
  }

  // Get agents by role
  getByRole(role) {
    const all = this.getAll();
    return all.filter(a => a.role === role);
  }

  // Get agents by status
  getByStatus(status) {
    const all = this.getAll();
    return all.filter(a => a.status === status);
  }

  // Register new agent
  create(agentData) {
    const agents = this.getAll();
    const newAgent = {
      id: agentData.id || this._generateId(),
      name: agentData.name,
      role: agentData.role,
      avatar: agentData.avatar || '🤖',
      specialty: agentData.specialty || '',
      status: agentData.status || 'offline',
      uptime: agentData.uptime || '0%',
      taskCount: agentData.taskCount || 0,
      createdAt: new Date().toISOString(),
      ...agentData,
    };
    agents.push(newAgent);
    this._save(agents);
    return newAgent;
  }

  // Update agent
  update(agentId, updates) {
    const agents = this.getAll();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx === -1) return null;
    
    agents[idx] = {
      ...agents[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this._save(agents);
    return agents[idx];
  }

  // Delete agent
  delete(agentId) {
    const agents = this.getAll();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx === -1) return null;
    
    const deleted = agents.splice(idx, 1)[0];
    this._save(agents);
    return deleted;
  }

  // Register agent session (online)
  registerSession(agentId, sessionId) {
    this.sessions.set(agentId, {
      sessionId,
      startTime: Date.now(),
    });
    this.update(agentId, { status: 'online' });
  }

  // Unregister session (offline)
  unregisterSession(agentId) {
    this.sessions.delete(agentId);
    this.update(agentId, { status: 'offline' });
  }

  // Get status of all agents
  getAllStatus() {
    const agents = this.getAll();
    const statuses = {};
    
    for (const agent of agents) {
      statuses[agent.id] = {
        id: agent.id,
        name: agent.name,
        status: agent.status || 'offline',
        lastSeen: agent.lastSeen || null,
      };
    }
    
    return statuses;
  }

  _save(agents) {
    try {
      const dir = path.dirname(this.agentsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Atomic write: write to temp file then rename
      const tmpFile = this.agentsFile + '.tmp';
      fs.writeFileSync(tmpFile, JSON.stringify(agents, null, 2));
      fs.renameSync(tmpFile, this.agentsFile);
    } catch (e) {
      console.error('Error saving agents:', e.message);
      throw new Error('Failed to persist agent data');
    }
  }

  _generateId() {
    return 'agent-' + Date.now();
  }

  _getDefaults() {
    return [
      {
        id: 'lucy',
        name: 'Lucy',
        role: 'Lead AI Agent',
        avatar: '🍀',
        specialty: 'Full-stack development, project management',
        status: 'online',
        uptime: '99.2%',
        taskCount: 142,
      },
      {
        id: 'chief',
        name: 'Chief',
        role: 'Architecture & Design',
        avatar: '🏛️',
        specialty: 'System architecture, design decisions',
        status: 'online',
        uptime: '98.5%',
        taskCount: 156,
      },
      {
        id: 'velma',
        name: 'Velma',
        role: 'QA & Code Review',
        avatar: '🧪',
        specialty: 'Test automation, quality assurance',
        status: 'online',
        uptime: '98.7%',
        taskCount: 45,
      },
      {
        id: 'johnny',
        name: 'Johnny',
        role: 'Frontend Engineer',
        avatar: '✨',
        specialty: 'UI/UX, React components',
        status: 'online',
        uptime: '95.2%',
        taskCount: 89,
      },
      {
        id: 'jarvis',
        name: 'Jarvis',
        role: 'Backend Engineer',
        avatar: '⚙️',
        specialty: 'API development, databases',
        status: 'online',
        uptime: '97.1%',
        taskCount: 67,
      },
      {
        id: 'opus',
        name: 'Opus',
        role: 'Advanced Reasoning',
        avatar: '🧠',
        specialty: 'Deep analysis, complex problem solving',
        status: 'online',
        uptime: '99.5%',
        taskCount: 22,
      },
      {
        id: 'laura',
        name: 'Laura',
        role: 'Strategy & Brand',
        avatar: '📈',
        specialty: 'Product strategy, business development',
        status: 'online',
        uptime: '96.8%',
        taskCount: 35,
      },
      {
        id: 'scout',
        name: 'Scout',
        role: 'Research & Analysis',
        avatar: '🔍',
        specialty: 'Market research, competitive analysis',
        status: 'online',
        uptime: '96.1%',
        taskCount: 53,
      },
      {
        id: 'mark',
        name: 'Mark',
        role: 'Operations',
        avatar: '📋',
        specialty: 'Project coordination, workflow management',
        status: 'online',
        uptime: '97.3%',
        taskCount: 41,
      },
      {
        id: 'steven',
        name: 'Steven',
        role: 'DevOps & Infrastructure',
        avatar: '🔧',
        specialty: 'Deployment, infrastructure, monitoring',
        status: 'online',
        uptime: '98.9%',
        taskCount: 78,
      },
    ];
  }
}

module.exports = AgentRegistry;
