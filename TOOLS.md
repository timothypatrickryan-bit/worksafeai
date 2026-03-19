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

Add whatever helps you do your job. This is your cheat sheet.
