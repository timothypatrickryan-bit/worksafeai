# Mission Control - Contacts Manager

**Purpose:** Central registry of all contacts, platforms, and systems that agents interact with.

Agents can reference this section to know:
- Who to send messages to (Tim, Kelly, etc.)
- How to reach them (Telegram, WhatsApp, Email)
- What their role is (owner, consultant, tool, platform)
- Availability and timezone
- Special notes (preferences, expertise, costs)

---

## Current Contacts

### 👤 People

#### **Tim Ryan** (Founder)
- **Channels:**
  - Telegram: @tryanz92 (8794422901)
  - Email: tim.ryan@pro-tel.com
- **Availability:** 9 AM - 6 PM EST (weekdays)
- **Role:** Owner / Primary decision maker
- **Notes:** Prefers async comms but responds to alerts
- **Timezone:** America/New_York

#### **Kelly** (Brand Strategy Consultant)
- **Channels:**
  - WhatsApp: +1-XXX-XXX-XXXX (integration pending)
  - Email: kelly@email.com
- **Availability:** Flexible
- **Role:** Consultant
- **Notes:** Expert in elevated children's apparel market
- **Timezone:** America/New_York

### 🤖 AI Tools

#### **Claude Opus 4.6** (Code Review Engine)
- **Channel:** Anthropic API
- **Model:** claude-opus-4-6
- **Availability:** 24/7
- **Cost:** $0.015 per 1K input tokens / $0.06 per 1K output tokens
- **Role:** Deep reasoning capability
- **Use for:** Complex analysis, security reviews, architecture decisions

### ⚙️ Platforms & Services

#### **GitHub**
- **Org:** timothypatrickryan-bit
- **Repos:** worksafeai, worksafeai-super-admin
- **CI/CD:** GitHub Actions (auto-deploy on push)
- **Availability:** 24/7
- **Role:** Code repository + continuous deployment

#### **Supabase**
- **Project:** yajgvdolpynezwlwkvva
- **Database:** PostgreSQL (WorkSafeAI)
- **Auth:** RLS (Row-Level Security) configured
- **Availability:** 24/7
- **Role:** Database + authentication

#### **Vercel**
- **Deployments:** WorkSafeAI frontend, backend, super-admin
- **Custom Domains:** Configured via Cloudflare
- **Availability:** 24/7
- **Role:** Web hosting + deployment

#### **LinkedIn**
- **Account:** tim.ryan@pro-tel.com
- **Schedule:** Auto-post Tue/Thu/Sat @ 9 AM EST
- **Method:** OpenClaw Browser Relay
- **Availability:** 24/7
- **Role:** Social media platform

---

## How Agents Use This

### **When Laura Needs to Send Work to Kelly:**
```javascript
const contacts = state.contacts;
const kelly = contacts.kelly;

// Get channel info
console.log(kelly.channels.whatsapp.phone);  // How to reach
console.log(kelly.availability);              // When to expect response
console.log(kelly.notes);                     // Context about her

// Send message
state.inbox.push({
  from: 'laura',
  to: 'kelly',
  message: 'Your analysis is ready',
  channel: 'whatsapp'  // Use Kelly's preferred channel
});
```

### **When LinkedIn Bot Needs to Call Opus for Review:**
```javascript
const contacts = state.contacts;
const opus = contacts['claude-opus'];

// Get API details
console.log(opus.channels.api.endpoint);      // Where to call
console.log(opus.cost_per_use);               // Budget awareness
console.log(opus.notes);                      // When to use

// Call API
const response = await callAnthropic(
  opus.channels.api.model,
  'Review this post for brand alignment'
);
```

### **When Code Reviewer Needs to Deploy:**
```javascript
const contacts = state.contacts;
const vercel = contacts.vercel;
const github = contacts.github;

// Get deployment info
console.log(github.channels.api.org);         // GitHub org
console.log(vercel.channels.api.token_status); // Deploy token active

// Deploy
await deployToVercel(
  github.channels.api.org,
  'worksafeai'
);
```

---

## Adding New Contacts

Edit `.mission-control-state.json` and add to `contacts` object:

```json
{
  "new-person": {
    "name": "Their Name",
    "title": "Their Title",
    "channels": {
      "telegram": {
        "name": "Telegram",
        "id": "12345678",
        "handle": "@username"
      }
    },
    "availability": "9 AM - 5 PM PST",
    "timezone": "America/Los_Angeles",
    "notes": "Special instructions or context",
    "role": "owner|consultant|tool|platform"
  }
}
```

Then refresh the Mission Control Dashboard - it will load automatically.

---

## Contact Roles

| Role | Example | Use For |
|------|---------|---------|
| **owner** | Tim | Final decisions, escalations |
| **consultant** | Kelly | Domain expertise, strategy |
| **tool** | Claude Opus | Computation, analysis |
| **platform** | GitHub, Vercel | Infrastructure, deployment |

---

## Dashboard Display

The Mission Control Dashboard shows all contacts in a searchable, color-coded interface:

- 🟢 **Green** (humans) — People agents send messages to
- 🔵 **Blue** (tools) — AI services agents call
- 🟠 **Orange** (platforms) — Infrastructure agents interact with

Click any contact to see full details (channels, availability, costs).

---

## Why This Matters

**Before:** Agents had to guess how to reach people or which API to call
**After:** Agents have a single source of truth for all contact info

This enables:
- Agents to automatically format messages in the right channel
- Cost-aware decision making (knowing Opus costs $$ vs Haiku)
- Availability-aware scheduling (don't expect Tim after 6 PM)
- Audit trail of who contacted whom and when

---

## Quick Reference

```bash
# View all contacts (via CLI)
node scripts/mission-control.js read | jq '.contacts'

# View one contact
node scripts/mission-control.js read | jq '.contacts.tim'

# View dashboard
Open: http://localhost:3000
Scroll to "Contacts & Platforms" section
```

---

**Status:** ✅ Live in Mission Control Dashboard  
**Next:** Agents use this for intelligent routing (Tim vs Kelly, Opus vs Haiku, etc.)
