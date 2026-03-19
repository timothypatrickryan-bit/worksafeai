import fs from 'fs';
import path from 'path';

/**
 * GET /api/status
 * Returns current Mission Control state (tasks, agents, projects, etc.)
 */
export default function handler(req, res) {
  try {
    // Read state from .mission-control-state.json
    const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';
    
    if (!fs.existsSync(stateFile)) {
      return res.status(404).json({ error: 'State file not found' });
    }

    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

    // Return formatted response
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      tasks: state.tasks || [],
      projects: state.projects || [],
      agents: state.agents || [],
      team: state.team || [],
      inbox: state.inbox || [],
      alerts: state.alerts || [],
      contacts: state.contacts || {},
      docs: state.docs || [],
      memories: state.memories || {},
      lastUpdate: state.lastUpdate,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to read status',
      message: error.message,
    });
  }
}
