# Agent Contacts Integration Guide

**Status:** ✅ Production Ready  
**Last Updated:** March 15, 2026 @ 1:15 PM EST

---

## Overview

All agents have access to the **Contacts Registry** via the `get-contacts.js` helper module.

Agents use this to:
- Route messages to the correct person/service
- Choose optimal communication channel
- Respect timezone & availability
- Personalize messages with contact details
- Make intelligent delegation decisions

---

## Using Contacts in Agent Scripts

### Import the Helper

```javascript
const contactsHelper = require('./get-contacts.js');
```

### Get All Contacts

```javascript
const allContacts = contactsHelper.getAllContacts();
// Returns: { 'tim': {...}, 'kelly': {...}, ... }
```

### Get a Specific Contact

```javascript
const kelly = contactsHelper.getContact('kelly');
// Returns:
// {
//   id: 'kelly',
//   name: 'Kelly (Sister)',
//   title: 'Brand Strategy Consultant',
//   role: 'consultant',
//   channels: {
//     whatsapp: { name: 'WhatsApp', phone: '+1-XXX-XXX-XXXX', status: 'active' },
//     email: { name: 'Email', address: 'kelly@email.com', status: 'active' }
//   },
//   timezone: 'America/New_York',
//   availability: 'Flexible',
//   notes: 'Brand strategy expert...'
// }
```

### Get a Specific Channel

```javascript
const emailChannel = contactsHelper.getChannel('kelly', 'email');
// Returns:
// {
//   type: 'email',
//   name: 'Email',
//   address: 'kelly@email.com',
//   status: 'active'
// }
```

### Get Preferred Channel (Smart Routing)

```javascript
const bestChannel = contactsHelper.getBestChannel('kelly');
// Returns the first available channel in priority order:
// 1. WhatsApp (mobile, instant)
// 2. Telegram (quick, reliable)
// 3. Email (formal, documented)
// 4. API (programmatic)
// 5. Web (reference)
```

### Get Contacts by Role

```javascript
const consultants = contactsHelper.getContactsByRole('consultant');
// Returns array of all contacts with role='consultant'

const platforms = contactsHelper.getContactsByRole('platform');
// Returns array of all platform/service contacts
```

### Check Availability

```javascript
const isAvailable = contactsHelper.isAvailable('kelly');
// Returns true/false based on timezone and availability
```

### Format for Display

```javascript
const formatted = contactsHelper.formatContact('kelly');
// Returns human-readable contact summary:
// {
//   id: 'kelly',
//   name: 'Kelly (Sister)',
//   title: 'Brand Strategy Consultant',
//   role: 'consultant',
//   channels: 'Email (email), WhatsApp (whatsapp)',
//   timezone: 'America/New_York',
//   availability: 'Flexible',
//   notes: '...'
// }
```

---

## Agent Examples

### Example 1: Laura (Brand Strategy Manager)

Laura completes analysis and needs to route findings:

```javascript
const contactsHelper = require('./get-contacts.js');

async function completeAnalysis(findings) {
  // Analysis complete
  console.log('✅ Analysis complete');

  // Get Kelly's preferred channel
  const kelly = contactsHelper.getContact('kelly');
  const bestChannel = contactsHelper.getBestChannel('kelly');

  // Create message
  const message = {
    to: 'kelly',
    toEmail: kelly.name,
    channel: bestChannel.type,
    subject: 'Q2 Brand Strategy Analysis',
    body: `Hi ${kelly.name},\n\nI've completed the Q2 brand strategy analysis:\n\n${findings.analysis}...`,
  };

  // Add to inbox for approval/sending
  // (This gets picked up by Mission Control heartbeat)
  state.inbox.push({
    id: `inbox-${Date.now()}`,
    timestamp: new Date().toISOString(),
    from: 'laura',
    to: 'kelly',
    type: 'strategy-memo',
    message: message.subject + ': ' + findings.analysis.substring(0, 80) + '...',
    status: 'ready-to-send',
    metadata: {
      channel: bestChannel.type,
      contactId: 'kelly',
    },
  });

  console.log(`📬 Message routed to ${kelly.name} via ${bestChannel.type}`);
}
```

### Example 2: Opus Code Reviewer

Opus finds a critical security issue:

```javascript
const contactsHelper = require('./get-contacts.js');

