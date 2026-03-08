# Credentials Map — Access & Secrets Reference

Complete inventory of all accounts, credentials, and where they're stored. **Never commit secrets to git.**

---

## 🔐 Storage Strategy

| Location | Use | Security | Access |
|----------|-----|----------|--------|
| Vercel Dashboard | Frontend/Backend env vars | ✅ Managed by Vercel | Vercel account |
| Supabase Dashboard | DB credentials, API keys | ✅ Managed by Supabase | Supabase account |
| `.env` (local only) | Development secrets | ❌ Local file (never commit) | Local machine only |
| `.env` (GitHub) | **NEVER** | ❌ Exposed | Don't do this |
| 1Password/LastPass | Backup master credentials | ✅ Encrypted vault | Password manager |

---

## 📍 Core Accounts & Access

### Vercel (Deployment Platform)

**Account:** timothypatrickryan-7139  
**Login:** https://vercel.com  
**Token:** Stored securely in GitHub Secrets (not shown here)  
**Stored in:** GitHub Secrets (worksafeai + worksafeai-super-admin repos)  
**Manage Tokens:** https://vercel.com/account/tokens

**Projects (as of March 8, 2026):**
| Name | Project ID | Type | Domain |
|------|-----------|------|--------|
| `web` | prj_OZTnYaFCGacHXZZbbRsB9vPq1mIt | Frontend | worksafeai.elevationaiwork.com |
| `super-admin` | prj_ZqfxyOMkJtLisvgb78JkMDfTgkPv | Frontend | superadmin.elevationaiwork.com |
| `api` | prj_fXyFmEuuC6COsVSmJ4iqKDJjbk5v | Backend | worksafeai-api.elevationaiwork.com |

---

### Supabase (Database)

**Project Name:** WorkSafeAI  
**Region:** US East (Virginia)  
**Project ID:** `yajgvdolpynezwlwkvva`  
**Org ID:** (Check dashboard)  
**Login:** https://supabase.com  

**Credentials (in Supabase dashboard → Settings → API):**

| Name | Value | Use | Stored In |
|------|-------|-----|-----------|
| Project URL | `https://yajgvdolpynezwlwkvva.supabase.co` | Both apps | Vercel env vars |
| Anon Public Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhamd2ZG9scHluZXp3bHdrdnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODU4MzQsImV4cCI6MjA4ODQ2MTgzNH0.GFlys6BFyj607sH2d5thlWdOd6EPVeKhyaOL2sYUCkw` | Frontend + Backend | Vercel env vars |
| Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhamd2ZG9scHluZXp3bHdrdnZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg4NTgzNCwiZXhwIjoyMDg4NDYxODM0fQ.m-Yy90Kx6KxoqX_xf_Iy9mQqQrxyR8l89b-wlLsLLlU` | Backend admin ops | Vercel env vars |

**Database Access:**
- Username: (default: postgres)
- Password: (check Supabase → Settings → Database)
- Host: `db.yajgvdolpynezwlwkvva.supabase.co`
- Port: 5432
- Database: `postgres`

---

### Domain & DNS

**Registrar:** Cloudflare  
**Domain:** elevationaiwork.com  
**Nameservers:** Cloudflare DNS  
**Management:** https://dash.cloudflare.com  

**CNAME Records (Vercel):**
```
worksafeai         CNAME  cname.vercel.com
superadmin         CNAME  cname.vercel.com
worksafeai-api     CNAME  cname.vercel.com
```

**Status:** ✅ Propagated (as of March 8, 2026)

---

### Email Service

**Provider:** Gmail (SMTP)  
**Account:** f5zothoi@gmail.com  
**App Password:** (stored in local `.env` as `GMAIL_PASSWORD`)  
**IMAP Server:** imap.gmail.com:993 (SSL/TLS)  
**SMTP Server:** smtp.gmail.com:587 (STARTTLS)  

**Backend Env Vars:**
- `GMAIL_USER` = f5zothoi@gmail.com
- `GMAIL_PASSWORD` = [stored in Vercel]

**Used for:** Registration verification, password resets, JTSA completion emails

---

### GitHub Repositories

**Owner:** timothypatrickryan-bit  
**Login:** https://github.com/login

**Repos:**
| Name | URL | Branch | Status |
|------|-----|--------|--------|
| `worksafeai` | https://github.com/timothypatrickryan-bit/worksafeai | main | Active |
| `worksafeai-super-admin` | https://github.com/timothypatrickryan-bit/worksafeai-super-admin | main | Active |

**SSH Keys:** (setup on local machine)  
**Access:** Read/write for all repos

---

### API Keys & Secrets (3rd Party)

