import fs from 'fs';
import path from 'path';

/**
 * GET /api/team - Get all team members
 * POST /api/team - Create team member
 */
export default function handler(req, res) {
  const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';

  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(stateFile)) {
        return res.status(200).json({ 
          mission: 'Build an autonomous organization of AI agents that produces value 24/7',
          members: [],
          structure: {}
        });
      }
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      const team = state.team || {
        mission: 'Build an autonomous organization of AI agents that produces value 24/7',
        members: [],
        structure: {}
      };
      res.status(200).json(team);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch team', message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      const newMember = {
        id: `member-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      if (!state.team) {
        state.team = {
          mission: 'Build an autonomous organization of AI agents that produces value 24/7',
          members: [],
          structure: {}
        };
      }
      state.team.members = state.team.members || [];
      state.team.members.push(newMember);
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
      res.status(201).json(newMember);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create team member', message: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
