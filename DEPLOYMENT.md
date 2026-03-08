# WorkSafeAI Production Deployment Guide

**Status:** Ready for production deployment  
**Timeline:** 48-72 hours to go live  
**Cost:** ~$200-300/month

---

## 📋 PREREQUISITE CHECKLIST

Before starting deployment:

- [ ] All API services created and tested
- [ ] SuperAdmin connected to real API (locally working)
- [ ] All environment variables documented
- [ ] Domain name registered (worksafeai.com)
- [ ] Stripe account created (for billing)
- [ ] SendGrid account configured (for email)
- [ ] GitHub/Git ready (for CI/CD)
- [ ] Credit card ready for infrastructure costs

---

## 🚀 PHASE 1: BACKEND DEPLOYMENT (Railway)

### Step 1: Create Railway Account

```bash
# Visit https://railway.app
# Sign up with GitHub (recommended)
# Create new project
```

### Step 2: Configure PostgreSQL Database

```bash
# In Railway dashboard:
# 1. Click "Add Service"
# 2. Select "PostgreSQL"
# 3. Wait for provisioning (~2 min)
# 4. Copy DATABASE_URL from variables
```

### Step 3: Deploy Backend Code

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# In backend directory
cd /Users/timothyryan/.openclaw/workspace/apps/worksafeai/api

# Create new Railway project
railway init
# Select "Create new project"
# Name it "worksafeai-api"

# Link PostgreSQL plugin
# (Railway dashboard > Add Service > PostgreSQL)

# Set environment variables
railway vars set NODE_ENV=production
railway vars set JWT_SECRET=$(openssl rand -base64 32)
railway vars set ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
railway vars set STRIPE_SECRET_KEY=sk_test_xxxxx
railway vars set ALLOWED_ORIGINS=https://app.worksafeai.com,https://admin.worksafeai.com
# ... (add all other .env vars from .env.example)

# Deploy
railway up

# Get production URL
railway environment production vars get API_URL
# Should output: https://worksafeai-api-xxxxx.up.railway.app
```

### Step 4: Verify Backend Health

```bash
# Test health endpoint
curl https://worksafeai-api-xxxxx.up.railway.app/health
# Expected: { "status": "ok" }

# Test database connection
curl -X GET https://worksafeai-api-xxxxx.up.railway.app/api/health
# Should return 200 OK
```

---

## 🚀 PHASE 2: FRONTEND DEPLOYMENT (Vercel)

### Step 1: Create Vercel Account

```bash
# Visit https://vercel.com
# Sign up with GitHub
# Import projects from Git
```

### Step 2: Deploy WorkSafeAI Web App

```bash
# Install Vercel CLI
npm install -g vercel

# In web app directory
cd /Users/timothyryan/.openclaw/workspace/apps/worksafeai/web

# Deploy to production
vercel --prod \
  --env VITE_API_BASE_URL=https://worksafeai-api-xxxxx.up.railway.app \
  --env VITE_ENV=production

# Note: Copy the production URL
# Example: https://worksafeai.vercel.app
```

### Step 3: Deploy SuperAdmin Console

```bash
# In SuperAdmin directory
cd /Users/timothyryan/.openclaw/workspace/apps/super-admin

# Deploy to production
vercel --prod \
  --env VITE_API_BASE_URL=https://worksafeai-api-xxxxx.up.railway.app \
  --env VITE_ENV=production

# Note: Copy the production URL
# Example: https://admin-worksafeai.vercel.app
```

### Step 4: Verify Frontend Health

```bash
# Test Web App
curl https://worksafeai.vercel.app
# Should return HTML (200 OK)

# Test SuperAdmin
curl https://admin-worksafeai.vercel.app
# Should return HTML (200 OK)
```

---

## 🌐 PHASE 3: DOMAIN SETUP

### Step 1: Register Domain

**Option A: Namecheap (Recommended)**
```
1. Visit namecheap.com
2. Search "worksafeai.com"
3. Purchase for 1 year (~$15)
4. Add to cart, checkout
```

**Option B: Route53 (if using AWS)**
```bash
aws route53 register-domain \
  --domain-name worksafeai.com \
  --contact-type REGISTRANT \
  --duration-years 1