| Service | API Key | Status | Stored In | Notes |
|---------|---------|--------|-----------|-------|
| OpenAI | `sk-...` | ⚠️ Placeholder | Backend .env | Need real key |
| Stripe Secret | `sk-test-...` | ⚠️ Placeholder | Backend .env | Test mode for now |
| Stripe Webhook | `whsec-...` | ⚠️ Placeholder | Backend .env | Listen for events |

**To Get Real Keys:**
1. OpenAI: https://platform.openai.com/api-keys
2. Stripe: https://dashboard.stripe.com/apikeys

---

### Backend Secrets (Generated)

| Secret | Length | Generated | Stored In | Rotation |
|--------|--------|-----------|-----------|----------|
| JWT_SECRET | 32+ chars | By Tim | Vercel env | ⚠️ Not rotated yet |
| CORS_ORIGIN | — | Hardcoded | Vercel env | Update when adding domains |

**JWT_SECRET current value:** `your-jwt-secret-change-me-in-production`  
**⚠️ TODO:** Generate strong random secret before full production

---

## 🔑 Environment Variables Deployed

### Frontend Apps (Vercel)

**web** project:
```
VITE_API_URL=https://worksafeai-api.elevationaiwork.com
VITE_SUPABASE_URL=https://yajgvdolpynezwlwkvva.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**super-admin** project:
```
VITE_API_URL=https://worksafeai-api.elevationaiwork.com
VITE_SUPABASE_URL=https://yajgvdolpynezwlwkvva.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Backend App (Vercel)

**api** project:
```
NODE_ENV=production
SUPABASE_URL=https://yajgvdolpynezwlwkvva.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-jwt-secret-change-me-in-production
CORS_ORIGIN=https://worksafeai.elevationaiwork.com,https://superadmin.elevationaiwork.com
GMAIL_USER=f5zothoi@gmail.com
GMAIL_PASSWORD=[stored in Vercel]
OPENAI_API_KEY=[placeholder]
STRIPE_SECRET_KEY=[placeholder]
STRIPE_WEBHOOK_SECRET=[placeholder]
```

---

## 🚨 Security Checklist

- [ ] JWT_SECRET regenerated (strong random string, 32+ chars)
- [ ] All Vercel env vars are plaintext (non-sensitive) or marked sensitive
- [ ] GitHub access token (if needed) created and stored securely
- [ ] OpenAI API key added (production key, rate limits set)
- [ ] Stripe webhook signing secret configured
- [ ] Gmail app-specific password created (not main password)
- [ ] Cloudflare WAF rules enabled (if needed)
- [ ] CORS_ORIGIN whitelist correct (no localhost in production)
- [ ] Database passwords rotated (Supabase default → strong password)

---

## 📋 Quick Access (Bookmarks)

| Service | Link | Purpose |
|---------|------|---------|
| Vercel Dashboard | https://vercel.com/timothypatrickryan-7139s-projects | Manage projects, env vars, domains |
| Vercel Tokens | https://vercel.com/account/tokens | Create/revoke deployment tokens |
| Supabase Projects | https://supabase.com/projects | Database management, API keys |
| Supabase DB Docs | https://yajgvdolpynezwlwkvva.supabase.co | Direct database browser |
| GitHub WorkSafeAI | https://github.com/timothypatrickryan-bit/worksafeai | Main app repo |
| GitHub Admin | https://github.com/timothypatrickryan-bit/worksafeai-super-admin | Admin console repo |
| Cloudflare DNS | https://dash.cloudflare.com | Domain management |

---

## 🔄 Credential Rotation Schedule

| Credential | Last Rotated | Next Rotation | Notes |
|------------|-------------|---------------|-------|
| Vercel Token | March 8, 2026 | Q2 2026 | Check for leaks first |
| Supabase Keys | N/A (auto-managed) | N/A | Supabase handles expiry |
| JWT_SECRET | N/A (not rotated) | ⚠️ ASAP | Generate strong secret |
| Gmail App Password | N/A (auto-generated) | N/A | Revoke if compromised |
| OpenAI API Key | N/A (pending) | Q2 2026 | Set up after first use |

---

## 📞 Emergency Access

**If Tim is unavailable and Lucy needs to deploy:**

1. Vercel token is stored in OpenClaw workspace
2. GitHub SSH keys on local machine
3. Supabase credentials in workspace files
4. Deployment script in `/scripts/deploy.sh`

**Recovery:** All accounts have 2FA enabled (check Google Authenticator)

---

## 🎯 Next Steps

- [ ] Generate strong JWT_SECRET, update all environments
- [ ] Create OpenAI API key, add to Stripe
- [ ] Set up Stripe webhook endpoint
- [ ] Add 2FA to GitHub, Vercel, Supabase
- [ ] Test credential rotation process
- [ ] Document password manager backups

---

**Last Updated:** March 8, 2026 (WorkSafeAI deployment)  
**Maintained by:** Lucy  
**Review Frequency:** Quarterly or after credential changes
