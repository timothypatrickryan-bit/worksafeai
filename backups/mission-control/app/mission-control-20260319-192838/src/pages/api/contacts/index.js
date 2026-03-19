import fs from 'fs';
import path from 'path';

/**
 * GET /api/contacts - Get all contacts
 * POST /api/contacts - Create contact
 */
export default function handler(req, res) {
  const stateFile = '/Users/timothyryan/.openclaw/workspace/.mission-control-state.json';

  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(stateFile)) {
        return res.status(200).json({ contacts: {} });
      }
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      res.status(200).json({ contacts: state.contacts || {} });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  } else if (req.method === 'POST') {
    try {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      const id = `contact-${Date.now()}`;
      state.contacts = state.contacts || {};
      state.contacts[id] = { id, ...req.body, createdAt: new Date().toISOString() };
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
      res.status(201).json(state.contacts[id]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create contact' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