```

### Step 2: Configure DNS Records

**For Namecheap:**
1. Login to Namecheap account
2. Go to "Domain List"
3. Click "Manage" on worksafeai.com
4. Go to "Advanced DNS" tab
5. Add these records:

```
Type: CNAME
Host: app
Value: worksafeai.vercel.app
TTL: 3600

Type: CNAME
Host: admin
Value: admin-worksafeai.vercel.app
TTL: 3600

Type: CNAME
Host: api
Value: worksafeai-api-xxxxx.up.railway.app
TTL: 3600

Type: MX
Host: @
Value: 10 aspmx.l.google.com
TTL: 3600
```

### Step 3: Update Application URLs

**Backend .env (Railway):**
```bash
railway vars set ALLOWED_ORIGINS=https://app.worksafeai.com,https://admin.worksafeai.com
```

**Frontend .env (Vercel):**
- WorkSafeAI Web: `VITE_API_BASE_URL=https://api.worksafeai.com`
- SuperAdmin: `VITE_API_BASE_URL=https://api.worksafeai.com`

### Step 4: Enable SSL Certificates

```bash
# Vercel: Automatic (handled by Vercel)
# Railway: Automatic (handled by Railway)
# Add domain to Vercel project settings
```

---

## 🔐 PHASE 4: SECURITY HARDENING

### Step 1: Generate Strong Secrets

```bash
# Generate JWT_SECRET (32+ characters)
openssl rand -base64 32

# Generate API Keys for Stripe, SendGrid, etc.
# Store in secure password manager (1Password, LastPass, etc.)
```

### Step 2: Configure CORS

**In backend .env:**
```bash
ALLOWED_ORIGINS=https://app.worksafeai.com,https://admin.worksafeai.com
ALLOWED_DOMAINS=worksafeai.com
```

### Step 3: Enable HTTPS

```bash
# Vercel: Automatic ✅
# Railway: Automatic ✅
# Both provide free SSL certificates
```

### Step 4: Add Security Headers

**Already in backend code:**
```javascript
// server.js
const helmet = require('helmet');
app.use(helmet()); // Adds security headers
```

---

## 📊 PHASE 5: MONITORING & ALERTS

### Step 1: Setup Sentry (Error Tracking)

```bash
# Visit https://sentry.io
# Create account
# Create project for Node.js (backend)
# Copy DSN

# Update backend .env
railway vars set SENTRY_DSN=https://xxx@sentry.io/xxx

# Create project for React (frontend)
# Copy DSN

# Update frontend apps' .env
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Step 2: Setup Vercel Analytics

```bash
# In Vercel dashboard:
# 1. Select project
# 2. Settings > Analytics
# 3. Enable "Web Analytics"
# 4. Copy tracking ID

# Update frontend apps with tracking code
```

### Step 3: Setup Uptime Monitoring

```bash
# Visit https://uptimerobot.com
# Create account
# Add monitors for:
# - https://api.worksafeai.com/health (backend)
# - https://app.worksafeai.com (frontend)
# - https://admin.worksafeai.com (admin)

# Set alerts to email
```

### Step 4: Setup Log Aggregation

```bash
# Railway: Automatic logs available in dashboard
# Vercel: Automatic logs available in dashboard
# Review daily for errors

# Optional: LogRocket for frontend session replay
# Visit logrocket.com, create account, integrate
```

---

## 🧪 PHASE 6: PRODUCTION TESTING

### Step 1: Smoke Testing

```bash
# Test critical flows on production:

# 1. Backend API
curl https://api.worksafeai.com/health

# 2. Frontend Login
# Visit https://app.worksafeai.com
# Login with test account

# 3. SuperAdmin Access
# Visit https://admin.worksafeai.com
# Login with admin account

# 4. Create Company (in SuperAdmin)
# Visit https://admin.worksafeai.com/companies/create
# Fill form and submit

# 5. View Companies List
# Visit https://admin.worksafeai.com/companies
# Verify pagination works

# 6. Export Data
# Click export button, verify CSV downloads
```

### Step 2: Load Testing

```bash
# Use Apache Bench or Artillery
npm install -g artillery

