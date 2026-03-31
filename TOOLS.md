# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## 🔑 Credentials & Access

**See CREDENTIALS_MAP.md for complete inventory of:**
- Vercel projects & tokens
- Supabase database credentials
- GitHub repos
- Domain/DNS setup
- API keys (OpenAI, Stripe, etc.)
- Environment variables (what's deployed where)
- Security checklist
- Quick access links

**Storage:** Never hardcode secrets. Use:
- Vercel env vars (production)
- Local `.env` (development only, never commit)
- Password manager (backup master credentials)

---

## Cloudflare Infrastructure

**Domain:** elevationaiwork.com  
**Registrar:** Cloudflare  
**Nameservers:** Cloudflare DNS  
**Management:** https://dash.cloudflare.com

**Subdomains (CNAME → Vercel):**
- `worksafeai.elevationaiwork.com` → WorkSafeAI frontend
- `worksafeai-api.elevationaiwork.com` → WorkSafeAI backend
- `superadmin.elevationaiwork.com` → SuperAdmin console

---

## Vercel Deployment Projects

See CREDENTIALS_MAP.md for:
- Project IDs
- Vercel token
- Deployed URLs
- Environment variables

Quick links:
- **Dashboard:** https://vercel.com/timothypatrickryan-7139s-projects
- **Tokens:** https://vercel.com/account/tokens

---

## 📧 Email Configuration

**Agent Email:** lucy@elevationaiagents.com  
**Incoming:** Cloudflare Email Routing → f5zothoi@gmail.com  
**Outgoing:** Gmail SMTP relay (f5zothoi@gmail.com account)  
**Status:** ✅ Ready to use (March 16, 2026)

Emails sent through WorkSafeAI, Consensus, and other apps will appear as coming from lucy@elevationaiagents.com (professional agent brand).

---

## 🧠 Model Configuration (Updated March 30, 2026)

**Model Hierarchy:**
1. **Primary (Default):** minimax/MiniMax-M2.5 — Balanced reasoning + efficiency
2. **Secondary (Fallback):** anthropic/claude-haiku-4-5 — Fast, lightweight responses
3. **Premium (On-Demand):** anthropic/claude-opus-4-6 — Deep analysis, code reviews (~$1/use)
4. **Standard:** anthropic/claude-sonnet-4-6 — Design, architecture decisions

**When to Switch Models:**
- Use Haiku if MiniMax is slow or over-capacity
- Use Opus for critical code reviews, security audits, complex reasoning
- Use Sonnet for standard architecture/design decisions
- Stay on MiniMax for daily work (best balance)

---

Add whatever helps you do your job. This is your cheat sheet.

---

## Mission Control Dashboard

**Official name for the project dashboard application**

### Quick Reference

- **Type:** Express + React/Vite application
- **Location:** `/Users/timothyryan/.openclaw/workspace/mission-control-express-organized/`
- **Ports:** 3001 (API), 5173 (dev UI), 3001 (prod UI)
- **Start:** `cd mission-control-express-organized && npm run dev`
- **Documentation:** START_HERE.md in the project folder

### Projects Tracked
1. WorkSafeAI (75% complete)
2. Mission Control (this app itself)
3. Consensus
4. LinkedIn Automation
5. Hyperscaler Briefings
6. Project Warp Speed

### Quick Commands

```bash
# Development
npm run dev              # Start API + UI (hot reload)

# Production
npm start               # Build + run on 3001
npm run build           # Build only

# API Calls
curl http://localhost:3001/api/projects
curl http://localhost:3001/api/projects/1
```

### Key Files
- `server/index.js` — Express API
- `client/src/App.jsx` — React root
- `server/data/projects.json` — Project state (persistent)
- `client/src/pages/` — 11 route pages

### Documentation
- START_HERE.md — Quick start (5 min)
- STRUCTURE.md — Folder structure
- FILE_TREE.txt — Visual tree
- INVENTORY.md — Complete listing

**Reference:** See MEMORY.md for full technical details

