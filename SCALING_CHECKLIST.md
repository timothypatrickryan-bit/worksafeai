# Scaling Checklist

> What to verify before scaling to 10+ apps. Check these before each new app launch.
> Generated: 2026-03-08

---

## Pre-Launch Checklist (Every New App)

### Infrastructure ✅
- [ ] Vercel project created with correct framework preset
- [ ] Cloudflare subdomain configured (CNAME → Vercel)
- [ ] SSL certificate active (Cloudflare handles this)
- [ ] Environment variables set in Vercel (production + preview)
- [ ] `.env.example` up to date with all required vars
- [ ] Health check endpoint (`/health`) responding 200

### Security ✅
- [ ] `JWT_SECRET` is unique (or intentionally shared for SSO)
- [ ] `JWT_REFRESH_SECRET` is set and different from `JWT_SECRET`
- [ ] `ALLOWED_ORIGINS` is restrictive (no wildcards in production)
- [ ] Rate limiting on: `/auth/login`, `/auth/register`, `/auth/refresh-token`, `/auth/forgot-password`
- [ ] Helmet security headers enabled
- [ ] CSRF origin validation enabled for production
- [ ] Body size limit set (`express.json({ limit: '1mb' })`)
- [ ] Password policy enforced (12+ chars, complexity)
- [ ] Email verification required in production
- [ ] No PII in JWT payloads (email removed, only id/role/companyId)
- [ ] Zod validation on ALL POST/PUT/PATCH endpoints
- [ ] UUID format validation on all ID parameters
- [ ] Company access middleware on tenant-scoped endpoints

### Database ✅
- [ ] Migrations run successfully
- [ ] Migration tracking table exists
- [ ] RLS policies configured (if using Supabase RLS)
- [ ] Indexes on frequently queried columns
- [ ] Audit log table exists and logging works
- [ ] Email verification tokens table exists
- [ ] Password reset tokens table exists

### Frontend ✅
- [ ] ErrorBoundary wrapping entire app
- [ ] Toast/notification system connected
- [ ] Auth store initialized on mount
- [ ] 401 handling (redirect to login)
- [ ] Loading states on all async operations
- [ ] Empty states on all data lists
- [ ] Mobile responsive layout
- [ ] `<title>` and meta tags set correctly

### Monitoring ✅
- [ ] Structured logging enabled (JSON format)
- [ ] Correlation IDs in request/response headers
- [ ] Graceful shutdown handler (SIGTERM, SIGINT)
- [ ] Unhandled rejection handler
- [ ] Error handler is last middleware

---

## Scaling Infrastructure Readiness

### At 3 Apps
- [ ] Monorepo tooling set up (pnpm workspaces or turborepo)
- [ ] Shared packages extracted (`@elevationai/ui`, `@elevationai/auth`, etc.)
- [ ] Shared Tailwind config preset

### At 5 Apps
- [ ] CI/CD pipeline (GitHub Actions → Vercel)
- [ ] Automated tests running in CI
- [ ] Dependency update automation (Renovate or Dependabot)
- [ ] Shared component documentation (Storybook or similar)
- [ ] Error tracking service (Sentry) integrated

### At 7 Apps
- [ ] Centralized logging (if not already via Vercel)
- [ ] Performance monitoring per app
- [ ] Database connection pooling strategy
- [ ] Consider shared auth service (SSO across apps)
- [ ] Consider shared billing service

### At 10 Apps
- [ ] Full CI/CD with staging environments
- [ ] Automated security scanning
- [ ] Infrastructure-as-code for Vercel/Cloudflare config
- [ ] Runbook documentation for incident response
- [ ] On-call rotation (even if solo — documented procedures)

---

## Performance Checklist

### Frontend
- [ ] Bundle size < 500KB gzipped
- [ ] First Contentful Paint < 2s
- [ ] No unnecessary re-renders (React DevTools check)
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting on routes (React.lazy)
- [ ] Service worker for offline support (if applicable)

### Backend
- [ ] API response time < 200ms (p95) for CRUD operations
- [ ] Database queries use indexes
- [ ] N+1 query prevention (eager loading where needed)
- [ ] Redis caching for expensive queries (dashboard stats, analytics)
- [ ] Connection pooling for database
- [ ] Request body size limit enforced

### Infrastructure
- [ ] CDN for static assets (Vercel handles this)
- [ ] Gzip/Brotli compression enabled
- [ ] Keep-alive connections
- [ ] DNS resolution time < 50ms

---

## Cost Tracking Per App

| Resource | Free Tier | Paid Threshold | Estimated Cost/App |
|----------|-----------|----------------|--------------------|
| Vercel (frontend) | 100GB bandwidth | 100GB+ | $20/mo |
| Vercel (API serverless) | 100GB-hrs | High usage | $0-20/mo |
| Supabase | 500MB DB, 50k auth | Scale plan | $25/mo |
| Cloudflare | Unlimited DNS | - | $0 |
| Redis (Upstash) | 10k commands/day | High usage | $0-10/mo |
| Sentry | 5k errors/mo | Above limit | $0-26/mo |
| SendGrid | 100 emails/day | Above limit | $0-20/mo |

**Estimated cost per app:** $25-100/mo depending on usage
**10 apps:** $250-1000/mo

---

## Security Audit Schedule

### Weekly (automated)
- Dependency vulnerability scan (`npm audit`)
- SSL certificate validity check
- Health endpoint monitoring

### Monthly (Lucy-assisted)
- Review rate limiting effectiveness (are limits being hit?)
- Check for exposed secrets in code
- Review audit logs for anomalies
- Verify CORS configuration accuracy

### Quarterly
- Full security review of auth flows
- Review and rotate JWT secrets
- Check for deprecated dependencies
- Penetration testing (basic)

---

## Disaster Recovery

### Backup Strategy
- [ ] Supabase automatic backups enabled
- [ ] Manual backup procedure documented
- [ ] Backup restoration tested at least once

### Recovery Procedures
- [ ] "App is down" runbook
- [ ] "Database is corrupted" runbook
- [ ] "Secret is leaked" runbook (rotate JWT secrets, invalidate all tokens)
- [ ] "Dependency is compromised" runbook

### Recovery Time Objectives
- Frontend down: < 15 minutes (Vercel redeploy)
- Backend down: < 30 minutes (Vercel/Render redeploy)
- Database issue: < 1 hour (Supabase support + backup restore)
- Secret rotation: < 2 hours (update all apps, redeploy)
