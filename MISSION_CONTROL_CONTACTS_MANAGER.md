# Mission Control Contacts Manager

**Status:** ✅ Production Ready  
**Last Updated:** March 15, 2026 @ 1:10 PM EST  
**Location:** http://localhost:3001 → Contacts (◉ in sidebar)

---

## Overview

The **Contacts Manager** is a dynamic contact registry that enables you to create, organize, and manage all your business and technical contacts in one place.

**Key Features:**
- ✅ Create new contacts with rich metadata
- ✅ Add multiple communication channels per contact
- ✅ Auto-group by role (Owners, Consultants, Tools, Platforms)
- ✅ Expandable contact cards with detailed information
- ✅ Real-time sync via WebSocket
- ✅ Persistent storage in Mission Control state

---

## Creating a New Contact

### Step 1: Click "+ Add New Contact"

Click the blue button at the top of the Contacts section to open the form.

### Step 2: Fill Contact Details

**Required Fields:**
- **Contact ID** — Unique identifier (e.g., `alex-partner`, `stripe-api`)
- **Name** — Full name or service name (e.g., "Alex Partner", "Stripe API")

**Optional Fields:**
- **Title** — Job title or service description (e.g., "CEO", "Payment Processor")
- **Role** — Category for grouping
  - `owner` — Person who owns/leads
  - `family` — Family members
  - `friends` — Friends & personal connections
  - `consultant` — External advisor/expert
  - `tool` — AI or software tool
  - `platform` — Service/infrastructure platform
- **Timezone** — Contact's timezone (e.g., "America/New_York")
- **Notes** — Any additional information

### Step 3: Add Communication Channels

Each contact can have multiple ways to reach them.

**To add a channel:**

1. **Select channel type** — Dropdown menu
   - Email
   - Telegram
   - WhatsApp
   - API
   - Web

2. **Enter channel name** — What you call it (e.g., "Work Email", "Mobile WhatsApp", "GitHub API")

3. **Enter channel value** — The actual contact info
   - Email: `name@example.com`
   - Telegram: `12345678` (user ID)
   - WhatsApp: `+1-XXX-XXX-XXXX` (phone number)
   - API: `https://api.service.com/v1`
   - Web: `https://example.com`

4. **Click "Add Channel"** — Channel appears in the "Channels:" list

5. **Remove if needed** — Click "Remove" button next to any channel

### Step 4: Create Contact

Click the green **"Create Contact"** button to save.

Contact appears immediately:
- In the correct role section (sorted)
- Ready for agents to use
- Synced across all browsers via WebSocket

---

## Contact Organization

Contacts are automatically grouped by role:

### **👤 People - Owners**
Your personal contacts with ownership authority.

**Example:** Tim Ryan (Founder)

### **❤️ Family**
Family members and close personal connections.

**Example:** Kelly (Sister, Brand Strategy Consultant)

### **👫 Friends**
Friends and other personal connections.

**Example:** John Doe (Childhood friend, CEO)

### **🎯 People - Consultants**
External experts and advisors.

**Example:** Strategic consultant, freelancer

### **🤖 AI Tools**
AI services and analysis engines.

**Example:** Claude Opus 4.6 (Code Review & Analysis Engine)

### **⚙️ Platforms & Services**
External platforms, APIs, and infrastructure.

**Examples:** GitHub, Supabase, Vercel, LinkedIn, Stripe

---

## Using Contacts with Agents

Agents automatically reference your contact registry to make intelligent routing decisions.

### Example Workflow

**Laura (Agent) Completes Analysis:**
1. Laura finishes Q2 brand strategy analysis
2. She checks `state.contacts` to find Kelly
3. Finds Kelly has WhatsApp + Email channels
4. Routes message to Kelly via WhatsApp (preferred)
5. Message appears in Inbox as "laura → kelly"

