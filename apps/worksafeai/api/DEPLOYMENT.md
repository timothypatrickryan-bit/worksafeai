# Deployment Guide

## Overview

JTSA Backend is production-ready with:
- Environment validation (strict mode)
- Error sanitization (no stack traces)
- Structured JSON logging
- Health checks (liveness + readiness)
- Database migrations (auto-run)
- Secrets management

## Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run successfully
- [ ] Tests passing (`npm test`)
- [ ] No sensitive data in code/logs
- [ ] Stripe keys configured (test or live)
- [ ] Redis configured (or optional graceful fallback)
- [ ] Email service configured (SendGrid or SMTP)
- [ ] CORS origins whitelisted
- [ ] JWT secret changed (production-specific)
- [ ] Database backups scheduled
- [ ] Monitoring/alerting set up

## Environment Setup

### 1. Create Production .env

```bash
# Core
NODE_ENV=production
PORT=3000

# Supabase (use production project)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-key

# Auth
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

# OpenAI
OPENAI_API_KEY=sk-your-production-key

# Stripe (use live keys, not test)
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Redis (optional, production-ready URL)
REDIS_URL=redis://:password@redis.example.com:6379

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-production-key
EMAIL_FROM=noreply@jtsa-tool.com

# App
APP_URL=https://api.jtsa-tool.com
ALLOWED_ORIGINS=https://app.jtsa-tool.com,https://dashboard.jtsa-tool.com
```

### 2. Run Environment Validation

```bash
npm start
# Should see: ✓ Environment validation passed
```

If validation fails, errors will be printed and process exits.

## Deployment Options

### Option A: Heroku

```bash
# Install Heroku CLI
brew install heroku

# Login and create app
heroku login
heroku create jtsa-backend

# Set environment variables
heroku config:set NODE_ENV=production \
  SUPABASE_URL=... \
  SUPABASE_SERVICE_ROLE_KEY=... \
  JWT_SECRET=... \
  OPENAI_API_KEY=... \
  STRIPE_SECRET_KEY=... \
  STRIPE_WEBHOOK_SECRET=...

# Run migrations on deploy
heroku config:set RUN_MIGRATIONS=true

# Deploy
git push heroku main
```

### Option B: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t jtsa-backend:latest .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  jtsa-backend:latest
```

### Option C: AWS/Google Cloud

#### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Create .ebextensions/00_app.config
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    SUPABASE_URL: $SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY: $SUPABASE_SERVICE_ROLE_KEY
    # ... other env vars

# Deploy
eb init jtsa-backend
eb create production
eb deploy
```

#### Google Cloud Run

```bash
# Deploy container
gcloud run deploy jtsa-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --set-env-vars=NODE_ENV=production,SUPABASE_URL=... \
  --allow-unauthenticated
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health
curl https://api.jtsa-tool.com/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-03-07T07:45:00Z",
#   "uptime": 123.45
# }
```

### 2. Check Readiness

```bash
curl https://api.jtsa-tool.com/health/ready

# Expected response:
# {
#   "status": "ready",
#   "checks": {
#     "database": "ok",
#     "cache": "connected"
#   }
# }
```

### 3. Monitor Logs

```bash
# Local
tail -f logs/app.log

# Heroku
heroku logs --tail

# Docker
docker logs -f container_id

# AWS
aws logs tail /aws/elasticbeanstalk/jtsa-backend/var/log/eb-activity.log --follow
```

## Monitoring & Alerts

### Application Metrics

Set up monitoring for:
- **Error rate**: Errors per minute (alert if > 5%)
- **Response time**: p95 latency (alert if > 1s)
- **Database**: Connection pool usage (alert if > 80%)
- **Cache**: Hit rate (should be > 60% for dashboard)
- **Uptime**: Monitor health endpoint

### Error Tracking

All errors logged with correlation IDs:

```json
{
  "type": "error",
  "correlationId": "err_1234567890_abc123def",
  "message": "Database connection failed",
  "statusCode": 500,
  "timestamp": "2026-03-07T07:45:00Z"
}
```

Use correlation ID to trace errors across logs.

