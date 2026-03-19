#!/usr/bin/env node

/**
 * Get Contacts Helper
 * Agents use this to access contact registry
 * 
 * Usage:
 *   const contacts = require('./get-contacts.js')
 *   const kelly = contacts.getContact('kelly')
 *   const whatsappChannel = contacts.getChannel('kelly', 'whatsapp')
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE, '.mission-control-state.json');

function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { contacts: {} };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

/**
 * Get all contacts
 */
function getAllContacts() {
  const state = readState();
  return state.contacts || {};
}

/**
 * Get a specific contact by ID
 */
function getContact(id) {
  const contacts = getAllContacts();
  if (!contacts[id]) {
    return null;
  }
  return {
    id,
    ...contacts[id],
  };
}

/**
 * Get a specific channel from a contact
 */
function getChannel(contactId, channelType) {
  const contact = getContact(contactId);
  if (!contact || !contact.channels || !contact.channels[channelType]) {
    return null;
  }
  return {
    type: channelType,
    ...contact.channels[channelType],
  };
}

/**
 * Get best channel for routing (preferred: whatsapp > telegram > email)
 */
function getBestChannel(contactId) {
  const contact = getContact(contactId);
  if (!contact || !contact.channels) {
    return null;
  }

  const preference = ['whatsapp', 'telegram', 'email', 'api', 'web'];
  for (const type of preference) {
    if (contact.channels[type]) {
      return {
        type,
        ...contact.channels[type],
      };
    }
  }
  return null;
}

/**
 * Get contacts by role
 */
function getContactsByRole(role) {
  const contacts = getAllContacts();
  return Object.entries(contacts)
    .filter(([_, contact]) => contact.role === role)
    .map(([id, contact]) => ({
      id,
      ...contact,
    }));
}

/**
 * Check if contact is available (based on timezone)
 */
function isAvailable(contactId) {
  const contact = getContact(contactId);
  if (!contact || !contact.availability) {
    return true; // Assume available if not specified
  }

  // Very simple check - in production would use proper timezone logic
  const now = new Date();
  const hour = now.getHours();
  
  // Parse "9 AM - 6 PM EST" format
  if (contact.availability.includes('24/7') || contact.availability.includes('Always')) {
    return true;
  }

  // For now, assume available if they have availability set
  // (In production: parse actual times + timezone)
  return true;
}

/**
 * Format contact for display
 */
function formatContact(contactId) {
  const contact = getContact(contactId);
  if (!contact) {
    return null;
  }

  const channels = Object.entries(contact.channels || {})
    .map(([type, ch]) => `${ch.name} (${type})`)
    .join(', ');

  return {
    id: contact.id,
    name: contact.name,
    title: contact.title,
    role: contact.role,
    channels,
    timezone: contact.timezone,
    availability: contact.availability,
    notes: contact.notes,
  };
}

// Export functions
module.exports = {
  getAllContacts,
  getContact,
  getChannel,
  getBestChannel,
  getContactsByRole,
  isAvailable,
  formatContact,
};

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  switch (command) {
    case 'all':
      console.log(JSON.stringify(getAllContacts(), null, 2));
      break;

    case 'get':
      if (!arg1) {
        console.error('Usage: node get-contacts.js get <id>');
        process.exit(1);
      }
      console.log(JSON.stringify(formatContact(arg1), null, 2));
      break;

    case 'role':
      if (!arg1) {
        console.error('Usage: node get-contacts.js role <role>');
        process.exit(1);
      }
      const byRole = getContactsByRole(arg1);
      console.log(byRole.map(c => formatContact(c.id)));
      break;

    case 'channel':
      if (!arg1 || !arg2) {
        console.error('Usage: node get-contacts.js channel <id> <type>');
        process.exit(1);
      }
      const ch = getChannel(arg1, arg2);
      console.log(JSON.stringify(ch, null, 2));
      break;

    case 'best':
      if (!arg1) {
        console.error('Usage: node get-contacts.js best <id>');
        process.exit(1);
      }
      const best = getBestChannel(arg1);
      console.log(JSON.stringify(best, null, 2));
      break;

    case 'available':
      if (!arg1) {
        console.error('Usage: node get-contacts.js available <id>');
        process.exit(1);
      }
      console.log(isAvailable(arg1) ? 'yes' : 'no');
      break;

    default:
      console.log('Mission Control Contacts Helper');
      console.log('');
      console.log('Usage:');
      console.log('  node get-contacts.js all                    # List all contacts');
      console.log('  node get-contacts.js get <id>              # Get contact by ID');
      console.log('  node get-contacts.js role <role>           # Get contacts by role');
      console.log('  node get-contacts.js channel <id> <type>   # Get specific channel');
      console.log('  node get-contacts.js best <id>             # Get preferred channel');
      console.log('  node get-contacts.js available <id>        # Check availability');
  }
}