async function findSecurityIssue() {
  // Found critical issue
  const tim = contactsHelper.getContact('tim');
  const telegramChannel = contactsHelper.getChannel('tim', 'telegram');

  console.log(`🚨 CRITICAL SECURITY ISSUE FOUND`);
  console.log(`📢 Escalating to ${tim.name} via ${telegramChannel.name}`);

  // Create high-priority alert
  state.alerts.push({
    id: `alert-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'critical',
    message: '🚨 XSS vulnerability detected in user input validation',
    affectedProject: 'worksafeai',
    details: {
      file: 'src/components/InputField.js',
      line: 45,
      fix: 'Add sanitization with DOMPurify',
    },
    contactId: 'tim',
    channel: 'telegram',
  });

  console.log(`✅ Alert routed to ${tim.name}`);
}
```

### Example 3: LinkedIn Auto-Poster

Bot schedules content:

```javascript
const contactsHelper = require('./get-contacts.js');

async function schedulePost(content) {
  // Get LinkedIn platform details
  const linkedin = contactsHelper.getContact('linkedin');
  const webChannel = contactsHelper.getChannel('linkedin', 'web');

  console.log(`📱 Scheduling LinkedIn post`);
  console.log(`   Account: ${webChannel.account}`);
  console.log(`   Topic: ${content.topic}`);
  console.log(`   Time: ${content.scheduledTime}`);

  // Post will be sent via OpenClaw Browser Relay
  // (which authenticates using LinkedIn contact info)
}
```

---

## Contact Routing Strategy

### For Individual People (Owner/Consultant)

1. **Get best channel** → `getBestChannel(contactId)`
2. **Check availability** → `isAvailable(contactId)`
3. **Respect timezone** → Use `contact.timezone` to calculate office hours
4. **Personalize** → Use `contact.name` and `contact.title` in messages
5. **Route appropriately** → Via preferred channel (WhatsApp > Telegram > Email)

### For AI Tools

1. **Get API endpoint** → `getChannel(contactId, 'api')`
2. **Include cost** → `contact.cost_per_use` for decision-making
3. **Use sparingly** → Only call expensive tools (Opus) when necessary
4. **Default to cheaper** → Use Haiku for routine tasks, Opus for critical reviews

### For Platforms & Services

1. **Get connection details** → `getChannel(contactId, type)`
2. **Authenticate** → Use stored credentials for API/web access
3. **Check status** → Verify platform is accessible before operations
4. **Log usage** → Track which platforms are used for audit trail

---

## Contact Fields Reference

### Core Fields

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `kelly` | Unique identifier (required) |
| `name` | string | `Kelly (Sister)` | Display name (required) |
| `title` | string | `Brand Strategy Consultant` | Job/service title (optional) |
| `role` | enum | `consultant` | owner/consultant/tool/platform |
| `timezone` | string | `America/New_York` | IANA timezone (optional) |
| `availability` | string | `Flexible` | Availability description (optional) |
| `notes` | string | `Expert in...` | Additional context (optional) |

### Channels Object

```javascript
{
  "email": {
    "name": "Work Email",        // Display name
    "address": "kelly@...",      // Email address
    "status": "active"           // active/inactive
  },
  "whatsapp": {
    "name": "Mobile WhatsApp",
    "phone": "+1-XXX-XXX-XXXX",
    "status": "active"
  },
  "telegram": {
    "name": "Telegram",
    "id": "12345678",            // Numeric Telegram ID
    "status": "active"
  },
  "api": {
    "name": "Anthropic API",
    "endpoint": "https://...",
    "status": "active"
  },
  "web": {
    "name": "GitHub",
    "url": "https://github.com/...",
    "status": "active"
  }
}
```

---

## Command-Line Usage

Agents can also use the CLI for testing:

```bash
# Get all contacts
node scripts/get-contacts.js all

# Get specific contact
node scripts/get-contacts.js get kelly

# Get contacts by role
node scripts/get-contacts.js role consultant

# Get specific channel
node scripts/get-contacts.js channel kelly whatsapp

# Get best channel
node scripts/get-contacts.js best kelly

# Check availability
node scripts/get-contacts.js available kelly
```

---

## Integration Points

### Laura (Brand Strategy Manager)

- **Uses:** `getContact('kelly')`, `getBestChannel('kelly')`
- **Routes to:** Kelly for brand strategy feedback
- **Channel:** WhatsApp (preferred) or Email

### Opus Code Review

- **Uses:** `getContact('tim')`, `getChannel('tim', 'telegram')`
- **Routes to:** Tim for critical security issues
- **Channel:** Telegram (immediate)

### LinkedIn Auto-Poster

- **Uses:** `getContact('linkedin')`, `getChannel('linkedin', 'web')`
- **Routes to:** LinkedIn platform
- **Channel:** Web (authenticated browser session)

### Heartbeat Monitor

- **Uses:** `getAllContacts()`, `getContactsByRole('owner')`
- **Routes to:** Tim for urgent alerts
- **Channel:** Telegram (always available)

---

## Best Practices for Agents

1. **Always use `getBestChannel()`**
   - Automatically chooses optimal channel
   - Respects contact preferences
   - Fallback to secondary channels if primary unavailable

2. **Check availability before messaging**
   - Use `isAvailable(contactId)` 
   - Respect timezone constraints
   - Schedule non-urgent messages for business hours

3. **Use formatted output for display**
   - Call `formatContact()` for readable summaries
   - Makes logs cleaner and more professional
   - Useful for debugging

4. **Store contact metadata with messages**
   - When adding to inbox, include `metadata.contactId`
   - Enables auditing and tracing
   - Helps with routing history

5. **Cache contacts if checking multiple times**
   ```javascript
   const kelly = contactsHelper.getContact('kelly');
   const channel1 = kelly.channels.whatsapp;
   const channel2 = kelly.channels.email;
   // Better than calling getContact() multiple times
   ```

---

## Testing Contacts Integration

### Test Script

```bash
# Test get-contacts.js directly
node scripts/get-contacts.js all

# Verify contacts are loaded
node -e "const c = require('./scripts/get-contacts.js'); console.log(Object.keys(c.getAllContacts()))"

# Check specific contact
node scripts/get-contacts.js get kelly
```

### Verify in Spawn

When spawning Laura:
```bash
node scripts/spawn-laura.js "Test message"

# Should show:
# 🚀 Spawning Laura with Mission Control context...
# ✅ Laura completed analysis
# 📬 Message routed to Kelly via whatsapp
```

---

## Future Enhancements

- [ ] Contact availability scheduling (calendar integration)
- [ ] Message delivery tracking (who received what, when)
- [ ] Contact reliability scoring (which channel most reliable)
- [ ] Automatic channel fallback (if primary fails, try secondary)
- [ ] Contact verification (test connectivity before routing)
- [ ] Multi-language support (translate based on contact preference)
- [ ] Contact groups (route to multiple recipients)
- [ ] Message templates per contact (personalized messaging)

---

**All agents now have intelligent access to your contact network!** 🤝

Use this to route work intelligently, respect availability, and communicate effectively with your team. 🚀