### Structured Logging

All logs are JSON-formatted for easy parsing:

```json
{
  "type": "response",
  "correlationId": "req_1234567890_abc",
  "method": "POST",
  "path": "/api/auth/login",
  "statusCode": 200,
  "duration": "45ms"
}
```

Parse with log aggregation service (DataDog, Splunk, etc).

## Database Backups

### Supabase

Supabase handles backups automatically (7-day retention on Pro plan).

For custom backups:

```bash
# Export database
pg_dump $SUPABASE_URL --file backup.sql

# Restore
psql $SUPABASE_URL --file backup.sql
```

### Migrations

After updating schema:

```bash
# 1. Create migration file
cat > src/db/migrations/NNN_description.sql << 'EOF'
-- Your migration SQL
EOF

# 2. Commit to git
git add src/db/migrations/NNN_description.sql
git commit -m "Add migration: description"

# 3. Deploy code
git push origin main
# Migrations run automatically on startup

# 4. Verify
npm run migrate:status
```

## Secrets Management

### Do's
- ✅ Use environment variables for all secrets
- ✅ Rotate secrets every 90 days
- ✅ Use separate Stripe test and live keys
- ✅ Store secrets in secure vault (1Password, Vault, etc.)
- ✅ Use managed Redis/database (AWS, Google, etc.)

### Don'ts
- ❌ Never commit secrets to git
- ❌ Never hardcode API keys
- ❌ Never log sensitive data
- ❌ Never share .env file
- ❌ Never use same secret across environments

### Rotate JWT Secret

To rotate JWT secret without losing sessions:

1. Generate new secret: `openssl rand -hex 32`
2. Set `JWT_SECRET` to new value
3. Existing tokens still valid for 1 hour
4. Restart server (new tokens use new secret)
5. After 7 days, old refresh tokens expire

## Performance Tuning

### Database
- Index on `company_id`, `created_at`, `status`
- Connection pooling (Supabase handles)
- Archive old data (> 1 year) to separate table

### Cache
- Increase Redis memory if hit rate < 50%
- Monitor `DASHBOARD_STATS` TTL (5 min)
- Increase `JTSA_LIST` TTL if list rarely changes

### Code
- Use async/await (no blocking)
- Connection pooling for email/AI calls
- Batch database queries when possible

## Scaling Considerations

### Horizontal Scaling
- Stateless server (no session store)
- Shared database (Supabase)
- Shared Redis (production Redis service)
- Load balancer routes traffic

### Vertical Scaling
- Increase Node.js worker processes
- Increase Redis memory
- Increase database connection pool

## Troubleshooting

### Server won't start
```bash
# Check env vars
node -e "console.log(process.env)"

# Check migrations
npm run migrate:status

# Check logs
NODE_DEBUG=* npm start
```

### High error rate
```bash
# Check correlation IDs in logs
cat logs/app.log | grep "correlationId" | head -10

# Filter by error type
cat logs/app.log | grep "statusCode.*500"
```

### Database connection issues
```bash
# Test connection
psql $SUPABASE_URL
# Should prompt for password, then show `postgres=>`

# Check connection pool
SELECT count(*) FROM pg_stat_activity;
```

### Redis connection issues
```bash
# Test Redis
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

## Security Checklist (Production)

- [ ] HTTPS enabled (use .com domain, not .xyz)
- [ ] CORS properly configured (specific origins, not *)
- [ ] Rate limiting enabled (auth endpoints)
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection (Helmet headers)
- [ ] CSRF protection (Origin validation)
- [ ] Secrets stored securely (not in logs)
- [ ] Database backups tested
- [ ] Audit logging enabled
- [ ] Error handling sanitized (no stack traces)

## See Also

- `MIGRATIONS.md` — Database versioning
- `TESTING.md` — Running integration tests
- `ENDPOINTS.md` — API documentation
- `CACHING.md` — Redis caching strategy

---

## Support

For deployment issues:
1. Check health endpoint: `curl /health`
2. Review error logs with correlation ID
3. Run migrations: `npm run migrate:status`
4. Check environment variables
5. Verify database/Redis connectivity