# Test backend capacity
artillery quick --count 100 --num 10 https://api.worksafeai.com/health

# Expected: <200ms response time, 0% errors
```

### Step 3: Full E2E Test

```
1. Register new account on https://app.worksafeai.com
2. Complete onboarding workflow
3. Create company (in SuperAdmin)
4. Create project
5. Create JTSA with AI hazards
6. View in SuperAdmin dashboard
7. Export report
8. Verify email notifications sent
```

### Step 4: Browser Testing

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile iOS (Safari)
- [ ] Mobile Android (Chrome)

---

## 📈 PHASE 7: POST-LAUNCH MONITORING

### Day 1 (Launch Day)
- [ ] Monitor error logs every 15 minutes
- [ ] Check uptime monitoring dashboard
- [ ] Test critical user flows
- [ ] Have rollback plan ready

### Week 1
- [ ] Review error trends
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Fix any critical bugs
- [ ] Monitor database performance

### Ongoing
- [ ] Daily log review
- [ ] Weekly performance analysis
- [ ] Monthly security audit
- [ ] Database backup verification
- [ ] Cost monitoring

---

## 🔄 ROLLBACK PROCEDURE

If something goes wrong:

```bash
# Option 1: Revert to Previous Version (Vercel)
# In Vercel dashboard > Deployments > Select previous > Rollback

# Option 2: Revert Backend (Railway)
# In Railway dashboard > Logs > Select previous build > Rollback

# Option 3: Emergency DNS Change
# In Namecheap: Point api.worksafeai.com to backup server
# In Namecheap: Point app.worksafeai.com to maintenance page
```

---

## 💰 COST BREAKDOWN

| Service | Cost | Notes |
|---------|------|-------|
| Railway (Backend) | $7-20 | Scales with usage |
| Vercel (2 Frontends) | $20 | Fixed for pro tier |
| Supabase (Database) | $25 | Production tier |
| SendGrid (Email) | $20 | 40K emails/month |
| Sentry (Monitoring) | $29 | Error tracking |
| Domain (Annual) | $15 | One-time |
| Namecheap SSL | Free | Included with Vercel/Railway |
| LogRocket (Optional) | $99 | Session replay |
| **Total/Month** | **$200-300** | Scales with users |

---

## 📞 SUPPORT & DOCUMENTATION

**If something breaks:**

1. **Check error logs** (Sentry, Railway, Vercel dashboards)
2. **Review recent changes** (what was deployed last?)
3. **Check health endpoints** (backend, frontend)
4. **Verify database** (Supabase dashboard)
5. **Check network** (DNS records correct?)
6. **Contact platform support** (Railway, Vercel)

**Key Contacts:**
- Railway Support: https://railway.app/support
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Sentry Support: https://sentry.io/support

---

## ✅ FINAL CHECKLIST

Before going live:

**Infrastructure**
- [ ] PostgreSQL database created
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Domain configured
- [ ] SSL certificates active
- [ ] DNS records verified

**Application**
- [ ] API keys configured (Anthropic, Stripe, SendGrid)
- [ ] Email notifications working
- [ ] Database migrations applied
- [ ] Admin account created
- [ ] Test accounts created

**Security**
- [ ] JWT_SECRET strong (32+ chars)
- [ ] CORS configured
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] Error messages sanitized
- [ ] No hardcoded secrets

**Monitoring**
- [ ] Sentry connected
- [ ] Uptime monitoring active
- [ ] Error alerts configured
- [ ] Performance tracking enabled
- [ ] Logs accessible
- [ ] Backup plan documented

**Testing**
- [ ] Smoke tests passed
- [ ] Load test passed
- [ ] E2E tests passed
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit passed

**Documentation**
- [ ] Deployment guide saved
- [ ] Runbook created
- [ ] Incident response plan ready
- [ ] Team trained on procedures

---

**Status:** Ready for deployment  
**Estimated Time:** 4-6 hours total  
**Estimated Cost:** $200-300/month ongoing  
**Target Launch:** This Weekend (Sunday night)

---

**Next Step:** Execute Phase 1 (Backend Deployment)