**Smart Routing:**
- Agents know contact timezone (don't wake people up)
- Agents know cost (avoid expensive tools unless necessary)
- Agents know availability (respect office hours)
- Agents choose optimal channel (WhatsApp > Email > API)

---

## Contact Details Expansion

Click on any contact card to expand and see:

### **Channels Section**
Shows all communication methods:
- Name of channel
- Value/address (email, phone, ID, endpoint)
- Status indicator

### **Metadata Section**
Shows operational info:
- **⏰ Availability** — When they're available (e.g., "9 AM - 6 PM EST")
- **🌍 Timezone** — Their timezone
- **💰 Cost** — Cost per use (for AI tools)

### **Notes Section**
Any additional context you added.

---

## Channel Types Reference

### **Email**
- **Value:** Email address (name@example.com)
- **Use Case:** General communication, formal messages
- **Field:** `address`

### **Telegram**
- **Value:** User ID (numeric, e.g., 12345678)
- **Use Case:** Quick messages, real-time chat
- **Field:** `id`

### **WhatsApp**
- **Value:** Phone number (+1-XXX-XXX-XXXX)
- **Use Case:** Mobile messaging, urgent contact
- **Field:** `phone`

### **API**
- **Value:** API endpoint (https://api.service.com/v1)
- **Use Case:** Programmatic access to services
- **Field:** `endpoint`

### **Web**
- **Value:** Website URL (https://example.com)
- **Use Case:** Reference information, public profile
- **Field:** `url`

---

## Contact Template Examples

### **Person: Family Member**
```
ID: kelly-sister
Name: Kelly (Sister)
Title: Brand Strategy Consultant
Role: Family
Timezone: America/New_York
Notes: Brand strategy expert. Elevated children's apparel market knowledge.

Channels:
- Email: Personal → kelly@email.com
- WhatsApp: Mobile → +1-XXX-XXX-XXXX
```

### **Person: External Consultant**
```
ID: john-smith
Name: John Smith
Title: Senior Developer
Role: Consultant
Timezone: America/Chicago
Notes: 5 years experience in React. Works Mon-Fri 8 AM - 5 PM CST.

Channels:
- Email: Work → john@company.com
- Email: Personal → john@personal.com
- Telegram: Phone → 1234567890
- WhatsApp: Mobile → +1-312-555-0123
```

### **Person: Friend**
```
ID: mike-friend
Name: Mike Johnson
Title: Entrepreneur
Role: Friends
Timezone: America/Los_Angeles
Notes: Co-founder interest. Available for brainstorms.

Channels:
- Email: Personal → mike@email.com
- WhatsApp: Mobile → +1-424-555-0123
```

### **Service: AI Tool**
```
ID: claude-sonnet
Name: Claude Sonnet 4.6
Title: General Purpose AI Model
Role: Tool
Timezone: UTC
Notes: Cost-effective for most tasks. ~0.003 per 1K input tokens.

Channels:
- API: Anthropic API → https://api.anthropic.com
```

### **Platform: Infrastructure**
```
ID: stripe-payments
Name: Stripe
Title: Payment Processing Platform
Role: Platform
Timezone: UTC
Notes: Primary payment processor. 2.9% + $0.30 per transaction.

Channels:
- API: Dashboard → https://dashboard.stripe.com
- Web: Support → https://support.stripe.com
```

---

## Data Structure

Contacts stored in `.mission-control-state.json`:

```json
{
  "contacts": {
    "alex-partner": {
      "name": "Alex Partner",
      "title": "Business Partner",
      "role": "consultant",
      "timezone": "America/New_York",
      "notes": "Strategic partnership opportunities",
      "channels": {
        "email": {
          "name": "Work Email",
          "address": "alex@partner.com",
          "status": "active"
        },
        "telegram": {
          "name": "Telegram",
          "id": "12345678",
          "status": "active"
        }
      }
    }
  }
}
```

---

## API Endpoints

### **POST /api/contacts/add**

Create a new contact.

**Request:**
```json
{
  "id": "alex-partner",
  "name": "Alex Partner",
  "title": "Business Partner",
  "role": "consultant",
  "timezone": "America/New_York",
  "notes": "Description...",
  "channels": {
    "email": {
      "name": "Work Email",
      "address": "alex@partner.com",
      "status": "active"
    }
  }
}
```

**Response:**
```json
{
  "ok": true,
  "contact": { ... }
}
```

### **GET /api/contacts**

Get all contacts.

**Response:**
```json
{
  "alex-partner": { ... },
  "kelly": { ... },
  ...
}
```

---

## Best Practices

### 1. **Use Clear IDs**
✅ `alex-partner`, `stripe-api`, `claude-opus`  
❌ `a1`, `s`, `ct`

### 2. **Add Relevant Notes**
✅ "5 years experience. Works CST timezone. Prefers WhatsApp."  
❌ "Contact"

### 3. **Keep Channels Updated**
- Remove inactive channels
- Update phone numbers when they change
- Add new channels as you discover them

### 4. **Set Proper Roles**
- **owner** = You control this relationship
- **consultant** = External expert you hire
- **tool** = AI/software service
- **platform** = Infrastructure/API service

### 5. **Use Timezone for Scheduling**
- Helps agents avoid calling people outside business hours
- Enables smart scheduling for global teams

---

## Troubleshooting

### Contact not appearing?

1. Refresh the dashboard (F5)
2. Check browser console (F12) for errors
3. Verify Contact ID is unique (no duplicates)
4. Verify Name field is not empty

### Channel not saving?

1. Ensure channel type is selected
2. Ensure both Name and Value are filled
3. Check WebSocket connection (should be "Connected")

### Contact in wrong group?

1. Check Role field matches intended category
2. Refresh to see immediate update
3. Contacts auto-group by role each load

### Need to edit existing contact?

Currently, contacts are read-only in UI. To edit:
1. Edit `.mission-control-state.json` directly
2. Or delete and recreate with new details

---

## Integration with Agents

### Laura (Brand Strategy Manager)

When Laura completes analysis, she:
1. Looks up recipient in `state.contacts`
2. Finds preferred channel (WhatsApp > Email)
3. Routes message via that channel
4. Adds to Inbox for approval/sending

### Opus Code Review

When reviewing code, Opus:
1. Checks contact list for Tim (owner)
2. Uses Telegram channel
3. Routes findings there
4. Tags as high-priority

### LinkedIn Auto-Poster

When posting, bot:
1. Checks LinkedIn contact credentials
2. Uses Web channel (authenticated session)
3. Posts content
4. Logs to activity feed

---

## Future Enhancements

- [ ] Edit existing contacts in UI
- [ ] Delete contacts from UI
- [ ] Search/filter contacts
- [ ] Bulk import from CSV
- [ ] Contact verification (test channel connectivity)
- [ ] Activity history (when contact was last used)
- [ ] Tags for custom grouping
- [ ] Availability scheduling

---

## Quick Reference

| Action | Steps |
|--------|-------|
| Create contact | Click "+ Add New Contact" → Fill form → Create |
| Add channel | Fill channel fields → Click "Add Channel" |
| Remove channel | Click "Remove" on channel |
| View details | Click contact card to expand |
| Sort by role | Auto-sorted into 4 groups |
| Find contact | Scroll through role sections |
| Check availability | Expand contact → See "⏰ Availability" |

---

**Contacts Manager is fully integrated with Mission Control!**

Use it to build your comprehensive contact network and enable intelligent agent routing. 🚀
