# Deployment Checklist — Quick Reference

Use this checklist every time you deploy an app. Takes ~20 minutes from start to live.

---

## Phase 1: Prep (5 min)

- [ ] Vercel token ready (`https://vercel.com/account/tokens`)
- [ ] Supabase project created + credentials copied
  - [ ] Project URL
  - [ ] Anon key
  - [ ] Service role key
- [ ] Domain name ready (e.g., `app.elevationaiwork.com`)
- [ ] DNS provider access (to add CNAME records)

---

## Phase 2: Deploy to Vercel (10 min)

### Backend
```bash
cd apps/[app]/api

# Add vercel.json (if not present)
# Deploy
vercel deploy --prod --yes --token <TOKEN>

# Note the project ID from .vercel/project.json
```

### Frontend(s)
```bash
cd apps/[app]/web

# Deploy
vercel deploy --prod --yes --token <TOKEN>

# Repeat for other frontends (admin, etc.)
```

---

## Phase 3: Configure Vercel (5 min)

### Get Project IDs
```bash
cat apps/[app]/api/.vercel/project.json          # API project ID
cat apps/[app]/web/.vercel/project.json          # Web project ID
cat apps/[app]/admin/.vercel/project.json        # Admin project ID (if exists)
```

### Set Environment Variables (API calls)

**Frontend Apps:**
```bash
# For each frontend project:
curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://api.vercel.com/v9/projects/PROJECT_ID/env \
  -d '{"key":"VITE_API_URL","value":"https://api.yourdomain.com","type":"plain","target":["production"]}'

curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://api.vercel.com/v9/projects/PROJECT_ID/env \
  -d '{"key":"VITE_SUPABASE_URL","value":"https://xxx.supabase.co","type":"plain","target":["production"]}'

curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://api.vercel.com/v9/projects/PROJECT_ID/env \
  -d '{"key":"VITE_SUPABASE_ANON_KEY","value":"eyJ...","type":"plain","target":["production"]}'
```

**Backend App:**
```bash
# For backend project:
curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://api.vercel.com/v9/projects/PROJECT_ID/env \
  -d '{"key":"NODE_ENV","value":"production","type":"plain","target":["production"]}'

# ... repeat for each variable (SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET, etc.)
```

### Add Custom Domains
```bash
# For each domain:
curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://api.vercel.com/v9/projects/PROJECT_ID/domains \
  -d '{"name":"subdomain.yourdomain.com"}'

# Example:
# worksafeai.elevationaiwork.com → main frontend
# superadmin.elevationaiwork.com → admin frontend
# worksafeai-api.elevationaiwork.com → backend
```

---

## Phase 4: DNS Setup (5 min)

Go to your domain provider (GoDaddy, Namecheap, etc.):

Add CNAME records:
```
subdomain          CNAME       cname.vercel.com
worksafeai         CNAME       cname.vercel.com
superadmin         CNAME       cname.vercel.com
worksafeai-api     CNAME       cname.vercel.com
```

**Wait 5-30 minutes for DNS to propagate.**

---

## Phase 5: Verify (5 min)

- [ ] `https://app.yourdomain.com` loads (frontend)
- [ ] Can login (frontend calls backend)
- [ ] Can create resource (API works)
- [ ] Admin dashboard loads
- [ ] API health check: `curl https://api.yourdomain.com/health`

---

## Troubleshooting

**Blank page on frontend?**
- Check env vars in Vercel (VITE_API_URL, VITE_SUPABASE_URL)
- Check browser console (Settings → DevTools)
- Verify API URL is accessible

**401 errors from API?**
- Backend env vars set? (SUPABASE_URL, JWT_SECRET)
- CORS configured? (CORS_ORIGIN should include frontend URLs)
- Check backend logs in Vercel dashboard

**DNS not resolving?**
- Wait 10+ minutes (DNS caches)
- Verify CNAME records added correctly
- Check with: `dig subdomain.yourdomain.com`

**API calls work locally but not in production?**
- Frontend env vars need VITE_API_URL (production API URL)
- Backend CORS_ORIGIN needs frontend URLs
- JWT secret must match (dev vs prod)

---

## Rollback

If something breaks:

```bash
cd apps/[app]/web
vercel rollback --prod --token <TOKEN>  # Revert to previous version
```

---

## Monitoring

After deploy, check:
- [ ] Vercel dashboard → Deployments (no errors?)
- [ ] Backend logs: Vercel → Project → Functions (any runtime errors?)
- [ ] Sentry/monitoring (if configured)
- [ ] User reports (test account login)

---

**Time Estimate:** 20 minutes (5 min prep + 10 min deploy + 5 min verify)  
**Frequency:** Each new app or major update  
**Status:** Tested on WorkSafeAI (March 8, 2026)
